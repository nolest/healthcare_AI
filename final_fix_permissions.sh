#!/bin/bash

# 最终权限修复脚本
echo "🔧 最终权限修复脚本..."

cd /home/ubuntu/code/healthcare_AI/healthcare_backend

# 1. 停止容器
echo "🛑 停止容器..."
docker-compose down

# 2. 修复Dockerfile，确保正确的权限设置
echo "🔧 修复Dockerfile权限设置..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

# 安装curl用于健康检查
RUN apk add --no-cache curl

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 清理开发依赖
RUN npm ci --only=production && npm cache clean --force

# 创建uploads目录并设置权限（在复制代码之后）
RUN mkdir -p /app/uploads/pic/measurement && \
    mkdir -p /app/uploads/pic/covid && \
    chmod -R 777 /app/uploads

# 创建用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# 设置uploads目录的所有权和权限
RUN chown -R nestjs:nodejs /app/uploads && \
    chmod -R 777 /app/uploads

# 设置应用目录所有权
RUN chown -R nestjs:nodejs /app

# 切换到非root用户
USER nestjs

# 暴露端口
EXPOSE 7723

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7723/api/health || exit 1

# 启动应用
CMD ["node", "dist/main"]
EOF

# 3. 确保本地uploads目录有正确的权限
echo "📁 设置本地uploads目录权限..."
sudo mkdir -p uploads/pic/measurement
sudo mkdir -p uploads/pic/covid
sudo chmod -R 777 uploads/
sudo chown -R ubuntu:ubuntu uploads/

# 4. 修复docker-compose.yml，确保正确的卷映射
echo "🔧 修复docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: healthcare-mongodb
    restart: unless-stopped
    ports:
      - "8899:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: healthcare123
    volumes:
      - mongodb_data:/data/db
    networks:
      - healthcare-network

  mongo-express:
    image: mongo-express
    container_name: healthcare-mongo-express
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: healthcare123
      ME_CONFIG_MONGODB_URL: mongodb://admin:healthcare123@mongodb:27017/
      ME_CONFIG_BASICAUTH: 'false'
    depends_on:
      - mongodb
    networks:
      - healthcare-network

  healthcare-api:
    build: .
    container_name: healthcare-api
    restart: unless-stopped
    ports:
      - "7723:7723"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:healthcare123@mongodb:27017/healthcare_ai?authSource=admin
      - JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
      - PORT=7723
    volumes:
      - ./uploads:/app/uploads:rw
    depends_on:
      - mongodb
    networks:
      - healthcare-network
    user: "1001:1001"

volumes:
  mongodb_data:

networks:
  healthcare-network:
    driver: bridge
EOF

# 5. 修复multer配置，使用更宽松的权限
echo "📝 修复multer配置..."
cat > src/config/multer.config.ts << 'EOF'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { generateUniformFilename } from '../utils/filename.utils';

// 创建通用的multer配置工厂函数
export const createMulterConfig = (businessType: 'measurement' | 'covid' = 'measurement'): MulterOptions => ({
  storage: diskStorage({
    destination: (req, file, cb) => {
      try {
        // 根据用户ID和业务类型创建文件夹
        const userId = (req as any).user?._id || (req as any).user?.id || 'temp';
        
        // 使用绝对路径
        const baseUploadPath = '/app/uploads/pic/' + businessType;
        const uploadPath = join(baseUploadPath, String(userId));
        
        console.log(`[${new Date().toISOString()}] 📁 Upload destination (${businessType}):`, uploadPath);
        console.log(`[${new Date().toISOString()}] 👤 User ID:`, userId);
        
        // 确保基础上传目录存在
        if (!existsSync(baseUploadPath)) {
          console.log(`[${new Date().toISOString()}] 🔧 Creating base directory:`, baseUploadPath);
          mkdirSync(baseUploadPath, { recursive: true, mode: 0o777 });
        }
        
        // 确保用户特定目录存在
        if (!existsSync(uploadPath)) {
          console.log(`[${new Date().toISOString()}] 🔧 Creating user directory:`, uploadPath);
          mkdirSync(uploadPath, { recursive: true, mode: 0o777 });
          console.log(`[${new Date().toISOString()}] ✅ Directory created successfully`);
        } else {
          console.log(`[${new Date().toISOString()}] ✅ Directory already exists`);
        }
        
        cb(null, uploadPath);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Error in multer destination:`, error);
        console.error(`[${new Date().toISOString()}] ❌ Error stack:`, error.stack);
        cb(error, null);
      }
    },
    filename: (req, file, cb) => {
      try {
        const filename = generateUniformFilename(file.originalname);
        console.log(`[${new Date().toISOString()}] 📝 Generated filename:`, filename);
        cb(null, filename);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Error generating filename:`, error);
        cb(error, null);
      }
    },
  }),
  fileFilter: (req, file, cb) => {
    try {
      console.log(`[${new Date().toISOString()}] 🔍 File filter - mimetype:`, file.mimetype);
      
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
      if (allowedMimes.includes(file.mimetype)) {
        console.log(`[${new Date().toISOString()}] ✅ File filter passed`);
        cb(null, true);
      } else {
        const error = new Error(`只允许上传图片文件 (JPEG, PNG, GIF, WebP)，当前文件类型: ${file.mimetype}`);
        console.error(`[${new Date().toISOString()}] ❌ File filter error:`, error.message);
        cb(error, false);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ File filter error:`, error);
      cb(error, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 限制
    files: 5, // 最多5个文件
  },
});

// 向后兼容的默认配置
export const multerConfig: MulterOptions = createMulterConfig('measurement');
EOF

# 6. 重新构建容器
echo "🔄 重新构建容器..."
docker-compose build --no-cache

# 7. 启动容器
echo "🚀 启动容器..."
docker-compose up -d

# 8. 等待容器启动
echo "⏳ 等待容器启动..."
sleep 25

# 9. 检查容器状态
echo "📊 检查容器状态..."
docker-compose ps

# 10. 验证容器内权限
echo "🔍 验证容器内权限..."
docker exec healthcare-api ls -la /app/uploads/
docker exec healthcare-api ls -la /app/uploads/pic/
docker exec healthcare-api ls -la /app/uploads/pic/measurement/

# 11. 测试目录创建权限
echo "🧪 测试目录创建权限..."
TEST_USER="test_user_$(date +%s)"
docker exec healthcare-api mkdir -p "/app/uploads/pic/measurement/${TEST_USER}"
if [ $? -eq 0 ]; then
    echo "✅ 目录创建成功"
    docker exec healthcare-api touch "/app/uploads/pic/measurement/${TEST_USER}/test.txt"
    if [ $? -eq 0 ]; then
        echo "✅ 文件创建成功"
        docker exec healthcare-api ls -la "/app/uploads/pic/measurement/${TEST_USER}/"
        docker exec healthcare-api rm -rf "/app/uploads/pic/measurement/${TEST_USER}"
    else
        echo "❌ 文件创建失败"
    fi
else
    echo "❌ 目录创建失败"
fi

# 12. 查看后端日志
echo "📋 查看后端日志..."
docker-compose logs healthcare-api --tail=20

# 13. 测试API健康状态
echo "🏥 测试API健康状态..."
sleep 5
curl -f http://localhost:7723/api/health || echo "API可能还在启动中"

echo "✅ 最终权限修复完成！"
echo "🌐 请访问 http://43.134.141.188:6886/ 测试图片上传功能"
echo "📋 如果仍有问题，请运行: docker-compose logs healthcare-api --tail=50" 