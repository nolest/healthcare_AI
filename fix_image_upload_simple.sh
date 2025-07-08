#!/bin/bash

# 简化的图片上传修复脚本
echo "🔧 修复图片上传问题（简化版）..."

# 1. 进入后端目录
cd healthcare_backend

# 2. 停止容器
echo "🛑 停止容器..."
docker-compose down

# 3. 创建uploads目录结构
echo "📁 创建uploads目录结构..."
mkdir -p uploads/pic/measurement
mkdir -p uploads/pic/covid
chmod -R 777 uploads/

# 4. 修复docker-compose.yml的volumes映射
echo "🔧 修复docker-compose.yml的volumes映射..."
sed -i 's|- upload_data:/app/uploads||g' docker-compose.yml

# 5. 重新启动容器
echo "🔄 重新启动容器..."
docker-compose up -d

# 6. 等待容器启动
echo "⏳ 等待容器启动..."
sleep 15

# 7. 检查容器状态
echo "📊 检查容器状态..."
docker-compose ps

# 8. 测试容器内的目录权限
echo "🧪 测试容器内的目录权限..."
docker exec healthcare_backend_container ls -la /app/uploads/
docker exec healthcare_backend_container mkdir -p /app/uploads/pic/measurement/test_user
docker exec healthcare_backend_container touch /app/uploads/pic/measurement/test_user/test.txt
docker exec healthcare_backend_container ls -la /app/uploads/pic/measurement/test_user/
docker exec healthcare_backend_container rm -rf /app/uploads/pic/measurement/test_user/

echo "✅ 图片上传问题修复完成！"
echo "🌐 请访问 http://43.134.141.188:6886/ 测试图片上传功能"
echo "📋 如果仍有问题，请查看日志: docker-compose logs backend" 