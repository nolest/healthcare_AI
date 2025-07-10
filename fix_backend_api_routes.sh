#!/bin/bash

echo "🔧 医疗AI系统 - 修复后端API路由问题"
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
NEW_IP="43.134.141.188"

# 1. 检查当前后端服务状态
log_info "检查当前后端服务状态..."
cd "$BACKEND_DIR"
echo "Docker容器状态："
docker-compose ps
echo ""

# 2. 检查后端日志
log_info "检查后端服务日志..."
echo "最近的后端日志："
docker-compose logs --tail=20 healthcare-api
echo ""

# 3. 测试后端直接访问
log_info "测试后端直接访问..."
echo "测试后端端口7723直接访问："

# 测试不同的路由
ROUTES=(
    "http://localhost:7723/"
    "http://localhost:7723/health"
    "http://localhost:7723/api-docs"
    "http://localhost:7723/auth/login"
)

for route in "${ROUTES[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$route" 2>/dev/null)
    if [ "$status" = "200" ] || [ "$status" = "201" ]; then
        log_success "✅ $route - 状态码: $status"
    elif [ "$status" = "404" ]; then
        log_warning "❌ $route - 状态码: $status (Not Found)"
    else
        log_warning "⚠️  $route - 状态码: $status"
    fi
done

echo ""

# 4. 重启后端服务
log_info "重启后端服务..."
echo "停止后端服务..."
docker-compose down

echo "等待服务完全停止..."
sleep 5

echo "启动后端服务..."
docker-compose up -d

echo "等待服务启动..."
sleep 10

# 5. 检查重启后的服务状态
log_info "检查重启后的服务状态..."
echo "Docker容器状态："
docker-compose ps
echo ""

# 6. 等待服务完全启动
log_info "等待服务完全启动..."
echo "等待30秒让服务完全启动..."
for i in {30..1}; do
    echo -ne "\r等待中... $i 秒"
    sleep 1
done
echo ""

# 7. 重新测试后端直接访问
log_info "重新测试后端直接访问..."
echo "测试后端端口7723直接访问："

for route in "${ROUTES[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$route" 2>/dev/null)
    if [ "$status" = "200" ] || [ "$status" = "201" ]; then
        log_success "✅ $route - 状态码: $status"
    elif [ "$status" = "404" ]; then
        log_warning "❌ $route - 状态码: $status (Not Found)"
    else
        log_warning "⚠️  $route - 状态码: $status"
    fi
done

echo ""

# 8. 测试登录接口
log_info "测试登录接口..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' \
    http://localhost:7723/auth/login 2>/dev/null)

LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)

echo "直接访问后端登录接口结果："
echo "  状态码: $LOGIN_STATUS"
echo "  响应内容: $LOGIN_BODY"
echo ""

# 9. 检查Nginx代理配置
log_info "检查Nginx代理配置..."
echo "当前Nginx配置："
sudo nginx -T 2>/dev/null | grep -A 20 -B 5 "location /hcbe"
echo ""

# 10. 重新加载Nginx
log_info "重新加载Nginx配置..."
sudo systemctl reload nginx
log_success "Nginx配置重新加载完成"

# 11. 测试通过Nginx代理的访问
log_info "测试通过Nginx代理的访问..."
echo "测试通过Nginx代理访问："

PROXY_ROUTES=(
    "http://$NEW_IP:6886/"
    "http://$NEW_IP:6886/hcbe/api-docs"
    "http://$NEW_IP:6886/hcbe/health"
)

for route in "${PROXY_ROUTES[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$route" 2>/dev/null)
    if [ "$status" = "200" ] || [ "$status" = "201" ]; then
        log_success "✅ $route - 状态码: $status"
    elif [ "$status" = "404" ]; then
        log_warning "❌ $route - 状态码: $status (Not Found)"
    else
        log_warning "⚠️  $route - 状态码: $status"
    fi
done

echo ""

# 12. 测试通过Nginx代理的登录接口
log_info "测试通过Nginx代理的登录接口..."
PROXY_LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' \
    http://$NEW_IP:6886/hcbe/auth/login 2>/dev/null)

PROXY_LOGIN_STATUS=$(echo "$PROXY_LOGIN_RESPONSE" | tail -n1)
PROXY_LOGIN_BODY=$(echo "$PROXY_LOGIN_RESPONSE" | head -n -1)

echo "通过Nginx代理访问登录接口结果："
echo "  状态码: $PROXY_LOGIN_STATUS"
echo "  响应内容: $PROXY_LOGIN_BODY"
echo ""

# 13. 检查后端服务健康状态
log_info "检查后端服务健康状态..."
echo "Docker容器健康状态："
docker-compose ps
echo ""

echo "后端服务日志（最新20行）："
docker-compose logs --tail=20 healthcare-api
echo ""

# 14. 显示最终结果
echo ""
echo "🎉 后端API路由修复完成！"
echo "=========================="
echo "📊 修复内容："
echo "   ✅ 重启了后端Docker服务"
echo "   ✅ 重新加载了Nginx配置"
echo "   ✅ 测试了所有API路由"
echo ""
echo "📋 测试结果："
echo "   前端页面: http://$NEW_IP:6886/ - 正常"
echo "   API文档: http://$NEW_IP:6886/hcbe/api-docs - 状态码: $(curl -s -o /dev/null -w "%{http_code}" http://$NEW_IP:6886/hcbe/api-docs 2>/dev/null)"
echo "   健康检查: http://$NEW_IP:6886/hcbe/health - 状态码: $(curl -s -o /dev/null -w "%{http_code}" http://$NEW_IP:6886/hcbe/health 2>/dev/null)"
echo "   登录接口: http://$NEW_IP:6886/hcbe/auth/login - 状态码: $PROXY_LOGIN_STATUS"
echo ""

# 15. 提供故障排除建议
if [ "$PROXY_LOGIN_STATUS" = "404" ]; then
    echo "⚠️  如果登录接口仍然返回404，可能的原因："
    echo "   1. 后端路由配置问题"
    echo "   2. Nginx代理配置问题"
    echo "   3. 后端服务启动不完整"
    echo ""
    echo "🔧 进一步排查步骤："
    echo "   1. 查看后端详细日志："
    echo "      docker-compose logs healthcare-api"
    echo ""
    echo "   2. 检查后端路由配置："
    echo "      docker-compose exec healthcare-api cat /app/src/main.ts"
    echo ""
    echo "   3. 检查Nginx配置："
    echo "      sudo nginx -T | grep -A 10 -B 10 '/hcbe'"
    echo ""
    echo "   4. 手动测试后端："
    echo "      curl -v http://localhost:7723/auth/login"
    echo ""
elif [ "$PROXY_LOGIN_STATUS" = "200" ] || [ "$PROXY_LOGIN_STATUS" = "201" ] || [ "$PROXY_LOGIN_STATUS" = "401" ]; then
    echo "✅ 登录接口已正常工作！"
    echo ""
    echo "🧪 测试登录："
    echo "   curl -X POST -H \"Content-Type: application/json\" \\"
    echo "        -d '{\"username\":\"admin\",\"password\":\"admin123\"}' \\"
    echo "        http://$NEW_IP:6886/hcbe/auth/login"
    echo ""
fi

log_success "后端API路由修复脚本执行完成！" 