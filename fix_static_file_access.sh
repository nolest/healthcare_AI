#!/bin/bash

echo "🔧 医疗AI系统 - 修复静态文件访问配置"
echo "===================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 项目路径
BACKEND_DIR="/home/ubuntu/code/healthcare_AI/healthcare_backend"
UPLOADS_DIR="$BACKEND_DIR/uploads"
CORRECT_IP="43.134.141.188"

# 1. 分析问题URL
log_info "分析问题URL..."
PROBLEM_URL="http://43.134.141.188:6886/hcbe/uploads/pic/measurement/686cfdaad9374526398a2413/aihs_1751973314891_337400509.png"
echo "问题URL: $PROBLEM_URL"
echo ""
echo "URL分析："
echo "  - 协议: http"
echo "  - 域名: 43.134.141.188:6886"
echo "  - 路径: /hcbe/uploads/pic/measurement/..."
echo "  - 问题: /hcbe/uploads 路径不存在于Nginx配置中"

# 2. 检查实际文件位置
log_info "检查实际文件位置..."
cd "$BACKEND_DIR"

echo "检查uploads目录结构："
find uploads -name "*.png" -o -name "*.jpg" 2>/dev/null | head -5

echo ""
echo "检查具体文件是否存在："
if [ -f "uploads/pic/measurement/686cfdaad9374526398a2413/aihs_1751973314891_337400509.png" ]; then
    log_success "文件存在于服务器"
    ls -la "uploads/pic/measurement/686cfdaad9374526398a2413/aihs_1751973314891_337400509.png"
else
    log_warning "文件不存在，检查类似文件..."
    find uploads -name "*aihs_1751973314891_337400509*" 2>/dev/null
fi

# 3. 修复Nginx配置添加静态文件访问
log_info "修复Nginx配置添加静态文件访问..."
sudo cp /etc/nginx/sites-available/healthcare /etc/nginx/sites-available/healthcare.backup.$(date +%Y%m%d_%H%M%S)

# 创建新的Nginx配置，添加静态文件访问
sudo tee /etc/nginx/sites-available/healthcare > /dev/null << 'EOF'
server {
    listen 6886;
    server_name 43.134.141.188 localhost;
    
    # 前端静态文件
    location / {
        root /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
    }

    # 上传文件静态访问 - 新增配置
    location /hcbe/uploads/ {
        alias /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/;
        
        # 允许跨域访问
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
        
        # 缓存设置
        expires 1d;
        add_header Cache-Control "public";
        
        # 安全设置
        location ~* \.(php|php5|sh|pl|py)$ {
            deny all;
        }
        
        # 文件类型限制
        location ~* \.(jpg|jpeg|png|gif|bmp|ico|svg|tif|tiff|webp)$ {
            access_log off;
        }
    }

    # 后端API代理
    location /hcbe/ {
        # 排除uploads路径，避免冲突
        location ~ ^/hcbe/uploads/ {
            # 这个会被上面的location处理
        }
        
        # 其他API请求
        rewrite ^/hcbe/(.*)$ /api/$1 break;
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
        
        # 上传文件大小限制
        client_max_body_size 50M;
    }

    # 数据库管理界面代理
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

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

log_success "Nginx配置已更新，添加了静态文件访问支持"

# 4. 测试Nginx配置
log_info "测试Nginx配置..."
sudo nginx -t
if [ $? -eq 0 ]; then
    log_success "Nginx配置测试通过"
else
    log_error "Nginx配置测试失败"
    exit 1
fi

# 5. 重新加载Nginx
log_info "重新加载Nginx配置..."
sudo systemctl reload nginx
log_success "Nginx配置重新加载完成"

# 6. 设置uploads目录权限确保Nginx可以访问
log_info "设置uploads目录权限确保Nginx可以访问..."
sudo chmod -R 755 "$UPLOADS_DIR"
sudo chown -R www-data:www-data "$UPLOADS_DIR"
log_success "uploads目录权限已设置"

# 7. 等待服务生效
log_info "等待服务生效..."
sleep 5

# 8. 测试静态文件访问
log_info "测试静态文件访问..."
echo ""
echo "🧪 静态文件访问测试："

# 创建测试图片文件
TEST_IMG_DIR="$UPLOADS_DIR/test"
mkdir -p "$TEST_IMG_DIR"
echo "test image content" > "$TEST_IMG_DIR/test.txt"

# 测试文件访问
TEST_URL="http://$CORRECT_IP:6886/hcbe/uploads/test/test.txt"
TEST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" 2>/dev/null)

if [ "$TEST_STATUS" = "200" ]; then
    log_success "静态文件访问正常 - 状态码: $TEST_STATUS"
else
    log_warning "静态文件访问异常 - 状态码: $TEST_STATUS"
fi

# 测试实际的问题文件
echo ""
echo "测试问题文件访问："
ACTUAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROBLEM_URL" 2>/dev/null)
echo "问题URL状态码: $ACTUAL_STATUS"

# 9. 检查文件路径映射
log_info "检查文件路径映射..."
echo "URL路径映射："
echo "  请求URL: /hcbe/uploads/pic/measurement/..."
echo "  实际路径: $UPLOADS_DIR/pic/measurement/..."
echo "  Nginx配置: alias $UPLOADS_DIR/"

echo ""
echo "验证路径映射："
if [ -d "$UPLOADS_DIR/pic/measurement" ]; then
    echo "✅ measurement目录存在"
    ls -la "$UPLOADS_DIR/pic/measurement" | head -3
else
    echo "❌ measurement目录不存在"
    echo "现有目录："
    ls -la "$UPLOADS_DIR/pic/" 2>/dev/null || echo "pic目录也不存在"
fi

# 10. 检查文件权限
log_info "检查文件权限..."
echo "uploads目录权限："
ls -la "$UPLOADS_DIR"
echo ""
echo "pic目录权限："
ls -la "$UPLOADS_DIR/pic" 2>/dev/null || echo "pic目录不存在"

# 11. 测试各种文件访问
log_info "测试各种文件访问..."
echo "测试不同的静态文件URL："

# 查找一些实际存在的图片文件进行测试
find "$UPLOADS_DIR" -name "*.png" -o -name "*.jpg" 2>/dev/null | head -3 | while read file; do
    # 转换为URL路径
    url_path=$(echo "$file" | sed "s|$UPLOADS_DIR|/hcbe/uploads|")
    full_url="http://$CORRECT_IP:6886$url_path"
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "$full_url" 2>/dev/null)
    echo "  $full_url -> $status"
done

# 12. 显示最终结果
echo ""
echo "🎉 静态文件访问配置修复完成！"
echo "==============================="
echo "📊 修复内容："
echo "   ✅ 添加了Nginx静态文件访问配置"
echo "   ✅ 设置了正确的文件权限"
echo "   ✅ 配置了跨域访问支持"
echo "   ✅ 添加了文件缓存设置"
echo ""
echo "📋 URL路径映射："
echo "   请求: http://$CORRECT_IP:6886/hcbe/uploads/..."
echo "   映射: $UPLOADS_DIR/..."
echo ""
echo "🔧 测试结果："
echo "   测试文件访问: 状态码 $TEST_STATUS"
echo "   问题文件访问: 状态码 $ACTUAL_STATUS"
echo ""

# 13. 提供使用说明
echo "📝 使用说明："
echo "   现在可以通过以下URL格式访问上传的图片："
echo "   http://$CORRECT_IP:6886/hcbe/uploads/pic/[用户ID]/[文件名]"
echo "   http://$CORRECT_IP:6886/hcbe/uploads/covid/[用户ID]/[文件名]"
echo "   http://$CORRECT_IP:6886/hcbe/uploads/measurement/[用户ID]/[文件名]"
echo ""

# 14. 清理测试文件
rm -f "$TEST_IMG_DIR/test.txt"
rmdir "$TEST_IMG_DIR" 2>/dev/null

if [ "$ACTUAL_STATUS" = "200" ]; then
    log_success "🎉 图片访问问题已完全解决！"
elif [ "$TEST_STATUS" = "200" ]; then
    log_success "✅ 静态文件访问配置正常，请检查具体文件路径"
else
    log_warning "⚠️  静态文件访问可能仍有问题，请检查Nginx配置"
fi

log_success "静态文件访问配置修复脚本执行完成！" 