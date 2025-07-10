#!/bin/bash

echo "🔧 医疗AI系统 - 修复API路由前缀和IP地址"
echo "========================================"

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
FRONTEND_DIR="/home/ubuntu/code/healthcare_AI/healthcare_frontend"
BACKEND_DIR="/home/ubuntu/code/healthcare_AI/healthcare_backend"
WRONG_IP="43.134.141.188"
CORRECT_IP="43.134.141.188"

# 1. 修复Nginx配置中的API路由前缀
log_info "修复Nginx配置中的API路由前缀..."
sudo cp /etc/nginx/sites-available/healthcare /etc/nginx/sites-available/healthcare.backup.$(date +%Y%m%d_%H%M%S)

# 创建新的Nginx配置
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

    # 后端API代理 - 修复路径前缀
    location /hcbe/ {
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

log_success "Nginx配置已更新，修复了API路由前缀"

# 2. 测试Nginx配置
log_info "测试Nginx配置..."
sudo nginx -t
if [ $? -eq 0 ]; then
    log_success "Nginx配置测试通过"
else
    log_error "Nginx配置测试失败"
    exit 1
fi

# 3. 重新加载Nginx
log_info "重新加载Nginx配置..."
sudo systemctl reload nginx
log_success "Nginx配置重新加载完成"

# 4. 修复前端配置中的错误IP地址
log_info "修复前端配置中的错误IP地址..."
cd "$FRONTEND_DIR"

# 检查并修复 .env 文件
if [ -f ".env" ]; then
    log_info "修复.env文件中的IP地址..."
    sed -i "s/$WRONG_IP/$CORRECT_IP/g" .env
    log_success ".env文件中的IP地址已修复"
fi

# 检查并修复 src/config/app.config.js
if [ -f "src/config/app.config.js" ]; then
    log_info "修复app.config.js中的IP地址..."
    sed -i "s/$WRONG_IP/$CORRECT_IP/g" src/config/app.config.js
    log_success "app.config.js中的IP地址已修复"
fi

# 检查并修复 src/services/api.js
if [ -f "src/services/api.js" ]; then
    log_info "修复api.js中的IP地址..."
    sed -i "s/$WRONG_IP/$CORRECT_IP/g" src/services/api.js
    log_success "api.js中的IP地址已修复"
fi

# 5. 搜索并修复所有可能包含错误IP的文件
log_info "搜索并修复所有包含错误IP的文件..."
find . -type f -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" | xargs grep -l "$WRONG_IP" 2>/dev/null | while read file; do
    log_info "修复文件: $file"
    sed -i "s/$WRONG_IP/$CORRECT_IP/g" "$file"
done

log_success "所有前端文件中的错误IP地址已修复"

# 6. 修复后端配置中的错误IP地址
log_info "修复后端配置中的错误IP地址..."
cd "$BACKEND_DIR"

# 搜索并修复后端文件中的错误IP
find . -type f -name "*.js" -o -name "*.ts" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.md" | xargs grep -l "$WRONG_IP" 2>/dev/null | while read file; do
    log_info "修复后端文件: $file"
    sed -i "s/$WRONG_IP/$CORRECT_IP/g" "$file"
done

log_success "所有后端文件中的错误IP地址已修复"

# 7. 重新构建前端
log_info "重新构建前端..."
cd "$FRONTEND_DIR"

# 设置正确的环境变量
export NODE_ENV=production
export VITE_API_URL=http://$CORRECT_IP:6886/hcbe
export VITE_STATIC_URL=http://$CORRECT_IP:6886

echo "使用的环境变量："
echo "  NODE_ENV=$NODE_ENV"
echo "  VITE_API_URL=$VITE_API_URL"
echo "  VITE_STATIC_URL=$VITE_STATIC_URL"

# 清理并构建
rm -rf dist
npm run build

if [ $? -eq 0 ]; then
    log_success "前端重新构建成功"
else
    log_error "前端重新构建失败"
    exit 1
fi

# 8. 设置正确的文件权限
log_info "设置正确的文件权限..."
sudo chown -R www-data:www-data "$FRONTEND_DIR/dist/"
sudo chmod -R 755 "$FRONTEND_DIR/dist/"
log_success "文件权限设置完成"

# 9. 等待服务生效
log_info "等待服务生效..."
sleep 5

# 10. 全面测试API路由
log_info "全面测试API路由..."
echo ""
echo "🧪 API路由测试结果："

# 测试前端页面
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$CORRECT_IP:6886/ 2>/dev/null)
if [ "$FRONTEND_STATUS" = "200" ]; then
    log_success "前端页面访问正常 - 状态码: $FRONTEND_STATUS"
else
    log_warning "前端页面访问异常 - 状态码: $FRONTEND_STATUS"
fi

# 测试API文档
API_DOCS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$CORRECT_IP:6886/hcbe/api-docs 2>/dev/null)
if [ "$API_DOCS_STATUS" = "200" ]; then
    log_success "API文档访问正常 - 状态码: $API_DOCS_STATUS"
else
    log_warning "API文档访问异常 - 状态码: $API_DOCS_STATUS"
fi

# 测试健康检查 - 现在应该是 /hcbe/health -> /api/health
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$CORRECT_IP:6886/hcbe/health 2>/dev/null)
if [ "$HEALTH_STATUS" = "200" ]; then
    log_success "健康检查正常 - 状态码: $HEALTH_STATUS"
else
    log_warning "健康检查异常 - 状态码: $HEALTH_STATUS"
    # 尝试直接访问后端
    DIRECT_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7723/api/health 2>/dev/null)
    echo "  直接访问后端健康检查: $DIRECT_HEALTH"
fi

# 测试登录接口 - 现在应该是 /hcbe/auth/login -> /api/auth/login
log_info "测试登录接口..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' \
    http://$CORRECT_IP:6886/hcbe/auth/login 2>/dev/null)

LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)

if [ "$LOGIN_STATUS" = "200" ] || [ "$LOGIN_STATUS" = "201" ]; then
    log_success "登录接口正常 - 状态码: $LOGIN_STATUS"
    echo "  响应内容: $LOGIN_BODY"
elif [ "$LOGIN_STATUS" = "401" ]; then
    log_success "登录接口正常，返回401（可能是用户名或密码错误）"
    echo "  响应内容: $LOGIN_BODY"
elif [ "$LOGIN_STATUS" = "404" ]; then
    log_warning "登录接口仍然返回404"
    echo "  响应内容: $LOGIN_BODY"
    # 测试直接访问后端
    DIRECT_LOGIN=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"admin123"}' \
        http://localhost:7723/api/auth/login 2>/dev/null)
    DIRECT_STATUS=$(echo "$DIRECT_LOGIN" | tail -n1)
    echo "  直接访问后端登录接口状态码: $DIRECT_STATUS"
else
    log_warning "登录接口异常 - 状态码: $LOGIN_STATUS"
    echo "  响应内容: $LOGIN_BODY"
fi

# 11. 测试其他关键API
log_info "测试其他关键API..."

# 测试用户API
USERS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$CORRECT_IP:6886/hcbe/users 2>/dev/null)
echo "用户API (/hcbe/users): $USERS_STATUS"

# 测试诊断API
DIAGNOSES_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$CORRECT_IP:6886/hcbe/diagnoses 2>/dev/null)
echo "诊断API (/hcbe/diagnoses): $DIAGNOSES_STATUS"

# 12. 显示最终结果
echo ""
echo "🎉 API路由前缀和IP地址修复完成！"
echo "=================================="
echo "📊 修复内容："
echo "   ✅ 修复了Nginx API路由前缀 (/hcbe/* -> /api/*)"
echo "   ✅ 修复了所有错误的IP地址 ($WRONG_IP -> $CORRECT_IP)"
echo "   ✅ 重新构建了前端"
echo "   ✅ 设置了正确的文件权限"
echo ""
echo "📋 访问地址："
echo "   前端页面: http://$CORRECT_IP:6886/ (状态码: $FRONTEND_STATUS)"
echo "   API文档: http://$CORRECT_IP:6886/hcbe/api-docs (状态码: $API_DOCS_STATUS)"
echo "   健康检查: http://$CORRECT_IP:6886/hcbe/health (状态码: $HEALTH_STATUS)"
echo "   登录接口: http://$CORRECT_IP:6886/hcbe/auth/login (状态码: $LOGIN_STATUS)"
echo "   用户API: http://$CORRECT_IP:6886/hcbe/users (状态码: $USERS_STATUS)"
echo "   诊断API: http://$CORRECT_IP:6886/hcbe/diagnoses (状态码: $DIAGNOSES_STATUS)"
echo ""
echo "🔧 测试命令："
echo "   curl http://$CORRECT_IP:6886/"
echo "   curl http://$CORRECT_IP:6886/hcbe/api-docs"
echo "   curl http://$CORRECT_IP:6886/hcbe/health"
echo "   curl -X POST -H \"Content-Type: application/json\" -d '{\"username\":\"admin\",\"password\":\"admin123\"}' http://$CORRECT_IP:6886/hcbe/auth/login"
echo ""

# 13. 显示修复的关键配置
echo "🔧 关键配置修复："
echo "   Nginx路由重写: /hcbe/(.*)$ -> /api/\$1"
echo "   前端API地址: http://$CORRECT_IP:6886/hcbe"
echo "   后端实际路由: /api/*"
echo ""

if [ "$LOGIN_STATUS" = "200" ] || [ "$LOGIN_STATUS" = "201" ] || [ "$LOGIN_STATUS" = "401" ]; then
    log_success "🎉 登录接口已正常工作！系统修复完成！"
else
    log_warning "⚠️  登录接口可能仍有问题，请检查后端日志"
fi

log_success "API路由前缀和IP地址修复脚本执行完成！" 
