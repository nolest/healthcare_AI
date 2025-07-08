#!/bin/bash

echo "🔧 修復 API 健康檢查問題"
echo "=========================="

cd /home/ubuntu/code/healthcare_AI/healthcare_backend

# 1. 檢查 API 容器日誌
echo "📋 檢查 API 容器日誌..."
docker-compose logs --tail=20 healthcare-api

# 2. 檢查健康檢查端點
echo "🏥 測試健康檢查端點..."
docker exec healthcare-api curl -f http://localhost:7723/health || echo "❌ 健康檢查失敗"

# 3. 檢查 API 是否在正確端口運行
echo "🔌 檢查 API 端口..."
docker exec healthcare-api netstat -tlnp | grep :7723 || echo "❌ API 未在 7723 端口監聽"

# 4. 修復 Dockerfile 健康檢查
echo "🐳 修復 Dockerfile 健康檢查..."
cat > Dockerfile << 'EOF'
# 使用官方 Node.js 運行時作為基礎鏡像
FROM node:18-alpine

# 安裝 curl（用於健康檢查）
RUN apk add --no-cache curl

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝所有依賴（包括開發依賴）
RUN npm ci

# 複製應用代碼
COPY . .

# 構建應用
RUN npm run build

# 創建非 root 用戶
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# 更改文件所有權
RUN chown -R nestjs:nodejs /app
USER nestjs

# 暴露端口
EXPOSE 7723

# 健康檢查（修復路徑和超時時間）
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:7723/health || exit 1

# 啟動應用
CMD ["npm", "run", "start:prod"]
EOF

# 5. 重新構建 API 容器
echo "🔄 重新構建 API 容器..."
docker-compose down healthcare-api
docker-compose build healthcare-api
docker-compose up -d healthcare-api

# 6. 等待服務啟動
echo "⏳ 等待 API 服務啟動（90秒）..."
sleep 90

# 7. 檢查新的容器狀態
echo "🔍 檢查新的容器狀態..."
docker-compose ps

# 8. 測試健康檢查
echo "🧪 測試健康檢查..."
for i in {1..5}; do
    echo "嘗試 $i/5..."
    if docker exec healthcare-api curl -f http://localhost:7723/health; then
        echo "✅ 健康檢查成功！"
        break
    else
        echo "❌ 健康檢查失敗，等待 10 秒後重試..."
        sleep 10
    fi
done

# 9. 測試外部訪問
echo "🌐 測試外部訪問..."
echo "直接訪問 API："
curl -s -o /dev/null -w "狀態碼: %{http_code}\n" http://localhost:7723/health

echo "通過 Nginx 訪問 API："
curl -s -o /dev/null -w "狀態碼: %{http_code}\n" http://43.143.141.188:6886/hcbe/health

# 10. 檢查最終狀態
echo "📊 最終狀態檢查..."
docker-compose ps

# 11. 如果仍有問題，提供詳細日誌
if ! docker exec healthcare-api curl -f http://localhost:7723/health > /dev/null 2>&1; then
    echo "⚠️  API 仍有問題，詳細日誌："
    docker-compose logs --tail=30 healthcare-api
    
    echo "🔧 建議的故障排除步驟："
    echo "1. 檢查應用是否正確啟動："
    echo "   docker exec healthcare-api ps aux"
    echo "2. 檢查應用日誌："
    echo "   docker-compose logs -f healthcare-api"
    echo "3. 檢查端口監聽："
    echo "   docker exec healthcare-api netstat -tlnp"
    echo "4. 手動重啟容器："
    echo "   docker-compose restart healthcare-api"
else
    echo "🎉 API 健康檢查修復成功！"
    echo "📋 現在可以訪問："
    echo "   前端: http://43.143.141.188:6886/"
    echo "   API: http://43.143.141.188:6886/hcbe/"
    echo "   數據庫管理: http://43.143.141.188:6886/db/"
fi 