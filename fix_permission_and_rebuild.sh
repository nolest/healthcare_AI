#!/bin/bash

echo "🔧 医疗AI系统 - 修复权限问题并重新构建"
echo "=========================================="

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
NEW_IP="43.134.141.188"

# 1. 检查当前权限
log_info "检查当前文件权限..."
ls -la "$FRONTEND_DIR/dist/" 2>/dev/null || echo "dist目录不存在或无权限访问"

# 2. 修复文件权限
log_info "修复文件权限..."
# 将整个前端目录的所有权改为当前用户
sudo chown -R $USER:$USER "$FRONTEND_DIR"
log_success "文件权限已修复为当前用户"

# 3. 清理构建目录
log_info "清理构建目录..."
cd "$FRONTEND_DIR"
rm -rf dist node_modules/.vite .vite
log_success "构建目录已清理"

# 4. 重新构建前端
log_info "重新构建前端..."

# 设置正确的环境变量
export NODE_ENV=production
export VITE_API_URL=http://$NEW_IP:6886/hcbe
export VITE_STATIC_URL=http://$NEW_IP:6886

echo "使用的环境变量："
echo "  NODE_ENV=$NODE_ENV"
echo "  VITE_API_URL=$VITE_API_URL"
echo "  VITE_STATIC_URL=$VITE_STATIC_URL"

# 构建前端
npm run build

if [ $? -eq 0 ]; then
    log_success "前端构建成功"
else
    log_error "前端构建失败"
    
    # 尝试替代方案：手动清理并重试
    log_info "尝试手动清理并重试..."
    rm -rf dist
    mkdir -p dist
    
    # 再次尝试构建
    npm run build
    
    if [ $? -eq 0 ]; then
        log_success "前端构建成功（重试后）"
    else
        log_error "前端构建仍然失败"
        
        # 显示详细错误信息
        log_info "显示详细错误信息..."
        npm run build --verbose
        exit 1
    fi
fi

# 5. 检查构建结果
log_info "检查构建结果..."
if [ -f "$FRONTEND_DIR/dist/index.html" ]; then
    log_success "构建文件检查通过"
    echo "  index.html大小: $(wc -c < $FRONTEND_DIR/dist/index.html) 字节"
    echo "  构建文件数量: $(find $FRONTEND_DIR/dist -type f | wc -l) 个文件"
else
    log_error "构建文件检查失败，index.html不存在"
    exit 1
fi

# 6. 设置正确的Nginx权限
log_info "设置Nginx访问权限..."
sudo chown -R www-data:www-data "$FRONTEND_DIR/dist/"
sudo chmod -R 755 "$FRONTEND_DIR/dist/"
log_success "Nginx访问权限设置完成"

# 7. 重新加载Nginx
log_info "重新加载Nginx..."
sudo systemctl reload nginx
log_success "Nginx重新加载完成"

# 8. 等待服务生效
log_info "等待服务生效..."
sleep 5

# 9. 全面测试访问
log_info "全面测试访问..."
echo ""
echo "🧪 访问测试结果："

# 测试前端页面
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$NEW_IP:6886/ 2>/dev/null)
if [ "$FRONTEND_STATUS" = "200" ]; then
    log_success "前端页面访问正常 - 状态码: $FRONTEND_STATUS"
else
    log_warning "前端页面访问异常 - 状态码: $FRONTEND_STATUS"
fi

# 测试API文档
API_DOCS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$NEW_IP:6886/hcbe/api-docs 2>/dev/null)
if [ "$API_DOCS_STATUS" = "200" ]; then
    log_success "API文档访问正常 - 状态码: $API_DOCS_STATUS"
else
    log_warning "API文档访问异常 - 状态码: $API_DOCS_STATUS"
fi

# 测试健康检查
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$NEW_IP:6886/hcbe/health 2>/dev/null)
if [ "$HEALTH_STATUS" = "200" ]; then
    log_success "健康检查正常 - 状态码: $HEALTH_STATUS"
else
    log_warning "健康检查异常 - 状态码: $HEALTH_STATUS"
fi

# 测试登录接口
log_info "测试登录接口..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' \
    http://$NEW_IP:6886/hcbe/auth/login 2>/dev/null)

LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)

if [ "$LOGIN_STATUS" = "200" ] || [ "$LOGIN_STATUS" = "201" ]; then
    log_success "登录接口正常 - 状态码: $LOGIN_STATUS"
    echo "  响应内容: $LOGIN_BODY"
elif [ "$LOGIN_STATUS" = "401" ]; then
    log_success "登录接口正常，返回401（可能是用户名或密码错误）"
    echo "  响应内容: $LOGIN_BODY"
elif [ "$LOGIN_STATUS" = "404" ]; then
    log_warning "登录接口返回404，可能是路由问题"
    echo "  响应内容: $LOGIN_BODY"
else
    log_warning "登录接口异常 - 状态码: $LOGIN_STATUS"
    echo "  响应内容: $LOGIN_BODY"
fi

# 10. 检查后端服务状态
log_info "检查后端服务状态..."
cd /home/ubuntu/code/healthcare_AI/healthcare_backend
echo "Docker容器状态："
docker-compose ps

# 11. 测试后端直接访问
log_info "测试后端直接访问..."
DIRECT_API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7723/health 2>/dev/null)
if [ "$DIRECT_API_STATUS" = "200" ]; then
    log_success "后端直接访问正常 - 状态码: $DIRECT_API_STATUS"
else
    log_warning "后端直接访问异常 - 状态码: $DIRECT_API_STATUS"
    log_info "可能需要重启后端服务..."
fi

# 12. 显示最终结果
echo ""
echo "🎉 权限修复和重新构建完成！"
echo "=================================="
echo "📊 修复内容："
echo "   ✅ 修复了文件权限问题"
echo "   ✅ 清理了构建缓存"
echo "   ✅ 重新构建了前端"
echo "   ✅ 设置了正确的Nginx权限"
echo ""
echo "📋 访问地址："
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

# 13. 提供故障排除建议
if [ "$HEALTH_STATUS" != "200" ] || [ "$LOGIN_STATUS" = "404" ]; then
    echo "⚠️  后端服务可能需要重启："
    echo "   cd /home/ubuntu/code/healthcare_AI/healthcare_backend"
    echo "   docker-compose restart"
    echo "   或者："
    echo "   docker-compose down && docker-compose up -d"
    echo ""
fi

log_success "权限修复和重新构建脚本执行完成！"

# 14. 显示文件权限信息
echo ""
echo "📁 当前文件权限信息："
echo "前端目录权限："
ls -la "$FRONTEND_DIR" | head -5
echo ""
echo "构建文件权限："
ls -la "$FRONTEND_DIR/dist" | head -5 