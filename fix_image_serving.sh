#!/bin/bash

# 修复图片服务路径配置
echo "🔧 修复图片服务路径配置..."

# 1. 检查当前Nginx配置
echo "🔍 检查当前Nginx配置..."
sudo cat /etc/nginx/sites-available/healthcare || echo "Nginx配置文件不存在"

# 2. 备份当前Nginx配置
echo "💾 备份当前Nginx配置..."
sudo cp /etc/nginx/sites-available/healthcare /etc/nginx/sites-available/healthcare.backup 2>/dev/null || echo "配置文件不存在，将创建新的"

# 3. 创建新的Nginx配置，添加图片服务路径
echo "📝 创建新的Nginx配置..."
sudo tee /etc/nginx/sites-available/healthcare > /dev/null << 'EOF'
server {
    listen 6886;
    server_name 43.134.141.188;

    # 前端静态文件
    location / {
        root /var/www/healthcare;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # API代理
    location /hcbe/api/ {
        proxy_pass http://localhost:7723/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # 图片文件服务 - 新增配置
    location /hcbe/uploads/ {
        alias /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        
        # 允许跨域访问
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept";
        
        # 处理OPTIONS请求
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, OPTIONS";
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept";
            return 204;
        }
    }

    # 数据库管理界面代理
    location /db/ {
        proxy_pass http://localhost:8081/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API文档代理
    location /hcbe/api-docs {
        proxy_pass http://localhost:7723/api-docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 错误页面
    error_page 404 /index.html;
    error_page 500 502 503 504 /index.html;
}
EOF

# 4. 测试Nginx配置
echo "🧪 测试Nginx配置..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx配置测试通过"
    
    # 5. 重新加载Nginx配置
    echo "🔄 重新加载Nginx配置..."
    sudo systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx配置重新加载成功"
    else
        echo "❌ Nginx配置重新加载失败"
        sudo systemctl status nginx
    fi
else
    echo "❌ Nginx配置测试失败"
    sudo nginx -t
    exit 1
fi

# 6. 检查uploads目录权限
echo "📁 检查uploads目录权限..."
ls -la /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/
ls -la /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/pic/
ls -la /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/pic/measurement/

# 7. 设置正确的权限，确保Nginx可以访问
echo "🔧 设置正确的权限..."
sudo chmod -R 755 /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/
sudo chown -R www-data:www-data /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/

# 8. 测试图片访问
echo "🧪 测试图片访问..."
TEST_IMAGE_PATH="/home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/pic/measurement/686cfdaad9374526398a2413/aihs_1751973314891_337400509.png"

if [ -f "$TEST_IMAGE_PATH" ]; then
    echo "✅ 测试图片文件存在"
    
    # 测试通过Nginx访问
    echo "🌐 测试通过Nginx访问图片..."
    curl -I "http://localhost:6886/hcbe/uploads/pic/measurement/686cfdaad9374526398a2413/aihs_1751973314891_337400509.png" || echo "图片访问测试失败"
else
    echo "❌ 测试图片文件不存在"
    echo "📂 查看measurement目录内容："
    ls -la /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/pic/measurement/
fi

# 9. 检查Nginx状态
echo "📊 检查Nginx状态..."
sudo systemctl status nginx --no-pager

# 10. 查看Nginx访问日志
echo "📋 查看Nginx访问日志..."
sudo tail -10 /var/log/nginx/access.log 2>/dev/null || echo "访问日志为空"

# 11. 查看Nginx错误日志
echo "📋 查看Nginx错误日志..."
sudo tail -10 /var/log/nginx/error.log 2>/dev/null || echo "错误日志为空"

echo "✅ 图片服务路径配置完成！"
echo "🌐 请访问以下URL测试图片："
echo "   http://43.134.141.188:6886/hcbe/uploads/pic/measurement/686cfdaad9374526398a2413/aihs_1751973314891_337400509.png"
echo "📱 然后在前端页面 /medical/diagnosis/form 测试图片显示功能" 