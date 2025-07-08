#!/bin/bash

echo "🔧 修復Nginx 500錯誤"
echo "==================="

# 檢查Nginx錯誤日誌
echo "🔍 檢查Nginx錯誤日誌..."
sudo tail -20 /var/log/nginx/error.log

echo ""
echo "🔍 檢查站點訪問日誌..."
sudo tail -10 /var/log/nginx/access.log

echo ""
echo "🔍 檢查前端文件是否存在..."
ls -la /var/www/healthcare/
echo ""
echo "檢查index.html是否存在:"
ls -la /var/www/healthcare/index.html || echo "❌ index.html不存在"

echo ""
echo "🔍 檢查Nginx配置文件..."
cat /etc/nginx/sites-available/healthcare

echo ""
echo "🔧 重新構建前端並部署..."
cd /home/ubuntu/code/healthcare_AI/healthcare_frontend

# 檢查Node.js版本
echo "Node.js版本: $(node -v)"

# 安裝依賴
echo "📦 安裝前端依賴..."
npm install

# 構建前端
echo "🏗️ 構建前端..."
npm run build

# 檢查構建結果
echo "📁 檢查構建結果..."
ls -la dist/

# 部署到Nginx
echo "🚀 部署到Nginx..."
sudo rm -rf /var/www/healthcare/*
sudo cp -r dist/* /var/www/healthcare/
sudo chown -R www-data:www-data /var/www/healthcare/
sudo chmod -R 755 /var/www/healthcare/

echo ""
echo "🔍 驗證部署結果..."
ls -la /var/www/healthcare/
echo ""
echo "檢查index.html內容:"
head -5 /var/www/healthcare/index.html || echo "❌ index.html仍然不存在"

echo ""
echo "🔄 重新加載Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "⏳ 等待5秒後測試..."
sleep 5

echo ""
echo "🧪 測試修復結果..."
curl -s -o /dev/null -w "本地前端: %{http_code}\n" http://localhost:6886/
curl -s -o /dev/null -w "本地API: %{http_code}\n" http://localhost:6886/hcbe/api/health
curl -s -o /dev/null -w "外部前端: %{http_code}\n" http://43.143.141.188:6886/
curl -s -o /dev/null -w "外部API: %{http_code}\n" http://43.143.141.188:6886/hcbe/api/health

echo ""
echo "🔍 如果仍有問題，檢查最新錯誤日誌..."
sudo tail -5 /var/log/nginx/error.log 