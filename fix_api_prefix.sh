#!/bin/bash

echo "=========================================="
echo "修复API路径前缀问题..."
echo "=========================================="

# 进入项目目录
cd /home/ubuntu/code/healthcare_AI

# 拉取最新代码（包含修复）
echo "1. 拉取最新代码..."
git pull origin main
echo "✅ 代码更新完成"

# 进入后端目录
cd healthcare_backend

# 停止现有服务
echo "2. 停止现有Docker服务..."
docker compose down
echo "✅ Docker服务已停止"

# 重新构建并启动服务
echo "3. 重新构建并启动服务..."
docker compose up -d --build
echo "✅ 服务重新构建完成"

# 等待服务启动
echo "4. 等待服务启动..."
sleep 15

# 检查服务状态
echo "5. 检查服务状态..."
docker compose ps

# 测试API接口
echo "6. 测试API接口..."
echo "测试健康检查接口："
curl -f http://localhost:7723/api/health || echo "API健康检查失败"

echo ""
echo "测试通过Nginx代理的健康检查接口："
curl -f http://localhost:6886/hcbe/api/health || echo "Nginx代理健康检查失败"

# 测试登录接口
echo ""
echo "7. 测试登录接口..."
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' \
  http://localhost:7723/api/auth/login || echo "直接登录接口测试失败"

echo ""
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' \
  http://localhost:6886/hcbe/api/auth/login || echo "Nginx代理登录接口测试失败"

# 查看日志
echo ""
echo "8. 显示API服务日志..."
docker compose logs healthcare-api --tail=30

echo "=========================================="
echo "修复完成！"
echo "现在API路径包含/api前缀："
echo "- 健康检查: http://43.134.141.188:6886/hcbe/api/health"
echo "- 登录接口: http://43.134.141.188:6886/hcbe/api/auth/login"
echo "- API文档: http://43.134.141.188:6886/hcbe/api-docs"
echo "==========================================" 