#!/bin/bash

echo "🔧 医疗AI系统 - 修复Nginx配置路径问题"
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

# 1. 备份当前配置
log_info "备份当前Nginx配置..."
sudo cp /etc/nginx/sites-available/healthcare /etc/nginx/sites-available/healthcare.backup.$(date +%Y%m%d_%H%M%S)
log_success "配置已备份"

# 2. 创建正确的Nginx配置
log_info "创建正确的Nginx配置..."
sudo tee /etc/nginx/sites-available/healthcare > /dev/null <<'EOF'
server {
    listen 6886;
    server_name 43.134.141.188 localhost;
    
    client_max_body_size 100M;
    
    # 前端静态文件 - 修复路径
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
    
    # 后端API代理 - 修复路径
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

log_success "Nginx配置已更新"

# 3. 显示配置差异
log_info "显示配置变更..."
echo "主要变更："
echo "  旧路径: root /var/www/healthcare;"
echo "  新路径: root /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist;"
echo "  修复了API代理路径"
echo "  添加了静态资源缓存"

# 4. 测试配置
log_info "测试Nginx配置..."
if sudo nginx -t; then
    log_success "Nginx配置测试通过"
else
    log_error "Nginx配置测试失败"
    log_info "恢复备份配置..."
    sudo cp /etc/nginx/sites-available/healthcare.backup.* /etc/nginx/sites-available/healthcare
    exit 1
fi

# 5. 确保文件权限正确
log_info "确保文件权限正确..."
sudo chown -R www-data:www-data /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist/
sudo chmod -R 755 /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist/
log_success "文件权限已设置"

# 6. 重新加载Nginx
log_info "重新加载Nginx配置..."
sudo systemctl reload nginx
if [ $? -eq 0 ]; then
    log_success "Nginx配置重新加载成功"
else
    log_error "Nginx重新加载失败"
    exit 1
fi

# 7. 等待生效
log_info "等待配置生效..."
sleep 3

# 8. 测试访问
log_info "测试访问..."
echo ""
echo "🧪 访问测试结果："

# 测试本地访问
LOCAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:6886/ 2>/dev/null)
if [ "$LOCAL_STATUS" = "200" ]; then
    log_success "本地访问正常 (localhost:6886) - 状态码: $LOCAL_STATUS"
else
    log_warning "本地访问异常 (状态码: $LOCAL_STATUS)"
fi

# 测试外部访问（短超时）
log_info "测试外部访问（10秒超时）..."
EXTERNAL_STATUS=$(timeout 10 curl -s -o /dev/null -w "%{http_code}" http://43.134.141.188:6886/ 2>/dev/null)
if [ "$EXTERNAL_STATUS" = "200" ]; then
    log_success "外部访问正常 (43.134.141.188:6886) - 状态码: $EXTERNAL_STATUS"
else
    log_warning "外部访问异常 (状态码: $EXTERNAL_STATUS)"
    log_info "这可能是云服务器安全组问题，不是Nginx配置问题"
fi

# 9. 检查前端文件内容
log_info "检查前端文件内容..."
if [ -f "/home/ubuntu/code/healthcare_AI/healthcare_frontend/dist/index.html" ]; then
    echo "index.html 文件大小: $(wc -c < /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist/index.html) 字节"
    echo "index.html 前5行内容:"
    head -5 /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist/index.html
else
    log_error "前端构建文件不存在"
fi

# 10. 显示结果
echo ""
echo "🎉 Nginx配置修复完成！"
echo "=================================="
echo "📊 修复内容："
echo "   ✅ 修复了前端文件路径"
echo "   ✅ 修复了API代理配置"
echo "   ✅ 添加了静态资源缓存"
echo "   ✅ 设置了正确的文件权限"
echo ""
echo "📋 访问地址："
echo "   本地访问: http://localhost:6886/ (状态码: $LOCAL_STATUS)"
echo "   外部访问: http://43.134.141.188:6886/ (状态码: $EXTERNAL_STATUS)"
echo ""
echo "🔧 管理命令："
echo "   查看配置: sudo cat /etc/nginx/sites-available/healthcare"
echo "   测试配置: sudo nginx -t"
echo "   重新加载: sudo systemctl reload nginx"
echo "   查看日志: sudo tail -f /var/log/nginx/error.log"
echo ""

# 11. 云服务器安全组提醒
if [ "$EXTERNAL_STATUS" != "200" ]; then
    echo "⚠️  外部访问问题解决方案："
    echo "=================================="
    echo "由于本地访问正常，但外部访问失败，这通常是云服务器安全组问题。"
    echo ""
    echo "请在云服务器控制台执行以下操作："
    echo "1. 进入云服务器管理控制台"
    echo "2. 找到安全组设置"
    echo "3. 添加入站规则："
    echo "   - 协议: TCP"
    echo "   - 端口: 6886"
    echo "   - 来源: 0.0.0.0/0 (允许所有IP访问)"
    echo "4. 保存并应用规则"
    echo ""
    echo "如果是阿里云ECS，路径是："
    echo "ECS控制台 → 实例 → 安全组 → 配置规则 → 添加安全组规则"
    echo ""
    echo "如果是腾讯云CVM，路径是："
    echo "CVM控制台 → 实例 → 安全组 → 编辑规则 → 添加规则"
    echo ""
fi

log_success "修复脚本执行完成！" 
