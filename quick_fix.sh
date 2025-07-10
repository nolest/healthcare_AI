#!/bin/bash

echo "🔧 快速修復 - 重新啟動所有服務"
echo "================================="

# 停止所有服務
echo "🛑 停止所有服務..."
sudo systemctl stop nginx
cd /home/ubuntu/code/healthcare_AI/healthcare_backend
docker-compose down

# 檢查端口佔用
echo "🔍 檢查端口佔用..."
sudo lsof -i :6886 && sudo kill -9 $(sudo lsof -t -i :6886) || echo "6886端口未被佔用"
sudo lsof -i :7723 && sudo kill -9 $(sudo lsof -t -i :7723) || echo "7723端口未被佔用"
sudo lsof -i :8081 && sudo kill -9 $(sudo lsof -t -i :8081) || echo "8081端口未被佔用"

# 重新啟動服務
echo "🚀 重新啟動服務..."
echo "啟動Docker服務..."
docker-compose up -d

echo "⏳ 等待Docker服務啟動(60秒)..."
sleep 60

echo "啟動Nginx..."
sudo systemctl start nginx

echo "⏳ 等待Nginx啟動(10秒)..."
sleep 10

# 檢查服務狀態
echo "📊 檢查服務狀態..."
echo "Docker容器:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "Nginx狀態:"
sudo systemctl status nginx --no-pager -l | grep -E "(Active|Main PID)"

echo ""
echo "端口監聽:"
sudo netstat -tlnp | grep -E "(6886|7723|8081|8899)"

echo ""
echo "🧪 測試服務連接..."
sleep 5
curl -s -o /dev/null -w "前端 (6886): %{http_code}\n" http://localhost:6886/
curl -s -o /dev/null -w "API (7723): %{http_code}\n" http://localhost:7723/api/health
curl -s -o /dev/null -w "Nginx->API: %{http_code}\n" http://localhost:6886/hcbe/api/health

echo ""
echo "🌐 測試外部訪問..."
curl -s -o /dev/null -w "外部前端: %{http_code}\n" http://43.134.141.188:6886/
curl -s -o /dev/null -w "外部API: %{http_code}\n" http://43.134.141.188:6886/hcbe/api/health 
