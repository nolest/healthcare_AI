#!/bin/bash

echo "🎯 最終服務驗證測試..."
echo "========================="

# 測試所有服務端點
echo "🔍 測試前端服務..."
curl -s -o /dev/null -w "前端 (6886): %{http_code}\n" http://43.134.141.188:6886/

echo "🔍 測試後端API健康檢查..."
curl -s -o /dev/null -w "API健康檢查 (6886/hcbe): %{http_code}\n" http://43.134.141.188:6886/hcbe/api/health

echo "🔍 測試數據庫管理界面..."
curl -s -o /dev/null -w "Mongo Express (6886/db): %{http_code}\n" http://43.134.141.188:6886/db/

echo "🔍 測試直接API端點..."
curl -s -o /dev/null -w "API直接訪問 (7723): %{http_code}\n" http://43.134.141.188:7723/api/health

echo ""
echo "📊 檢查Docker容器狀態..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🩺 檢查API健康狀態..."
curl -s http://43.134.141.188:7723/api/health | jq . 2>/dev/null || echo "API響應格式檢查失敗"

echo ""
echo "🔍 檢查Nginx狀態..."
sudo systemctl status nginx --no-pager -l | grep -E "(Active|Main PID)"

echo ""
echo "🎉 如果所有服務都返回200狀態碼，說明部署成功！"
echo "📝 訪問地址："
echo "   - 前端：http://43.134.141.188:6886/"
echo "   - 後端API：http://43.134.141.188:6886/hcbe/"
echo "   - 數據庫管理：http://43.134.141.188:6886/db/" 
