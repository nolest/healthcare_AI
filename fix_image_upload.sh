#!/bin/bash

# 修复图片上传问题的脚本
# 问题：Docker容器内的uploads目录权限和创建问题

echo "🔧 修复图片上传问题..."

# 1. 检查容器状态
echo "📊 检查容器状态..."
docker ps | grep healthcare

# 2. 停止容器
echo "🛑 停止容器..."
docker-compose down

# 3. 检查并创建本地uploads目录
echo "📁 检查并创建本地uploads目录..."
mkdir -p healthcare_backend/uploads/pic/measurement
mkdir -p healthcare_backend/uploads/pic/covid
chmod -R 755 healthcare_backend/uploads/

# 4. 修复Dockerfile中的uploads目录处理
echo "🔧 修复Dockerfile..."
cat > healthcare_backend/Dockerfile << 'EOF'
FROM node:18-alpine

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

# 创建uploads目录并设置权限
RUN mkdir -p /app/uploads/pic/measurement && \
    mkdir -p /app/uploads/pic/covid && \
    chmod -R 755 /app/uploads/

# 构建应用
RUN pnpm run build

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

# 5. 修复docker-compose.yml中的volumes映射
echo "🔧 修复docker-compose.yml..."
cat > healthcare_backend/docker-compose.yml << 'EOF'
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: healthcare_mongodb
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
    image: mongo-express:latest
    container_name: healthcare_mongo_express
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

  backend:
    build: .
    container_name: healthcare_backend_container
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
      - upload_data:/app/uploads
    depends_on:
      - mongodb
    networks:
      - healthcare-network

volumes:
  mongodb_data:
  upload_data:

networks:
  healthcare-network:
    driver: bridge
EOF

# 6. 创建一个测试上传目录权限的脚本
echo "📝 创建测试上传权限的脚本..."
cat > test_upload_permissions.sh << 'EOF'
#!/bin/bash

echo "🧪 测试上传目录权限..."

# 检查目录是否存在
if [ -d "healthcare_backend/uploads" ]; then
    echo "✅ uploads目录存在"
else
    echo "❌ uploads目录不存在"
    mkdir -p healthcare_backend/uploads/pic/measurement
    mkdir -p healthcare_backend/uploads/pic/covid
fi

# 检查权限
echo "📋 当前uploads目录权限:"
ls -la healthcare_backend/uploads/

# 测试写入权限
echo "🧪 测试写入权限..."
touch healthcare_backend/uploads/test_file.txt
if [ $? -eq 0 ]; then
    echo "✅ 写入权限正常"
    rm healthcare_backend/uploads/test_file.txt
else
    echo "❌ 写入权限异常"
fi

# 设置正确的权限
echo "🔧 设置正确的权限..."
chmod -R 755 healthcare_backend/uploads/
chown -R $USER:$USER healthcare_backend/uploads/

echo "✅ 权限设置完成"
EOF

chmod +x test_upload_permissions.sh

# 7. 重新构建和启动容器
echo "🔄 重新构建和启动容器..."
cd healthcare_backend
docker-compose build --no-cache
docker-compose up -d

# 8. 等待容器启动
echo "⏳ 等待容器启动..."
sleep 10

# 9. 检查容器状态
echo "📊 检查容器状态..."
docker-compose ps

# 10. 检查容器内的uploads目录
echo "📁 检查容器内的uploads目录..."
docker exec healthcare_backend_container ls -la /app/uploads/
docker exec healthcare_backend_container ls -la /app/uploads/pic/

# 11. 测试容器内的写入权限
echo "🧪 测试容器内的写入权限..."
docker exec healthcare_backend_container touch /app/uploads/test_write.txt
docker exec healthcare_backend_container ls -la /app/uploads/test_write.txt
docker exec healthcare_backend_container rm /app/uploads/test_write.txt

# 12. 查看后端日志
echo "📋 查看后端日志..."
docker-compose logs backend --tail=50

echo "✅ 图片上传问题修复完成！"
echo "🌐 请访问 http://43.134.141.188:6886/ 测试图片上传功能" 