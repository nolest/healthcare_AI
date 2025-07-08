#!/bin/bash

echo "🚨 緊急診斷 - 服務連接失敗"
echo "================================="

echo "🔍 1. 檢查Docker容器狀態..."
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔍 2. 檢查端口監聽狀態..."
echo "檢查6886端口 (Nginx):"
sudo netstat -tlnp | grep :6886 || echo "❌ 6886端口未監聽"

echo "檢查7723端口 (API):"
sudo netstat -tlnp | grep :7723 || echo "❌ 7723端口未監聽"

echo "檢查8081端口 (Mongo Express):"
sudo netstat -tlnp | grep :8081 || echo "❌ 8081端口未監聽"

echo ""
echo "🔍 3. 檢查Nginx狀態..."
sudo systemctl status nginx --no-pager | head -10

echo ""
echo "🔍 4. 檢查Nginx配置..."
sudo nginx -t

echo ""
echo "🔍 5. 檢查API容器日誌..."
echo "最近的API日誌:"
docker logs healthcare-api --tail 20

echo ""
echo "🔍 6. 檢查本地連接..."
echo "測試本地7723端口:"
curl -s -o /dev/null -w "本地API: %{http_code}\n" http://localhost:7723/api/health || echo "❌ 本地API連接失敗"

echo "測試本地6886端口:"
curl -s -o /dev/null -w "本地Nginx: %{http_code}\n" http://localhost:6886/ || echo "❌ 本地Nginx連接失敗"

echo ""
echo "🔍 7. 檢查防火牆狀態..."
sudo ufw status || echo "ufw未安裝或未啟用"

echo ""
echo "🔍 8. 檢查系統資源..."
echo "內存使用:"
free -h
echo "磁盤使用:"
df -h | grep -E "(Filesystem|/$)"

echo ""
echo "🔍 9. 重啟所有服務..."
echo "重啟Nginx..."
sudo systemctl restart nginx

echo "重啟Docker容器..."
cd /home/ubuntu/code/healthcare_AI/healthcare_backend
docker-compose restart

echo ""
echo "⏳ 等待服務啟動(30秒)..."
sleep 30

echo ""
echo "🔍 10. 最終測試..."
echo "測試各服務端點:"
curl -s -o /dev/null -w "前端: %{http_code}\n" http://43.143.141.188:6886/
curl -s -o /dev/null -w "API: %{http_code}\n" http://43.143.141.188:6886/hcbe/api/health
curl -s -o /dev/null -w "數據庫: %{http_code}\n" http://43.143.141.188:6886/db/ 