#!/bin/bash

echo "🔍 診斷醫療AI系統問題"
echo "=========================="

cd /home/ubuntu/code/healthcare_AI/healthcare_backend

# 1. 檢查 Docker 容器狀態
echo "🐳 檢查 Docker 容器狀態..."
docker-compose ps

# 2. 等待服務完全啟動
echo "⏳ 等待服務完全啟動（60秒）..."
sleep 60

# 3. 檢查容器健康狀態
echo "🏥 檢查容器健康狀態..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 4. 檢查端口監聽狀態
echo "🔌 檢查端口監聽狀態..."
echo "7723端口（後端API）："
sudo netstat -tlnp | grep :7723 || echo "❌ 7723端口未監聽"

echo "8081端口（Mongo Express）："
sudo netstat -tlnp | grep :8081 || echo "❌ 8081端口未監聽"

echo "8899端口（MongoDB）："
sudo netstat -tlnp | grep :8899 || echo "❌ 8899端口未監聽"

echo "6886端口（Nginx）："
sudo netstat -tlnp | grep :6886 || echo "❌ 6886端口未監聽"

# 5. 測試直接訪問服務
echo "🧪 測試直接訪問服務..."
echo "測試後端API（直接）："
curl -s -o /dev/null -w "狀態碼: %{http_code}\n" http://localhost:7723/health

echo "測試MongoDB連接："
curl -s -o /dev/null -w "狀態碼: %{http_code}\n" http://localhost:8081

# 6. 檢查 Nginx 狀態
echo "🌐 檢查 Nginx 狀態..."
sudo systemctl status nginx --no-pager -l

# 7. 測試 Nginx 配置
echo "⚙️ 測試 Nginx 配置..."
sudo nginx -t

# 8. 檢查 Nginx 錯誤日誌
echo "📋 檢查 Nginx 錯誤日誌..."
sudo tail -20 /var/log/nginx/error.log

# 9. 修復 Mongo Express 配置
echo "🔧 修復 Mongo Express 配置..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # MongoDB 数据库
  mongodb:
    image: mongo:5.0
    container_name: healthcare-mongodb
    restart: unless-stopped
    ports:
      - "8899:27017"
    environment:
      MONGO_INITDB_DATABASE: healthcare_local
    volumes:
      - mongodb_data:/data/db
    networks:
      - healthcare-network

  # 医疗 AI 后端 API
  healthcare-api:
    build: .
    container_name: healthcare-api
    restart: unless-stopped
    ports:
      - "7723:7723"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/healthcare_local
      - JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
      - JWT_EXPIRES_IN=7d
      - PORT=7723
    depends_on:
      - mongodb
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    networks:
      - healthcare-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7723/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # MongoDB管理界面
  mongo-express:
    image: mongo-express
    container_name: healthcare-mongo-express
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_SERVER: mongodb
      ME_CONFIG_MONGODB_PORT: 27017
      ME_CONFIG_MONGODB_URL: mongodb://mongodb:27017/healthcare_local
      ME_CONFIG_BASICAUTH_USERNAME: admin
      ME_CONFIG_BASICAUTH_PASSWORD: admin123
    depends_on:
      - mongodb
    networks:
      - healthcare-network

volumes:
  mongodb_data:
    driver: local

networks:
  healthcare-network:
    driver: bridge
EOF

# 10. 重新啟動服務
echo "🔄 重新啟動服務..."
docker-compose down
docker-compose up -d

# 11. 等待服務啟動
echo "⏳ 等待服務重新啟動..."
sleep 45

# 12. 檢查服務狀態
echo "🔍 檢查服務狀態..."
docker-compose ps

# 13. 檢查服務日誌
echo "📋 檢查服務日誌..."
echo "=== API 日誌 ==="
docker-compose logs --tail=5 healthcare-api

echo "=== Mongo Express 日誌 ==="
docker-compose logs --tail=5 mongo-express

# 14. 重新加載 Nginx
echo "🔄 重新加載 Nginx..."
sudo systemctl reload nginx

# 15. 最終測試
echo "🎯 最終測試..."
sleep 10

echo "測試前端頁面："
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://43.134.141.188:6886/)
echo "前端狀態碼: $FRONTEND_STATUS"

echo "測試後端API："
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://43.134.141.188:6886/hcbe/health)
echo "後端狀態碼: $BACKEND_STATUS"

echo "測試數據庫管理："
DB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://43.134.141.188:6886/db/)
echo "數據庫管理狀態碼: $DB_STATUS"

echo "測試後端API（直接）："
DIRECT_API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7723/health)
echo "直接API狀態碼: $DIRECT_API_STATUS"

echo ""
echo "🎉 診斷和修復完成！"
echo "📋 訪問地址："
echo "   前端: http://43.134.141.188:6886/"
echo "   API: http://43.134.141.188:6886/hcbe/"
echo "   數據庫管理: http://43.134.141.188:6886/db/"
echo ""

# 16. 提供故障排除建議
if [ "$FRONTEND_STATUS" != "200" ] || [ "$BACKEND_STATUS" != "200" ]; then
    echo "⚠️  如果服務仍然無法訪問，請檢查："
    echo "1. 防火牆設置: sudo ufw status"
    echo "2. 容器日誌: docker-compose logs -f"
    echo "3. Nginx 日誌: sudo tail -f /var/log/nginx/error.log"
    echo "4. 手動重啟 Nginx: sudo systemctl restart nginx"
fi 
