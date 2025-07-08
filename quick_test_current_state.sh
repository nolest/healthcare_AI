#!/bin/bash

# 快速测试当前状态
echo "🔍 快速测试当前状态..."

cd healthcare_backend

# 1. 检查容器状态
echo "📊 检查容器状态..."
docker-compose ps

# 2. 检查容器内的uploads目录
echo "📁 检查容器内的uploads目录..."
echo "检查 /app/ 目录:"
docker exec healthcare-api ls -la /app/

echo "检查 /app/uploads/ 目录:"
docker exec healthcare-api ls -la /app/uploads/ 2>/dev/null || echo "❌ /app/uploads/ 目录不存在"

echo "检查 /app/uploads/pic/ 目录:"
docker exec healthcare-api ls -la /app/uploads/pic/ 2>/dev/null || echo "❌ /app/uploads/pic/ 目录不存在"

# 3. 尝试创建测试目录
echo "🧪 尝试创建测试目录..."
docker exec healthcare-api mkdir -p /app/uploads/pic/measurement/test_user 2>/dev/null || echo "❌ 无法创建测试目录"

# 4. 尝试创建测试文件
echo "📝 尝试创建测试文件..."
docker exec healthcare-api touch /app/uploads/pic/measurement/test_user/test.txt 2>/dev/null || echo "❌ 无法创建测试文件"

# 5. 检查测试文件
echo "📋 检查测试文件..."
docker exec healthcare-api ls -la /app/uploads/pic/measurement/test_user/ 2>/dev/null || echo "❌ 测试文件不存在"

# 6. 清理测试文件
echo "🧹 清理测试文件..."
docker exec healthcare-api rm -rf /app/uploads/pic/measurement/test_user/ 2>/dev/null

# 7. 检查本地uploads目录
echo "📂 检查本地uploads目录..."
ls -la uploads/ 2>/dev/null || echo "❌ 本地uploads目录不存在"
ls -la uploads/pic/ 2>/dev/null || echo "❌ 本地uploads/pic目录不存在"

# 8. 查看最近的后端日志
echo "📋 查看最近的后端日志..."
docker-compose logs healthcare-api --tail=20

# 9. 测试API健康状态
echo "🏥 测试API健康状态..."
curl -f http://localhost:7723/api/health 2>/dev/null || echo "❌ API健康检查失败"

echo "✅ 当前状态检查完成！" 