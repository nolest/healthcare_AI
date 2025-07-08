#!/bin/bash

# 修复uploads目录映射的脚本
echo "🔧 修复uploads目录映射..."

# 服务器上的实际目录路径
UPLOAD_BASE="/home/ubuntu/code/healthcare_AI/healthcare_backend/uploads"
UPLOAD_PIC="${UPLOAD_BASE}/pic"
UPLOAD_MEASUREMENT="${UPLOAD_PIC}/measurement"
UPLOAD_COVID="${UPLOAD_PIC}/covid"

# 1. 进入后端目录
cd /home/ubuntu/code/healthcare_AI/healthcare_backend

# 2. 检查并创建目录结构
echo "📁 检查并创建目录结构..."
mkdir -p "${UPLOAD_MEASUREMENT}"
mkdir -p "${UPLOAD_COVID}"

# 3. 设置正确的权限
echo "🔧 设置目录权限..."
chmod -R 755 "${UPLOAD_BASE}"
chown -R ubuntu:ubuntu "${UPLOAD_BASE}"

# 4. 检查目录状态
echo "📋 检查目录状态..."
echo "基础目录: ${UPLOAD_BASE}"
ls -la "${UPLOAD_BASE}"

echo "图片目录: ${UPLOAD_PIC}"
ls -la "${UPLOAD_PIC}"

echo "测量目录: ${UPLOAD_MEASUREMENT}"
ls -la "${UPLOAD_MEASUREMENT}"

echo "COVID目录: ${UPLOAD_COVID}"
ls -la "${UPLOAD_COVID}"

# 5. 停止容器
echo "🛑 停止容器..."
docker-compose down

# 6. 检查docker-compose.yml中的volumes配置
echo "🔍 检查当前docker-compose.yml的volumes配置..."
grep -A 10 -B 5 "volumes:" docker-compose.yml

# 7. 确保docker-compose.yml中的volumes映射正确
echo "🔧 确保volumes映射正确..."
# 备份原文件
cp docker-compose.yml docker-compose.yml.backup

# 使用sed修改volumes映射，确保使用绝对路径
sed -i 's|./uploads:/app/uploads|/home/ubuntu/code/healthcare_AI/healthcare_backend/uploads:/app/uploads|g' docker-compose.yml

# 8. 重新启动容器
echo "🚀 重新启动容器..."
docker-compose up -d

# 9. 等待容器启动
echo "⏳ 等待容器启动..."
sleep 15

# 10. 检查容器状态
echo "📊 检查容器状态..."
docker-compose ps

# 11. 验证容器内的目录映射
echo "📁 验证容器内的目录映射..."
echo "检查容器内 /app/uploads/ 目录:"
docker exec healthcare-api ls -la /app/uploads/

echo "检查容器内 /app/uploads/pic/ 目录:"
docker exec healthcare-api ls -la /app/uploads/pic/

echo "检查容器内 /app/uploads/pic/measurement/ 目录:"
docker exec healthcare-api ls -la /app/uploads/pic/measurement/

echo "检查容器内 /app/uploads/pic/covid/ 目录:"
docker exec healthcare-api ls -la /app/uploads/pic/covid/

# 12. 测试写入权限
echo "🧪 测试容器内写入权限..."
TEST_USER_ID="test_user_$(date +%s)"
docker exec healthcare-api mkdir -p "/app/uploads/pic/measurement/${TEST_USER_ID}"
docker exec healthcare-api touch "/app/uploads/pic/measurement/${TEST_USER_ID}/test.txt"
docker exec healthcare-api echo "test content" > "/app/uploads/pic/measurement/${TEST_USER_ID}/test.txt"

# 13. 验证文件是否在服务器上创建
echo "📋 验证文件是否在服务器上创建..."
ls -la "${UPLOAD_MEASUREMENT}/${TEST_USER_ID}/"

# 14. 清理测试文件
echo "🧹 清理测试文件..."
docker exec healthcare-api rm -rf "/app/uploads/pic/measurement/${TEST_USER_ID}"

# 15. 查看后端日志
echo "📋 查看后端日志..."
docker-compose logs healthcare-api --tail=30

# 16. 测试API健康状态
echo "🏥 测试API健康状态..."
curl -f http://localhost:7723/api/health || echo "API可能还在启动中"

echo "✅ uploads目录映射修复完成！"
echo "📂 服务器目录: ${UPLOAD_BASE}"
echo "🐳 容器目录: /app/uploads"
echo "🌐 请访问 http://43.134.141.188:6886/ 测试图片上传功能" 