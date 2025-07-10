#!/bin/bash

echo "⚡ 医疗AI系统 - 快速前端发布脚本"
echo "==================================="

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 项目路径
FRONTEND_DIR="/home/ubuntu/code/healthcare_AI/healthcare_frontend"

# 检查前端目录
if [ ! -d "$FRONTEND_DIR" ]; then
    log_error "前端目录不存在: $FRONTEND_DIR"
    exit 1
fi

log_info "开始快速前端发布..."

# 1. 进入前端目录
cd "$FRONTEND_DIR" || exit 1

# 2. 拉取最新代码
log_info "拉取最新前端代码..."
git pull origin $(git branch --show-current)

# 3. 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    log_info "安装前端依赖..."
    npm install
fi

# 4. 构建前端
log_info "构建前端项目..."
export NODE_ENV=production
export VITE_API_URL=http://43.143.141.188:6886/hcbe
export VITE_STATIC_URL=http://43.143.141.188:6886

npm run build

# 5. 检查构建结果
if [ ! -f "dist/index.html" ]; then
    log_error "前端构建失败"
    exit 1
fi

# 6. 设置文件权限
log_info "设置文件权限..."
sudo chown -R www-data:www-data dist/
sudo chmod -R 755 dist/

# 7. 重新加载Nginx
log_info "重新加载Nginx..."
sudo systemctl reload nginx

# 8. 测试前端访问
log_info "测试前端访问..."
sleep 3
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://43.143.141.188:6886/)

if [ "$STATUS" = "200" ]; then
    log_success "前端发布成功！"
    echo ""
    echo "🎉 前端已成功发布！"
    echo "📋 访问地址: http://43.143.141.188:6886/"
else
    log_error "前端访问异常 (状态码: $STATUS)"
    echo "请检查Nginx配置和日志"
fi

echo ""
echo "💡 如有问题，请执行以下命令查看日志："
echo "   sudo tail -f /var/log/nginx/error.log" 