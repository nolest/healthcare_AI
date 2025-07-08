#!/bin/bash

# 检查uploads目录状态
echo "🔍 检查uploads目录状态..."

# 服务器上的实际目录路径
UPLOAD_BASE="/home/ubuntu/code/healthcare_AI/healthcare_backend/uploads"
UPLOAD_PIC="${UPLOAD_BASE}/pic"
UPLOAD_MEASUREMENT="${UPLOAD_PIC}/measurement"
UPLOAD_COVID="${UPLOAD_PIC}/covid"

# 1. 检查服务器上的目录
echo "📂 检查服务器上的目录..."
echo "基础目录: ${UPLOAD_BASE}"
ls -la "${UPLOAD_BASE}" 2>/dev/null || echo "❌ 目录不存在"

echo "图片目录: ${UPLOAD_PIC}"
ls -la "${UPLOAD_PIC}" 2>/dev/null || echo "❌ 目录不存在"

echo "测量目录: ${UPLOAD_MEASUREMENT}"
ls -la "${UPLOAD_MEASUREMENT}" 2>/dev/null || echo "❌ 目录不存在"

echo "COVID目录: ${UPLOAD_COVID}"
ls -la "${UPLOAD_COVID}" 2>/dev/null || echo "❌ 目录不存在"

# 2. 检查容器状态
echo "📊 检查容器状态..."
cd /home/ubuntu/code/healthcare_AI/healthcare_backend
docker-compose ps

# 3. 检查容器内的目录映射
echo "🐳 检查容器内的目录映射..."
echo "容器内 /app/uploads/ 目录:"
docker exec healthcare-api ls -la /app/uploads/ 2>/dev/null || echo "❌ 容器内目录不存在"

echo "容器内 /app/uploads/pic/ 目录:"
docker exec healthcare-api ls -la /app/uploads/pic/ 2>/dev/null || echo "❌ 容器内目录不存在"

echo "容器内 /app/uploads/pic/measurement/ 目录:"
docker exec healthcare-api ls -la /app/uploads/pic/measurement/ 2>/dev/null || echo "❌ 容器内目录不存在"

echo "容器内 /app/uploads/pic/covid/ 目录:"
docker exec healthcare-api ls -la /app/uploads/pic/covid/ 2>/dev/null || echo "❌ 容器内目录不存在"

# 4. 检查docker-compose.yml中的volumes配置
echo "🔍 检查docker-compose.yml中的volumes配置..."
grep -A 5 -B 5 "volumes:" docker-compose.yml

# 5. 测试简单的写入权限
echo "🧪 测试写入权限..."
TEST_FILE="/tmp/test_$(date +%s).txt"
echo "test content" > "${TEST_FILE}"

# 尝试复制到uploads目录
cp "${TEST_FILE}" "${UPLOAD_MEASUREMENT}/" 2>/dev/null && echo "✅ 服务器写入权限正常" || echo "❌ 服务器写入权限异常"

# 尝试在容器内创建文件
docker exec healthcare-api touch "/app/uploads/pic/measurement/container_test.txt" 2>/dev/null && echo "✅ 容器写入权限正常" || echo "❌ 容器写入权限异常"

# 清理测试文件
rm -f "${TEST_FILE}"
rm -f "${UPLOAD_MEASUREMENT}/$(basename ${TEST_FILE})"
docker exec healthcare-api rm -f "/app/uploads/pic/measurement/container_test.txt" 2>/dev/null

# 6. 查看最近的后端日志
echo "📋 查看最近的后端日志..."
docker-compose logs healthcare-api --tail=10

echo "✅ 状态检查完成！" 