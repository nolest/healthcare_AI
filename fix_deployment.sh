#!/bin/bash

echo "🔧 修復醫療AI系統部署問題"
echo "=================================="

# 1. 安裝 Node.js 和 npm
echo "📦 安裝 Node.js 和 npm..."
if ! command -v node &> /dev/null; then
    echo "正在安裝 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js 已安裝: $(node --version)"
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安裝，請重新安裝 Node.js"
    exit 1
else
    echo "✅ npm 已安裝: $(npm --version)"
fi

# 2. 修復後端 Dockerfile
echo "🐳 修復後端 Dockerfile..."
cd /home/ubuntu/code/healthcare_AI/healthcare_backend

# 備份原始 Dockerfile
cp Dockerfile Dockerfile.backup

# 創建新的 Dockerfile
cat > Dockerfile << 'EOF'
# 使用官方 Node.js 運行時作為基礎鏡像
FROM node:18-alpine

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

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7723/health || exit 1

# 啟動應用
CMD ["npm", "run", "start:prod"]
EOF

echo "✅ Dockerfile 已修復"

# 3. 構建前端
echo "🌐 構建前端..."
cd /home/ubuntu/code/healthcare_AI/healthcare_frontend

# 檢查是否有 package.json
if [ ! -f "package.json" ]; then
    echo "❌ 前端目錄中沒有 package.json 文件"
    exit 1
fi

# 清理並重新安裝依賴
rm -rf node_modules package-lock.json
npm install

# 構建前端
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 前端構建成功"
else
    echo "❌ 前端構建失敗"
    exit 1
fi

# 4. 重新啟動 Docker 服務
echo "🚀 重新啟動 Docker 服務..."
cd /home/ubuntu/code/healthcare_AI/healthcare_backend

# 停止現有容器
docker-compose down

# 清理舊鏡像
docker system prune -f

# 重新構建並啟動
docker-compose up -d --build

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 45

# 檢查服務狀態
echo "🔍 檢查服務狀態..."
docker-compose ps

# 檢查容器日誌
echo "📋 檢查容器日誌..."
echo "=== MongoDB 日誌 ==="
docker-compose logs --tail=10 mongodb

echo "=== API 日誌 ==="
docker-compose logs --tail=10 healthcare-api

echo "=== Mongo Express 日誌 ==="
docker-compose logs --tail=10 mongo-express

# 5. 初始化數據庫
echo "🗄️ 初始化數據庫..."
sleep 10
docker exec healthcare-api npm run db:setup

# 6. 測試服務
echo "🧪 測試服務..."
echo "測試前端頁面..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://43.143.141.188:6886/)
echo "前端狀態碼: $FRONTEND_STATUS"

echo "測試後端API..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://43.143.141.188:6886/hcbe/health)
echo "後端狀態碼: $BACKEND_STATUS"

echo "測試數據庫管理界面..."
DB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://43.143.141.188:6886/db/)
echo "數據庫管理狀態碼: $DB_STATUS"

echo ""
echo "🎉 修復完成！"
echo "📋 訪問地址："
echo "   前端: http://43.143.141.188:6886/"
echo "   API: http://43.143.141.188:6886/hcbe/"
echo "   數據庫管理: http://43.143.141.188:6886/db/"
echo ""

# 7. 檢查所有服務是否正常
if [ "$FRONTEND_STATUS" = "200" ] && [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ 所有服務運行正常！"
else
    echo "⚠️  部分服務可能需要更多時間啟動，請稍後再試"
    echo "   或運行以下命令查看詳細日誌："
    echo "   cd /home/ubuntu/code/healthcare_AI/healthcare_backend"
    echo "   docker-compose logs -f"
fi 