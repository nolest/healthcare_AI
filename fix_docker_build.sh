#!/bin/bash

echo "=========================================="
echo "修复Docker构建问题并重新启动服务..."
echo "=========================================="

# 进入后端目录
cd /home/ubuntu/code/healthcare_AI/healthcare_backend

# 停止现有服务
echo "1. 停止现有Docker服务..."
docker compose down
echo "✅ Docker服务已停止"

# 清理Docker缓存
echo "2. 清理Docker缓存..."
docker system prune -f
echo "✅ Docker缓存已清理"

# 重新构建并启动服务
echo "3. 重新构建并启动服务..."
docker compose up -d --build
echo "✅ 服务重新构建完成"

# 等待服务启动
echo "4. 等待服务启动..."
sleep 10

# 检查服务状态
echo "5. 检查服务状态..."
docker compose ps

# 检查API健康状态
echo "6. 检查API健康状态..."
sleep 5
curl -f http://localhost:7723/health || echo "API健康检查失败"

# 检查日志
echo "7. 显示API服务日志..."
docker compose logs healthcare-api --tail=20

echo "=========================================="
echo "修复完成！"
echo "==========================================" 