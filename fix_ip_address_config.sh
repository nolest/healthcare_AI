#!/bin/bash

echo "🔧 医疗AI系统 - 修复IP地址配置"
echo "=================================="

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

# 定义IP地址
OLD_IP="43.143.141.188"
NEW_IP="43.134.141.188"

echo "IP地址配置修复："
echo "  错误IP: $OLD_IP"
echo "  正确IP: $NEW_IP"
echo ""

# 1. 备份Nginx配置
log_info "备份当前Nginx配置..."
sudo cp /etc/nginx/sites-available/healthcare /etc/nginx/sites-available/healthcare.backup.ip_fix.$(date +%Y%m%d_%H%M%S)
log_success "配置已备份"

# 2. 修复Nginx配置中的IP地址
log_info "修复Nginx配置中的IP地址..."
sudo sed -i "s/$OLD_IP/$NEW_IP/g" /etc/nginx/sites-available/healthcare
log_success "Nginx配置中的IP地址已修复"

# 3. 显示修复后的配置
log_info "显示修复后的server_name配置..."
sudo grep "server_name" /etc/nginx/sites-available/healthcare

# 4. 测试Nginx配置
log_info "测试Nginx配置..."
if sudo nginx -t; then
    log_success "Nginx配置测试通过"
else
    log_error "Nginx配置测试失败"
    log_info "恢复备份配置..."
    sudo cp /etc/nginx/sites-available/healthcare.backup.ip_fix.* /etc/nginx/sites-available/healthcare
    exit 1
fi

# 5. 重新加载Nginx
log_info "重新加载Nginx配置..."
sudo systemctl reload nginx
if [ $? -eq 0 ]; then
    log_success "Nginx配置重新加载成功"
else
    log_error "Nginx重新加载失败"
    exit 1
fi

# 6. 检查前端环境变量配置
log_info "检查前端环境变量配置..."
FRONTEND_DIR="/home/ubuntu/code/healthcare_AI/healthcare_frontend"

# 检查是否有.env文件
if [ -f "$FRONTEND_DIR/.env" ]; then
    log_info "检查.env文件中的API地址..."
    if grep -q "$OLD_IP" "$FRONTEND_DIR/.env"; then
        log_warning "发现.env文件中有错误的IP地址，正在修复..."
        sed -i "s/$OLD_IP/$NEW_IP/g" "$FRONTEND_DIR/.env"
        log_success ".env文件中的IP地址已修复"
    else
        log_success ".env文件中的IP地址正确"
    fi
else
    log_info ".env文件不存在，将创建正确的环境变量文件..."
    cat > "$FRONTEND_DIR/.env" << EOF
VITE_API_URL=http://$NEW_IP:6886/hcbe
VITE_STATIC_URL=http://$NEW_IP:6886
NODE_ENV=production
EOF
    log_success ".env文件已创建"
fi

# 7. 检查前端配置文件
log_info "检查前端配置文件..."
if [ -f "$FRONTEND_DIR/src/config/app.config.js" ]; then
    if grep -q "$OLD_IP" "$FRONTEND_DIR/src/config/app.config.js"; then
        log_warning "发现前端配置文件中有错误的IP地址，正在修复..."
        sed -i "s/$OLD_IP/$NEW_IP/g" "$FRONTEND_DIR/src/config/app.config.js"
        log_success "前端配置文件中的IP地址已修复"
    else
        log_success "前端配置文件中的IP地址正确"
    fi
fi

# 8. 重新构建前端（使用正确的环境变量）
log_info "重新构建前端..."
cd "$FRONTEND_DIR"

# 设置正确的环境变量
export NODE_ENV=production
export VITE_API_URL=http://$NEW_IP:6886/hcbe
export VITE_STATIC_URL=http://$NEW_IP:6886

# 构建前端
npm run build

if [ $? -eq 0 ]; then
    log_success "前端重新构建成功"
else
    log_error "前端构建失败"
    exit 1
fi

# 9. 设置文件权限
log_info "设置文件权限..."
sudo chown -R www-data:www-data "$FRONTEND_DIR/dist/"
sudo chmod -R 755 "$FRONTEND_DIR/dist/"
log_success "文件权限设置完成"

# 10. 等待服务生效
log_info "等待服务生效..."
sleep 5

# 11. 测试访问
log_info "测试访问..."
echo ""
echo "🧪 访问测试结果："

# 测试前端页面
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$NEW_IP:6886/ 2>/dev/null)
if [ "$FRONTEND_STATUS" = "200" ]; then
    log_success "前端页面访问正常 (http://$NEW_IP:6886/) - 状态码: $FRONTEND_STATUS"
else
    log_warning "前端页面访问异常 (状态码: $FRONTEND_STATUS)"
fi

# 测试API文档
API_DOCS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$NEW_IP:6886/hcbe/api-docs 2>/dev/null)
if [ "$API_DOCS_STATUS" = "200" ]; then
    log_success "API文档访问正常 (http://$NEW_IP:6886/hcbe/api-docs) - 状态码: $API_DOCS_STATUS"
else
    log_warning "API文档访问异常 (状态码: $API_DOCS_STATUS)"
fi

# 测试健康检查
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$NEW_IP:6886/hcbe/health 2>/dev/null)
if [ "$HEALTH_STATUS" = "200" ]; then
    log_success "健康检查正常 (http://$NEW_IP:6886/hcbe/health) - 状态码: $HEALTH_STATUS"
else
    log_warning "健康检查异常 (状态码: $HEALTH_STATUS)"
fi

# 测试登录接口（POST请求）
log_info "测试登录接口..."
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' \
    http://$NEW_IP:6886/hcbe/auth/login 2>/dev/null)

if [ "$LOGIN_STATUS" = "200" ] || [ "$LOGIN_STATUS" = "201" ]; then
    log_success "登录接口正常 (http://$NEW_IP:6886/hcbe/auth/login) - 状态码: $LOGIN_STATUS"
elif [ "$LOGIN_STATUS" = "401" ]; then
    log_success "登录接口正常，返回401是正常的（用户名或密码错误）"
else
    log_warning "登录接口异常 (状态码: $LOGIN_STATUS)"
fi

# 12. 检查后端服务状态
log_info "检查后端服务状态..."
echo "Docker容器状态："
cd /home/ubuntu/code/healthcare_AI/healthcare_backend
docker-compose ps

echo ""
echo "后端API进程："
ps aux | grep node | grep -v grep | head -3

# 13. 显示结果
echo ""
echo "🎉 IP地址配置修复完成！"
echo "=================================="
echo "📊 修复内容："
echo "   ✅ 修复了Nginx配置中的IP地址"
echo "   ✅ 修复了前端环境变量"
echo "   ✅ 重新构建了前端"
echo "   ✅ 设置了正确的文件权限"
echo ""
echo "📋 访问地址（已修复）："
echo "   前端页面: http://$NEW_IP:6886/ (状态码: $FRONTEND_STATUS)"
echo "   API文档: http://$NEW_IP:6886/hcbe/api-docs (状态码: $API_DOCS_STATUS)"
echo "   健康检查: http://$NEW_IP:6886/hcbe/health (状态码: $HEALTH_STATUS)"
echo "   登录接口: http://$NEW_IP:6886/hcbe/auth/login (状态码: $LOGIN_STATUS)"
echo ""
echo "🔧 测试命令："
echo "   curl http://$NEW_IP:6886/"
echo "   curl http://$NEW_IP:6886/hcbe/api-docs"
echo "   curl http://$NEW_IP:6886/hcbe/health"
echo "   curl -X POST -H \"Content-Type: application/json\" -d '{\"username\":\"admin\",\"password\":\"admin123\"}' http://$NEW_IP:6886/hcbe/auth/login"
echo ""

log_success "IP地址配置修复脚本执行完成！"

# 14. 提供后续建议
echo ""
echo "💡 后续建议："
echo "1. 在浏览器中访问 http://$NEW_IP:6886/ 验证前端功能"
echo "2. 测试登录功能是否正常"
echo "3. 检查所有API接口是否正常工作"
echo "4. 如果后端服务异常，运行: cd /home/ubuntu/code/healthcare_AI/healthcare_backend && docker-compose restart" 