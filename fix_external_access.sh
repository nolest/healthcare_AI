#!/bin/bash

echo "🌐 修復外部訪問問題"
echo "=================="

# 1. 檢查防火牆狀態
echo "🔍 檢查防火牆狀態..."
sudo ufw status verbose || echo "ufw未安裝"

# 2. 檢查iptables規則
echo ""
echo "🔍 檢查iptables規則..."
sudo iptables -L -n | grep -E "(6886|7723|8081|8899)" || echo "沒有找到相關端口規則"

# 3. 檢查端口監聽
echo ""
echo "🔍 檢查端口監聽狀態..."
echo "6886端口 (Nginx):"
sudo netstat -tlnp | grep :6886

echo "7723端口 (API):"
sudo netstat -tlnp | grep :7723

echo "8081端口 (Mongo Express):"
sudo netstat -tlnp | grep :8081

# 4. 檢查服務器網絡接口
echo ""
echo "🔍 檢查網絡接口..."
ip addr show | grep -E "(inet|eth0|ens)"

# 5. 測試從服務器內部訪問外部IP
echo ""
echo "🧪 測試從服務器內部訪問外部IP..."
curl -s -o /dev/null -w "內部訪問外部IP: %{http_code}\n" http://43.134.141.188:6886/ --connect-timeout 5

# 6. 檢查Nginx綁定
echo ""
echo "🔍 檢查Nginx綁定配置..."
sudo nginx -T 2>/dev/null | grep -A 5 -B 5 "listen 6886"

# 7. 修復可能的問題
echo ""
echo "🔧 嘗試修復常見問題..."

# 確保ufw允許6886端口
echo "開放6886端口..."
sudo ufw allow 6886/tcp || echo "ufw規則添加失敗"

# 確保Nginx配置正確綁定
echo "更新Nginx配置為監聽所有接口..."
sudo tee /etc/nginx/sites-available/healthcare > /dev/null << 'EOF'
server {
    listen 6886;
    server_name 43.134.141.188 localhost;

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

# 8. 重新加載Nginx
echo ""
echo "🔄 重新加載Nginx..."
sudo nginx -t && sudo systemctl reload nginx

# 9. 檢查雲服務器安全組
echo ""
echo "📋 檢查雲服務器安全組設置..."
echo "請確保您的雲服務器安全組已開放以下端口："
echo "- 6886 (主要訪問端口)"
echo "- 7723 (API端口，可選)"
echo "- 8081 (數據庫管理端口，可選)"
echo "- 8899 (MongoDB端口，可選)"

# 10. 最終測試
echo ""
echo "⏳ 等待10秒後進行最終測試..."
sleep 10

echo ""
echo "🎯 最終測試結果..."
echo "本地測試："
curl -s -o /dev/null -w "前端 (localhost:6886): %{http_code}\n" http://localhost:6886/
curl -s -o /dev/null -w "API (localhost:6886/hcbe): %{http_code}\n" http://localhost:6886/hcbe/api/health

echo ""
echo "外部測試："
curl -s -o /dev/null -w "前端 (43.134.141.188:6886): %{http_code}\n" http://43.134.141.188:6886/ --connect-timeout 10
curl -s -o /dev/null -w "API (43.134.141.188:6886/hcbe): %{http_code}\n" http://43.134.141.188:6886/hcbe/api/health --connect-timeout 10

echo ""
echo "🔍 如果外部訪問仍然失敗，請檢查："
echo "1. 雲服務器安全組是否開放6886端口"
echo "2. 雲服務器防火牆設置"
echo "3. 網絡供應商是否有端口限制"

echo ""
echo "📱 如果一切正常，您可以通過以下地址訪問："
echo "- 前端應用：http://43.134.141.188:6886/"
echo "- API文檔：http://43.134.141.188:6886/hcbe/api-docs"
echo "- 數據庫管理：http://43.134.141.188:6886/db/" 
