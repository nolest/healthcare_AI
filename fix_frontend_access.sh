#!/bin/bash

echo "🔧 医疗AI系统 - 前端访问问题快速修复脚本"
echo "=============================================="

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

echo "开始修复前端访问问题..."
echo ""

# 1. 检查并创建Nginx配置文件
log_info "检查Nginx配置文件..."
if [ ! -f "/etc/nginx/sites-available/healthcare" ]; then
    log_warning "Nginx配置文件不存在，正在创建..."
    
    sudo tee /etc/nginx/sites-available/healthcare > /dev/null <<'EOF'
server {
    listen 6886;
    server_name 43.143.141.188 localhost;
    
    client_max_body_size 100M;
    
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
    
    # 后端API代理
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
    
    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:7723/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # 文件上传
    location /uploads/ {
        proxy_pass http://127.0.0.1:7723/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # 错误页面
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist;
    }
}
EOF
    
    log_success "Nginx配置文件已创建"
else
    log_success "Nginx配置文件已存在"
fi

# 2. 创建或更新软链接
log_info "创建Nginx站点软链接..."
sudo ln -sf /etc/nginx/sites-available/healthcare /etc/nginx/sites-enabled/
log_success "软链接已创建"

# 3. 测试Nginx配置
log_info "测试Nginx配置..."
if sudo nginx -t; then
    log_success "Nginx配置测试通过"
else
    log_error "Nginx配置测试失败"
    exit 1
fi

# 4. 检查前端构建文件
log_info "检查前端构建文件..."
FRONTEND_DIR="/home/ubuntu/code/healthcare_AI/healthcare_frontend"
if [ ! -f "$FRONTEND_DIR/dist/index.html" ]; then
    log_warning "前端构建文件不存在，正在重新构建..."
    cd "$FRONTEND_DIR"
    npm run build
    if [ $? -eq 0 ]; then
        log_success "前端重新构建成功"
    else
        log_error "前端构建失败"
        exit 1
    fi
else
    log_success "前端构建文件存在"
fi

# 5. 设置文件权限
log_info "设置文件权限..."
sudo chown -R www-data:www-data "$FRONTEND_DIR/dist/"
sudo chmod -R 755 "$FRONTEND_DIR/dist/"
log_success "文件权限设置完成"

# 6. 重启Nginx服务
log_info "重启Nginx服务..."
sudo systemctl restart nginx
if sudo systemctl is-active --quiet nginx; then
    log_success "Nginx服务重启成功"
else
    log_error "Nginx服务重启失败"
    sudo systemctl status nginx
    exit 1
fi

# 7. 开放防火墙端口
log_info "开放防火墙端口..."
sudo ufw allow 6886
log_success "防火墙端口6886已开放"

# 8. 等待服务生效
log_info "等待服务生效..."
sleep 5

# 9. 测试访问
log_info "测试前端访问..."
echo ""
echo "🧪 访问测试结果："

# 测试本地访问
LOCAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:6886/ 2>/dev/null)
if [ "$LOCAL_STATUS" = "200" ]; then
    log_success "本地访问正常 (localhost:6886)"
else
    log_warning "本地访问异常 (状态码: $LOCAL_STATUS)"
fi

# 测试外部访问
EXTERNAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://43.143.141.188:6886/ 2>/dev/null)
if [ "$EXTERNAL_STATUS" = "200" ]; then
    log_success "外部访问正常 (43.143.141.188:6886)"
else
    log_warning "外部访问异常 (状态码: $EXTERNAL_STATUS)"
fi

# 10. 检查端口监听
log_info "检查端口监听状态..."
if sudo netstat -tlnp | grep -q :6886; then
    log_success "6886端口正在监听"
    sudo netstat -tlnp | grep :6886
else
    log_error "6886端口未监听"
fi

# 11. 显示结果
echo ""
echo "🎉 修复完成！"
echo "=================================="
echo "📊 服务状态："
echo "   Nginx服务: $(sudo systemctl is-active nginx)"
echo "   端口监听: $(sudo netstat -tlnp | grep :6886 | wc -l) 个进程监听6886端口"
echo ""
echo "📋 访问地址："
echo "   本地访问: http://localhost:6886/"
echo "   外部访问: http://43.143.141.188:6886/"
echo ""
echo "🔧 管理命令："
echo "   查看Nginx状态: sudo systemctl status nginx"
echo "   查看Nginx日志: sudo tail -f /var/log/nginx/error.log"
echo "   重启Nginx: sudo systemctl restart nginx"
echo "   测试配置: sudo nginx -t"
echo ""

# 12. 提供进一步的建议
if [ "$EXTERNAL_STATUS" != "200" ]; then
    echo "⚠️  如果外部访问仍然有问题，请检查："
    echo "1. 云服务器安全组是否开放6886端口"
    echo "2. 云服务器防火墙设置"
    echo "3. 网络连接是否正常"
    echo "4. 域名解析是否正确"
    echo ""
fi

log_success "前端访问问题修复脚本执行完成！" 