#!/bin/bash

echo "🔧 在Ubuntu服務器上修復IP地址並重新構建前端"
echo "============================================="

NEW_IP="43.134.141.188"
OLD_IP="43.134.141.188"

echo "🔍 當前工作目錄: $(pwd)"

# 1. 修復前端配置文件
echo "📝 修復前端配置文件..."
cd /home/ubuntu/code/healthcare_AI/healthcare_frontend

# 備份原文件
cp src/config/app.config.js src/config/app.config.js.backup

# 替換IP地址
sed -i "s/$OLD_IP/$NEW_IP/g" src/config/app.config.js

echo "✅ 檢查配置文件修改結果:"
grep -n "$NEW_IP" src/config/app.config.js || echo "❌ 未找到新IP地址"

echo ""
echo "🏗️ 重新構建前端..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 前端構建成功"
else
    echo "❌ 前端構建失敗"
    exit 1
fi

echo ""
echo "🚀 重新部署前端文件..."
sudo rm -rf /var/www/healthcare/*
sudo cp -r dist/* /var/www/healthcare/
sudo chown -R www-data:www-data /var/www/healthcare/
sudo chmod -R 755 /var/www/healthcare/

echo ""
echo "📁 檢查部署結果:"
ls -la /var/www/healthcare/ | head -5

echo ""
echo "⚙️ 更新Nginx配置..."
sudo tee /etc/nginx/sites-available/healthcare > /dev/null << EOF
server {
    listen 6886;
    server_name $NEW_IP localhost;

    client_max_body_size 100M;

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

echo ""
echo "🔄 重新加載Nginx..."
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo "✅ Nginx重新加載成功"
else
    echo "❌ Nginx配置有誤"
    exit 1
fi

echo ""
echo "⏳ 等待5秒後進行測試..."
sleep 5

echo ""
echo "🎯 測試修復結果..."
echo "前端頁面:"
curl -s -o /dev/null -w "前端 ($NEW_IP:6886): %{http_code}\n" http://$NEW_IP:6886/

echo "API健康檢查:"
curl -s -o /dev/null -w "API健康檢查 ($NEW_IP:6886/hcbe): %{http_code}\n" http://$NEW_IP:6886/hcbe/api/health

echo "登錄接口:"
curl -s -o /dev/null -w "登錄接口 ($NEW_IP:6886/hcbe): %{http_code}\n" http://$NEW_IP:6886/hcbe/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"test"}'

echo ""
echo "🎉 IP地址修復完成！"
echo "📋 請使用以下正確地址訪問："
echo "   - 前端: http://$NEW_IP:6886/"
echo "   - API文檔: http://$NEW_IP:6886/hcbe/api-docs"
echo "   - 數據庫管理: http://$NEW_IP:6886/db/"

echo ""
echo "🔍 重要提醒："
echo "1. 請清除瀏覽器緩存 (Ctrl+Shift+R 或 Ctrl+F5)"
echo "2. 重新訪問前端頁面"
echo "3. 嘗試登錄功能"
echo "4. 如果仍有問題，檢查瀏覽器控制台錯誤信息" 
