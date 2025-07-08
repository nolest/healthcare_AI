#!/bin/bash

# 修复MongoDB认证问题
echo "🔧 修复MongoDB认证问题..."

cd /home/ubuntu/code/healthcare_AI/healthcare_backend

# 1. 停止所有容器
echo "🛑 停止所有容器..."
docker-compose down

# 2. 清理MongoDB数据卷（重新初始化数据库）
echo "🧹 清理MongoDB数据卷..."
docker volume rm healthcare_backend_mongodb_data 2>/dev/null || echo "数据卷不存在或已清理"

# 3. 修复docker-compose.yml中的MongoDB配置
echo "🔧 修复MongoDB配置..."
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
      MONGO_INITDB_DATABASE: healthcare_ai
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

# 4. 启动MongoDB并等待初始化
echo "🚀 启动MongoDB..."
docker-compose up -d mongodb

# 5. 等待MongoDB初始化完成
echo "⏳ 等待MongoDB初始化..."
sleep 15

# 6. 检查MongoDB状态
echo "📊 检查MongoDB状态..."
docker-compose logs mongodb --tail=10

# 7. 启动其他服务
echo "🚀 启动其他服务..."
docker-compose up -d

# 8. 等待所有服务启动
echo "⏳ 等待所有服务启动..."
sleep 20

# 9. 检查所有容器状态
echo "📊 检查所有容器状态..."
docker-compose ps

# 10. 测试MongoDB连接
echo "🔗 测试MongoDB连接..."
docker exec healthcare-mongodb mongosh --eval "db.adminCommand('ping')" || echo "MongoDB连接测试失败"

# 11. 查看API日志
echo "📋 查看API日志..."
docker-compose logs healthcare-api --tail=20

# 12. 测试API健康状态
echo "🏥 测试API健康状态..."
sleep 10
curl -f http://localhost:7723/api/health || echo "API还在启动中，请稍等..."

echo "✅ MongoDB认证修复完成！"
echo "🌐 请访问 http://43.134.141.188:6886/ 测试完整功能"
echo "📊 数据库管理: http://43.134.141.188:6886/db/" 