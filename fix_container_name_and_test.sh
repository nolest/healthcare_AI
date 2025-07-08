#!/bin/bash

# 修复容器名称并测试图片上传功能
echo "🔧 修复容器名称并测试图片上传功能..."

# 根据你的输出，实际容器名称是：
# healthcare-api (后端API)
# healthcare-mongodb (数据库)
# healthcare-mongo-express (数据库管理)

# 1. 检查容器状态
echo "📊 检查容器状态..."
docker-compose ps

# 2. 检查容器内的uploads目录
echo "📁 检查容器内的uploads目录..."
docker exec healthcare-api ls -la /app/uploads/
docker exec healthcare-api ls -la /app/uploads/pic/

# 3. 测试容器内的写入权限
echo "🧪 测试容器内的写入权限..."
docker exec healthcare-api mkdir -p /app/uploads/pic/measurement/test_user
docker exec healthcare-api touch /app/uploads/pic/measurement/test_user/test.txt
docker exec healthcare-api ls -la /app/uploads/pic/measurement/test_user/
docker exec healthcare-api rm -rf /app/uploads/pic/measurement/test_user/

# 4. 查看后端日志
echo "📋 查看后端日志..."
docker-compose logs healthcare-api --tail=50

# 5. 检查本地uploads目录
echo "📂 检查本地uploads目录..."
ls -la uploads/
ls -la uploads/pic/

# 6. 测试API健康状态
echo "🏥 测试API健康状态..."
curl -f http://localhost:7723/api/health || echo "API健康检查失败"

echo "✅ 容器测试完成！"
echo "🌐 请访问 http://43.134.141.188:6886/ 测试图片上传功能" 