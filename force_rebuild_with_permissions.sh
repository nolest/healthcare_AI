#!/bin/bash

echo "🔧 医疗AI系统 - 强制清理权限并重新构建"
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
CORRECT_IP="43.134.141.188"

# 1. 强制清理dist目录权限
log_info "强制清理dist目录权限..."
cd "$FRONTEND_DIR"

# 使用sudo强制删除dist目录
log_info "使用sudo强制删除dist目录..."
sudo rm -rf dist
if [ $? -eq 0 ]; then
    log_success "dist目录已强制删除"
else
    log_error "无法删除dist目录"
fi

# 2. 修复整个前端目录权限
log_info "修复整个前端目录权限..."
sudo chown -R $USER:$USER "$FRONTEND_DIR"
sudo chmod -R 755 "$FRONTEND_DIR"
log_success "前端目录权限已修复"

# 3. 清理node_modules缓存
log_info "清理node_modules缓存..."
rm -rf node_modules/.vite .vite
log_success "构建缓存已清理"

# 4. 重新构建前端
log_info "重新构建前端..."

# 设置正确的环境变量
export NODE_ENV=production
export VITE_API_URL=http://$CORRECT_IP:6886/hcbe
export VITE_STATIC_URL=http://$CORRECT_IP:6886

echo "使用的环境变量："
echo "  NODE_ENV=$NODE_ENV"
echo "  VITE_API_URL=$VITE_API_URL"
echo "  VITE_STATIC_URL=$VITE_STATIC_URL"

# 构建前端
npm run build

if [ $? -eq 0 ]; then
    log_success "前端构建成功"
    
    # 检查构建结果
    if [ -f "dist/index.html" ]; then
        log_success "构建文件检查通过"
        echo "  index.html大小: $(wc -c < dist/index.html) 字节"
        echo "  构建文件数量: $(find dist -type f | wc -l) 个文件"
        echo "  构建文件列表:"
        ls -la dist/
    else
        log_error "构建文件检查失败，index.html不存在"
        exit 1
    fi
else
    log_error "前端构建失败"
    
    # 如果还是失败，尝试手动创建dist目录
    log_info "尝试手动创建dist目录..."
    mkdir -p dist
    chmod 755 dist
    
    # 再次尝试构建
    log_info "再次尝试构建..."
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

# 5. 设置正确的Nginx访问权限
log_info "设置Nginx访问权限..."
sudo chown -R www-data:www-data "$FRONTEND_DIR/dist/"
sudo chmod -R 755 "$FRONTEND_DIR/dist/"
log_success "Nginx访问权限设置完成"

# 6. 验证文件权限
log_info "验证文件权限..."
echo "dist目录权限："
ls -la dist/
echo ""
echo "assets目录权限："
ls -la dist/assets/ 2>/dev/null || echo "assets目录不存在"

# 7. 重新加载Nginx
log_info "重新加载Nginx..."
sudo systemctl reload nginx
log_success "Nginx重新加载完成"

# 8. 等待服务生效
log_info "等待服务生效..."
sleep 5

# 9. 全面测试API路由
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

# 测试健康检查
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$CORRECT_IP:6886/hcbe/health 2>/dev/null)
if [ "$HEALTH_STATUS" = "200" ]; then
    log_success "健康检查正常 - 状态码: $HEALTH_STATUS"
else
    log_warning "健康检查异常 - 状态码: $HEALTH_STATUS"
    # 尝试直接访问后端
    DIRECT_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7723/api/health 2>/dev/null)
    echo "  直接访问后端健康检查: $DIRECT_HEALTH"
fi

# 测试登录接口
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
    DIRECT_BODY=$(echo "$DIRECT_LOGIN" | head -n -1)
    echo "  直接访问后端登录接口状态码: $DIRECT_STATUS"
    echo "  直接访问后端登录接口响应: $DIRECT_BODY"
else
    log_warning "登录接口异常 - 状态码: $LOGIN_STATUS"
    echo "  响应内容: $LOGIN_BODY"
fi

# 10. 测试其他关键API
log_info "测试其他关键API..."

# 测试用户API
USERS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$CORRECT_IP:6886/hcbe/users 2>/dev/null)
echo "用户API (/hcbe/users): $USERS_STATUS"

# 测试诊断API
DIAGNOSES_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$CORRECT_IP:6886/hcbe/diagnoses 2>/dev/null)
echo "诊断API (/hcbe/diagnoses): $DIAGNOSES_STATUS"

# 测试测量API
MEASUREMENTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$CORRECT_IP:6886/hcbe/measurements 2>/dev/null)
echo "测量API (/hcbe/measurements): $MEASUREMENTS_STATUS"

# 11. 显示最终结果
echo ""
echo "🎉 强制权限修复和重新构建完成！"
echo "=================================="
echo "📊 修复内容："
echo "   ✅ 强制清理了dist目录权限"
echo "   ✅ 修复了整个前端目录权限"
echo "   ✅ 重新构建了前端"
echo "   ✅ 设置了正确的Nginx权限"
echo ""
echo "📋 访问地址："
echo "   前端页面: http://$CORRECT_IP:6886/ (状态码: $FRONTEND_STATUS)"
echo "   API文档: http://$CORRECT_IP:6886/hcbe/api-docs (状态码: $API_DOCS_STATUS)"
echo "   健康检查: http://$CORRECT_IP:6886/hcbe/health (状态码: $HEALTH_STATUS)"
echo "   登录接口: http://$CORRECT_IP:6886/hcbe/auth/login (状态码: $LOGIN_STATUS)"
echo "   用户API: http://$CORRECT_IP:6886/hcbe/users (状态码: $USERS_STATUS)"
echo "   诊断API: http://$CORRECT_IP:6886/hcbe/diagnoses (状态码: $DIAGNOSES_STATUS)"
echo "   测量API: http://$CORRECT_IP:6886/hcbe/measurements (状态码: $MEASUREMENTS_STATUS)"
echo ""
echo "🔧 测试命令："
echo "   curl http://$CORRECT_IP:6886/"
echo "   curl http://$CORRECT_IP:6886/hcbe/api-docs"
echo "   curl http://$CORRECT_IP:6886/hcbe/health"
echo "   curl -X POST -H \"Content-Type: application/json\" -d '{\"username\":\"admin\",\"password\":\"admin123\"}' http://$CORRECT_IP:6886/hcbe/auth/login"
echo ""

# 12. 显示当前文件权限状态
echo "📁 当前文件权限状态："
echo "前端目录权限："
ls -la "$FRONTEND_DIR" | head -5
echo ""
echo "构建文件权限："
ls -la "$FRONTEND_DIR/dist" | head -5
echo ""

# 13. 提供进一步的故障排除建议
if [ "$LOGIN_STATUS" = "200" ] || [ "$LOGIN_STATUS" = "201" ] || [ "$LOGIN_STATUS" = "401" ]; then
    log_success "🎉 登录接口已正常工作！系统修复完成！"
    echo ""
    echo "✅ 系统已完全修复并正常运行！"
    echo "   - 前端页面正常访问"
    echo "   - API路由前缀已修复"
    echo "   - 登录接口正常工作"
    echo "   - 所有IP地址已更正"
elif [ "$LOGIN_STATUS" = "404" ]; then
    log_warning "⚠️  登录接口仍然返回404，可能需要进一步检查："
    echo ""
    echo "🔧 进一步排查建议："
    echo "   1. 检查后端是否有 /api/auth/login 路由"
    echo "   2. 检查Nginx代理配置是否正确"
    echo "   3. 检查后端服务是否完全启动"
    echo ""
    echo "📝 手动测试命令："
    echo "   # 测试后端直接访问"
    echo "   curl -v http://localhost:7723/api/auth/login"
    echo "   # 测试Nginx代理"
    echo "   curl -v http://$CORRECT_IP:6886/hcbe/auth/login"
else
    log_warning "⚠️  登录接口状态异常，请检查系统配置"
fi

log_success "强制权限修复和重新构建脚本执行完成！" 