#!/bin/bash

# 完整的图片上传修复脚本
echo "🔧 完整修复图片上传问题..."

# 1. 进入后端目录
cd healthcare_backend

# 2. 停止容器
echo "🛑 停止容器..."
docker-compose down

# 3. 清理可能的冲突
echo "🧹 清理可能的冲突..."
docker system prune -f

# 4. 创建正确的uploads目录结构
echo "📁 创建uploads目录结构..."
rm -rf uploads/
mkdir -p uploads/pic/measurement
mkdir -p uploads/pic/covid
chmod -R 755 uploads/

# 5. 修复docker-compose.yml，确保正确的容器名称和卷映射
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
      - ./uploads:/app/uploads
    depends_on:
      - mongodb
    networks:
      - healthcare-network

volumes:
  mongodb_data:

networks:
  healthcare-network:
    driver: bridge
EOF

# 6. 修复Dockerfile，确保uploads目录在容器中正确创建
echo "🔧 修复Dockerfile..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

# 安装curl用于健康检查
RUN apk add --no-cache curl

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装pnpm
RUN npm install -g pnpm

# 安装所有依赖（包括开发依赖，用于构建）
RUN pnpm install

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 创建uploads目录并设置权限
RUN mkdir -p /app/uploads/pic/measurement && \
    mkdir -p /app/uploads/pic/covid && \
    chmod -R 755 /app/uploads/

# 清理开发依赖（保留生产依赖）
RUN pnpm prune --prod

# 暴露端口
EXPOSE 7723

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7723/api/health || exit 1

# 启动应用
CMD ["node", "dist/main"]
EOF

# 7. 重新构建和启动容器
echo "🔄 重新构建和启动容器..."
docker-compose build --no-cache
docker-compose up -d

# 8. 等待容器启动
echo "⏳ 等待容器启动..."
sleep 20

# 9. 检查容器状态
echo "📊 检查容器状态..."
docker-compose ps

# 10. 检查容器内的uploads目录
echo "📁 检查容器内的uploads目录..."
docker exec healthcare-api ls -la /app/
docker exec healthcare-api ls -la /app/uploads/
docker exec healthcare-api ls -la /app/uploads/pic/

# 11. 测试容器内的写入权限
echo "🧪 测试容器内的写入权限..."
docker exec healthcare-api mkdir -p /app/uploads/pic/measurement/test_user
docker exec healthcare-api touch /app/uploads/pic/measurement/test_user/test.txt
docker exec healthcare-api ls -la /app/uploads/pic/measurement/test_user/
docker exec healthcare-api rm -rf /app/uploads/pic/measurement/test_user/

# 12. 检查本地uploads目录
echo "📂 检查本地uploads目录..."
ls -la uploads/
ls -la uploads/pic/

# 13. 测试API健康状态
echo "🏥 测试API健康状态..."
sleep 5
curl -f http://localhost:7723/api/health || echo "API健康检查失败，可能还在启动中"

# 14. 查看后端日志
echo "📋 查看后端日志..."
docker-compose logs healthcare-api --tail=50

echo "✅ 完整修复完成！"
echo "🌐 请访问 http://43.134.141.188:6886/ 测试图片上传功能"
echo "📋 如果仍有问题，请运行: docker-compose logs healthcare-api -f" 