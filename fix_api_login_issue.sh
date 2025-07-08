#!/bin/bash

echo "🔧 診斷和修復API登錄問題"
echo "========================="

# 1. 檢查當前服務器IP配置
echo "🔍 檢查服務器IP配置..."
echo "當前服務器公網IP信息："
curl -s ipinfo.io/ip || curl -s ifconfig.me || echo "無法獲取公網IP"

echo ""
echo "服務器網絡接口："
ip addr show eth0 | grep inet

# 2. 檢查API服務狀態
echo ""
echo "🔍 檢查API服務狀態..."
curl -s -o /dev/null -w "API健康檢查: %{http_code}\n" http://localhost:7723/api/health
curl -s -o /dev/null -w "通過Nginx訪問API: %{http_code}\n" http://localhost:6886/hcbe/api/health

# 3. 測試登錄接口
echo ""
echo "🧪 測試登錄接口..."
echo "直接訪問API登錄接口："
curl -s -o /dev/null -w "直接API登錄: %{http_code}\n" http://localhost:7723/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"test"}'

echo "通過Nginx訪問登錄接口："
curl -s -o /dev/null -w "Nginx代理登錄: %{http_code}\n" http://localhost:6886/hcbe/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"test"}'

# 4. 檢查前端API配置
echo ""
echo "🔍 檢查前端API配置..."
echo "檢查前端API配置文件："
if [ -f "/var/www/healthcare/assets/index-*.js" ]; then
    echo "搜索API配置："
    grep -o "http://[^\"]*" /var/www/healthcare/assets/index-*.js | head -5
fi

# 5. 檢查Nginx配置
echo ""
echo "🔍 檢查Nginx配置..."
echo "當前Nginx配置："
grep -A 10 -B 2 "server_name" /etc/nginx/sites-available/healthcare

# 6. 修復可能的問題
echo ""
echo "🔧 修復可能的問題..."

# 獲取正確的公網IP
PUBLIC_IP=$(curl -s ipinfo.io/ip 2>/dev/null || curl -s ifconfig.me 2>/dev/null || echo "43.143.141.188")
echo "檢測到的公網IP: $PUBLIC_IP"

# 更新Nginx配置
echo "更新Nginx配置..."
sudo tee /etc/nginx/sites-available/healthcare > /dev/null << EOF
server {
    listen 6886;
    server_name $PUBLIC_IP localhost;

    client_max_body_size 100M;

    # 添加CORS頭部
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization";

    location / {
        root /var/www/healthcare;
        index index.html;
        try_files \$uri \$uri/ /index.html;

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    location /hcbe/ {
        # 處理預檢請求
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type text/plain;
            add_header Content-Length 0;
            return 204;
        }

        rewrite ^/hcbe/(.*)$ /\$1 break;
        proxy_pass http://127.0.0.1:7723;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /db/ {
        rewrite ^/db/(.*)$ /\$1 break;
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:7723/uploads/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;

    location = /50x.html {
        root /var/www/healthcare;
    }
}
EOF

# 7. 重新加載Nginx
echo ""
echo "🔄 重新加載Nginx..."
sudo nginx -t && sudo systemctl reload nginx

# 8. 檢查API CORS配置
echo ""
echo "🔍 檢查API CORS配置..."
echo "檢查API應用的CORS設置..."
docker exec healthcare-api grep -r "cors\|origin" /app/src/ | head -5 || echo "無法檢查API CORS配置"

# 9. 最終測試
echo ""
echo "⏳ 等待5秒後進行最終測試..."
sleep 5

echo ""
echo "🎯 最終測試結果..."
echo "健康檢查："
curl -s -o /dev/null -w "API健康檢查: %{http_code}\n" http://$PUBLIC_IP:6886/hcbe/api/health

echo ""
echo "登錄接口測試："
curl -s -w "登錄接口狀態: %{http_code}\n" http://$PUBLIC_IP:6886/hcbe/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"test"}' | head -1

echo ""
echo "📋 請使用以下地址測試："
echo "- 前端：http://$PUBLIC_IP:6886/"
echo "- API文檔：http://$PUBLIC_IP:6886/hcbe/api-docs"
echo "- 登錄接口：http://$PUBLIC_IP:6886/hcbe/api/auth/login"

echo ""
echo "🔍 如果登錄仍然失敗，請檢查："
echo "1. 前端是否使用正確的API地址"
echo "2. 瀏覽器控制台是否有CORS錯誤"
echo "3. API服務是否正確處理登錄請求" 