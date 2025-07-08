#!/bin/bash

echo "🔍 深度診斷 API 問題"
echo "===================="

cd /home/ubuntu/code/healthcare_AI/healthcare_backend

# 1. 檢查 API 容器詳細日誌
echo "📋 檢查 API 容器詳細日誌..."
/usr/local/bin/docker-compose logs healthcare-api

# 2. 檢查容器內部狀態
echo "🔍 檢查容器內部狀態..."
echo "=== 檢查進程 ==="
docker exec healthcare-api ps aux

echo "=== 檢查端口監聽 ==="
docker exec healthcare-api netstat -tlnp

echo "=== 檢查文件結構 ==="
docker exec healthcare-api ls -la /app/

echo "=== 檢查 dist 目錄 ==="
docker exec healthcare-api ls -la /app/dist/

# 3. 測試不同的健康檢查端點
echo "🏥 測試不同的健康檢查端點..."
echo "測試 /health:"
docker exec healthcare-api curl -v http://localhost:7723/health 2>&1 || echo "❌ /health 失敗"

echo "測試 /api/health:"
docker exec healthcare-api curl -v http://localhost:7723/api/health 2>&1 || echo "❌ /api/health 失敗"

echo "測試根路徑:"
docker exec healthcare-api curl -v http://localhost:7723/ 2>&1 || echo "❌ 根路徑失敗"

# 4. 檢查應用配置
echo "⚙️ 檢查應用配置..."
echo "=== 環境變量 ==="
docker exec healthcare-api env | grep -E "(NODE_ENV|PORT|MONGODB_URI)"

# 5. 手動啟動應用進行測試
echo "🔧 檢查應用是否能手動啟動..."
docker exec healthcare-api node dist/main.js &
sleep 10

# 6. 再次測試健康檢查
echo "🧪 再次測試健康檢查..."
docker exec healthcare-api curl -f http://localhost:7723/health || echo "❌ 仍然失敗"

# 7. 檢查是否有多個 Node.js 進程
echo "🔍 檢查 Node.js 進程..."
docker exec healthcare-api ps aux | grep node

# 8. 檢查應用主文件
echo "📄 檢查應用主文件..."
docker exec healthcare-api cat /app/dist/main.js | head -20

# 9. 創建一個簡化的健康檢查
echo "🩺 創建簡化的健康檢查..."
cat > simple-health-check.js << 'EOF'
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 7723,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`狀態碼: ${res.statusCode}`);
  console.log(`響應頭: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('響應內容:', data);
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});

req.on('error', (err) => {
  console.error('請求錯誤:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('請求超時');
  req.destroy();
  process.exit(1);
});

req.setTimeout(5000);
req.end();
EOF

# 10. 將健康檢查腳本複製到容器並執行
docker cp simple-health-check.js healthcare-api:/tmp/
docker exec healthcare-api node /tmp/simple-health-check.js

# 11. 修復 Dockerfile 中的健康檢查
echo "🔧 修復 Dockerfile 健康檢查..."
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

# 簡化的健康檢查（延長啟動時間）
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD curl -f http://localhost:7723/health || curl -f http://localhost:7723/api/health || exit 1

# 啟動應用
CMD ["npm", "run", "start:prod"]
EOF

# 12. 重新構建並啟動
echo "🔄 重新構建並啟動..."
/usr/local/bin/docker-compose down healthcare-api
/usr/local/bin/docker-compose build healthcare-api
/usr/local/bin/docker-compose up -d healthcare-api

# 13. 等待並最終測試
echo "⏳ 等待服務啟動（180秒）..."
sleep 180

echo "🎯 最終測試..."
/usr/local/bin/docker-compose ps

# 14. 清理臨時文件
rm -f simple-health-check.js

echo ""
echo "🔍 診斷完成！如果仍有問題，請檢查上述日誌輸出。" 