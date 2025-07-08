#!/bin/bash

# 医疗AI系统 - Ubuntu服务器重新部署脚本
# 执行前请确保您在项目根目录 /home/ubuntu/code/healthcare_AI

echo "=========================================="
echo "开始重新部署医疗AI系统..."
echo "=========================================="

# 1. 更新代码
echo "1. 更新代码..."
git pull origin main
if [ $? -ne 0 ]; then
    echo "❌ Git拉取失败，请检查网络连接或解决代码冲突"
    exit 1
fi
echo "✅ 代码更新完成"

# 2. 停止现有服务
echo "2. 停止现有Docker服务..."
cd healthcare_backend
docker-compose down
echo "✅ Docker服务已停止"

# 3. 重新构建前端
echo "3. 重新构建前端..."
cd ../healthcare_frontend
npm install
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    exit 1
fi
echo "✅ 前端构建完成"

# 4. 部署前端文件
echo "4. 部署前端文件..."
sudo rm -rf /var/www/healthcare/*
sudo cp -r dist/* /var/www/healthcare/
sudo chown -R www-data:www-data /var/www/healthcare/
sudo chmod -R 755 /var/www/healthcare/
echo "✅ 前端文件部署完成"

# 5. 重新启动后端服务
echo "5. 重新启动后端服务..."
cd ../healthcare_backend
docker-compose up -d --build
if [ $? -ne 0 ]; then
    echo "❌ 后端服务启动失败"
    exit 1
fi
echo "✅ 后端服务启动完成"

# 6. 等待服务启动
echo "6. 等待服务启动..."
sleep 30

# 7. 检查服务状态
echo "7. 检查服务状态..."
echo "Docker容器状态："
docker-compose ps

echo ""
echo "端口监听状态："
sudo netstat -tlnp | grep -E ':(6886|7723|8081|8899)'

# 8. 重启Nginx
echo "8. 重启Nginx..."
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager -l

# 9. 测试服务
echo "9. 测试服务..."
echo "测试前端访问："
curl -I http://localhost:6886/ 2>/dev/null | head -n 1

echo "测试API健康检查："
curl -I http://localhost:7723/api/health 2>/dev/null | head -n 1

echo "测试通过Nginx代理的API："
curl -I http://localhost:6886/hcbe/api/health 2>/dev/null | head -n 1

echo ""
echo "=========================================="
echo "重新部署完成！"
echo "=========================================="
echo "访问地址："
echo "前端: http://43.134.141.188:6886/"
echo "API文档: http://43.134.141.188:6886/hcbe/api"
echo "数据库管理: http://43.134.141.188:8081/"
echo ""
echo "如果遇到问题，请检查："
echo "1. 防火墙设置: sudo ufw status"
echo "2. 服务日志: docker-compose logs -f"
echo "3. Nginx日志: sudo tail -f /var/log/nginx/error.log"
echo "==========================================" 