#!/bin/bash

echo "🔧 修復權限和路徑問題"
echo "===================="

# 1. 創建正確的目錄結構
echo "📁 創建Nginx web目錄..."
sudo mkdir -p /var/www/healthcare

# 2. 修復前端文件權限
echo "🔑 修復前端文件權限..."
cd /home/ubuntu/code/healthcare_AI/healthcare_frontend
sudo chmod -R 755 dist/
sudo chown -R ubuntu:ubuntu dist/

# 3. 複製文件到正確位置
echo "📋 複製前端文件到Nginx目錄..."
sudo cp -r dist/* /var/www/healthcare/
sudo chown -R www-data:www-data /var/www/healthcare/
sudo chmod -R 755 /var/www/healthcare/

# 4. 更新Nginx配置指向正確路徑
echo "⚙️ 更新Nginx配置..."
sudo tee /etc/nginx/sites-available/healthcare > /dev/null << 'EOF'
server {
    listen 6886;
    server_name 43.143.141.188;

    client_max_body_size 100M;

    location / {
        root /var/www/healthcare;
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
        root /var/www/healthcare;
    }
}
EOF

# 5. 驗證文件結構
echo "🔍 驗證文件結構..."
echo "檢查 /var/www/healthcare/ 目錄："
ls -la /var/www/healthcare/

echo ""
echo "檢查 index.html 文件："
ls -la /var/www/healthcare/index.html

echo ""
echo "檢查文件權限："
ls -ld /var/www/healthcare/
ls -la /var/www/healthcare/ | head -5

# 6. 測試Nginx配置
echo "🧪 測試Nginx配置..."
sudo nginx -t

# 7. 重新加載Nginx
echo "🔄 重新加載Nginx..."
sudo systemctl reload nginx

# 8. 等待並測試
echo "⏳ 等待5秒後測試..."
sleep 5

echo ""
echo "🎯 最終測試..."
echo "本地測試："
curl -s -o /dev/null -w "前端 (localhost:6886): %{http_code}\n" http://localhost:6886/
curl -s -o /dev/null -w "API (localhost:6886/hcbe): %{http_code}\n" http://localhost:6886/hcbe/api/health

echo ""
echo "外部測試："
curl -s -o /dev/null -w "前端 (43.143.141.188:6886): %{http_code}\n" http://43.143.141.188:6886/
curl -s -o /dev/null -w "API (43.143.141.188:6886/hcbe): %{http_code}\n" http://43.143.141.188:6886/hcbe/api/health
curl -s -o /dev/null -w "數據庫 (43.143.141.188:6886/db): %{http_code}\n" http://43.143.141.188:6886/db/

echo ""
echo "🔍 如果仍有問題，檢查最新錯誤日誌..."
sudo tail -5 /var/log/nginx/error.log 