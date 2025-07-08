#!/bin/bash

echo "🔧 修復 Docker Compose 問題"
echo "============================"

cd /home/ubuntu/code/healthcare_AI/healthcare_backend

# 1. 停止所有容器並清理
echo "🛑 停止所有容器並清理..."
docker-compose down --volumes --remove-orphans
docker system prune -f

# 2. 檢查 Docker Compose 版本
echo "📊 檢查 Docker Compose 版本..."
docker-compose --version

# 3. 升級 Docker Compose（如果需要）
echo "⬆️ 升級 Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. 檢查新版本
echo "📊 檢查新版本..."
/usr/local/bin/docker-compose --version

# 5. 清理舊的鏡像和容器
echo "🧹 清理舊的鏡像和容器..."
docker container prune -f
docker image prune -f
docker volume prune -f

# 6. 重新構建所有鏡像
echo "🔨 重新構建所有鏡像..."
/usr/local/bin/docker-compose build --no-cache

# 7. 啟動服務
echo "🚀 啟動服務..."
/usr/local/bin/docker-compose up -d

# 8. 等待服務啟動
echo "⏳ 等待服務啟動（120秒）..."
sleep 120

# 9. 檢查服務狀態
echo "🔍 檢查服務狀態..."
/usr/local/bin/docker-compose ps

# 10. 測試健康檢查
echo "🏥 測試健康檢查..."
for i in {1..10}; do
    echo "嘗試 $i/10..."
    if docker exec healthcare-api curl -f http://localhost:7723/health > /dev/null 2>&1; then
        echo "✅ 健康檢查成功！"
        break
    else
        echo "❌ 健康檢查失敗，等待 15 秒後重試..."
        sleep 15
    fi
done

# 11. 檢查容器日誌
echo "📋 檢查容器日誌..."
echo "=== API 日誌 ==="
/usr/local/bin/docker-compose logs --tail=10 healthcare-api

echo "=== MongoDB 日誌 ==="
/usr/local/bin/docker-compose logs --tail=5 mongodb

# 12. 測試所有服務
echo "🧪 測試所有服務..."
echo "測試後端API（直接）："
curl -s -o /dev/null -w "狀態碼: %{http_code}\n" http://localhost:7723/health

echo "測試MongoDB管理："
curl -s -o /dev/null -w "狀態碼: %{http_code}\n" http://localhost:8081

echo "測試前端頁面："
curl -s -o /dev/null -w "狀態碼: %{http_code}\n" http://43.143.141.188:6886/

echo "測試後端API（通過Nginx）："
curl -s -o /dev/null -w "狀態碼: %{http_code}\n" http://43.143.141.188:6886/hcbe/health

echo "測試數據庫管理（通過Nginx）："
curl -s -o /dev/null -w "狀態碼: %{http_code}\n" http://43.143.141.188:6886/db/

# 13. 最終狀態報告
echo ""
echo "🎉 修復完成！"
echo "📊 最終服務狀態："
/usr/local/bin/docker-compose ps

echo ""
echo "📋 訪問地址："
echo "   前端: http://43.143.141.188:6886/"
echo "   API: http://43.143.141.188:6886/hcbe/"
echo "   數據庫管理: http://43.143.141.188:6886/db/"
echo ""
echo "🔑 默認賬戶："
echo "   管理員: admin / admin123"
echo "   醫生: doctor001 / doctor123"
echo "   患者: patient001 / patient123" 