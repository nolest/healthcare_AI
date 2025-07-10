#!/bin/bash

echo "🏥 醫療AI系統 - 更新部署腳本"
echo "========================================"

# 檢查項目目錄是否存在
if [ ! -d "/home/ubuntu/code/healthcare_AI" ]; then
    echo "❌ 項目目錄不存在，請先克隆項目到 /home/ubuntu/code/healthcare_AI"
    exit 1
fi

# 進入項目目錄
cd /home/ubuntu/code/healthcare_AI

# 更新代碼
echo "📂 更新項目代碼..."
git pull origin main

# 構建前端
echo "🌐 構建前端..."
cd /home/ubuntu/code/healthcare_AI/healthcare_frontend
npm install
npm run build

# 更新Nginx配置
echo "⚙️ 更新Nginx配置..."
sudo tee /etc/nginx/sites-available/healthcare > /dev/null <<'EOF'
server {
    listen 6886;
    server_name 43.134.141.188;
    
    client_max_body_size 100M;
    
    location / {
        root /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    location /hcbe/ {
        rewrite ^/hcbe/(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:7723;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /db/ {
        rewrite ^/db/(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /health {
        proxy_pass http://127.0.0.1:7723/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location /uploads/ {
        proxy_pass http://127.0.0.1:7723/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist;
    }
}
EOF

# 啟用Nginx站點並重新加載
sudo ln -sf /etc/nginx/sites-available/healthcare /etc/nginx/sites-enabled/
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo "✅ Nginx配置更新成功"
else
    echo "❌ Nginx配置測試失敗"
    exit 1
fi

# 重新啟動Docker服務
echo "🚀 重新啟動Docker服務..."
cd /home/ubuntu/code/healthcare_AI/healthcare_backend
docker-compose down
docker-compose up -d --build

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 30

# 檢查服務狀態
echo "🔍 檢查服務狀態..."
docker-compose ps

# 測試服務
echo "🧪 測試服務..."
echo "測試前端頁面..."
curl -s -o /dev/null -w "HTTP狀態碼: %{http_code}\n" http://43.134.141.188:6886/

echo "測試後端API..."
curl -s -o /dev/null -w "HTTP狀態碼: %{http_code}\n" http://43.134.141.188:6886/hcbe/health

echo "測試數據庫管理界面..."
curl -s -o /dev/null -w "HTTP狀態碼: %{http_code}\n" http://43.134.141.188:6886/db/

echo ""
echo "🎉 更新部署完成！"
echo "📋 訪問地址："
echo "   前端: http://43.134.141.188:6886/"
echo "   API: http://43.134.141.188:6886/hcbe/"
echo "   數據庫管理: http://43.134.141.188:6886/db/"
echo ""
echo "🔑 默認賬戶："
echo "   管理員: admin / admin123"
echo "   醫生: doctor001 / doctor123"
echo "   患者: patient001 / patient123" 
