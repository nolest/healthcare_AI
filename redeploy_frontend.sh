#!/bin/bash

echo "🌐 医疗AI系统 - 前端重新发布脚本"
echo "===================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
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

# 错误处理函数
handle_error() {
    log_error "脚本执行失败: $1"
    exit 1
}

# 获取当前时间作为备份标识
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/home/ubuntu/backup/frontend_$TIMESTAMP"

# 项目路径
FRONTEND_DIR="/home/ubuntu/code/healthcare_AI/healthcare_frontend"
NGINX_ROOT="/home/ubuntu/code/healthcare_AI/healthcare_frontend/dist"

echo "📋 前端重新发布选项："
echo "1. 完整重新发布前端（推荐）"
echo "2. 仅更新代码并构建"
echo "3. 仅重新构建（不更新代码）"
echo "4. 快速发布（清理缓存+重新构建）"
echo ""
read -p "请选择发布类型 (1-4): " DEPLOY_TYPE

case $DEPLOY_TYPE in
    1)
        UPDATE_CODE=true
        CLEAN_INSTALL=true
        BUILD_FRONTEND=true
        BACKUP_DIST=true
        ;;
    2)
        UPDATE_CODE=true
        CLEAN_INSTALL=false
        BUILD_FRONTEND=true
        BACKUP_DIST=true
        ;;
    3)
        UPDATE_CODE=false
        CLEAN_INSTALL=false
        BUILD_FRONTEND=true
        BACKUP_DIST=true
        ;;
    4)
        UPDATE_CODE=false
        CLEAN_INSTALL=true
        BUILD_FRONTEND=true
        BACKUP_DIST=true
        ;;
    *)
        log_error "无效选择，使用默认的完整重新发布"
        UPDATE_CODE=true
        CLEAN_INSTALL=true
        BUILD_FRONTEND=true
        BACKUP_DIST=true
        ;;
esac

# 1. 检查前端目录是否存在
if [ ! -d "$FRONTEND_DIR" ]; then
    log_error "前端目录不存在: $FRONTEND_DIR"
    exit 1
fi

log_info "开始前端重新发布..."

# 2. 创建备份目录
if [ "$BACKUP_DIST" = true ]; then
    log_info "创建前端构建文件备份..."
    sudo mkdir -p /home/ubuntu/backup
    if [ -d "$NGINX_ROOT" ]; then
        sudo cp -r "$NGINX_ROOT" "$BACKUP_DIR"
        log_success "前端构建文件备份已创建: $BACKUP_DIR"
    fi
fi

# 3. 进入前端目录
cd "$FRONTEND_DIR" || handle_error "无法进入前端目录"

# 4. 更新代码
if [ "$UPDATE_CODE" = true ]; then
    log_info "更新前端代码..."
    
    # 保存当前分支
    CURRENT_BRANCH=$(git branch --show-current)
    log_info "当前分支: $CURRENT_BRANCH"
    
    # 拉取最新代码
    git fetch origin || handle_error "代码获取失败"
    git pull origin $CURRENT_BRANCH || handle_error "代码更新失败"
    
    log_success "前端代码更新完成"
fi

# 5. 清理并重新安装依赖
if [ "$CLEAN_INSTALL" = true ]; then
    log_info "清理并重新安装前端依赖..."
    
    # 清理旧的依赖和构建文件
    rm -rf node_modules package-lock.json dist
    
    # 重新安装依赖
    npm install || handle_error "前端依赖安装失败"
    
    log_success "前端依赖安装完成"
fi

# 6. 构建前端
if [ "$BUILD_FRONTEND" = true ]; then
    log_info "构建前端项目..."
    
    # 设置环境变量
    export NODE_ENV=production
    export VITE_API_URL=http://43.134.141.188:6886/hcbe
    export VITE_STATIC_URL=http://43.134.141.188:6886
    
    # 构建前端
    npm run build || handle_error "前端构建失败"
    
    # 检查构建结果
    if [ ! -d "dist" ]; then
        handle_error "前端构建失败，dist目录不存在"
    fi
    
    log_success "前端构建完成"
fi

# 7. 检查构建文件
log_info "检查构建文件..."
if [ -f "dist/index.html" ]; then
    log_success "构建文件检查通过"
else
    handle_error "构建文件检查失败，index.html不存在"
fi

# 8. 设置文件权限
log_info "设置文件权限..."
sudo chown -R www-data:www-data dist/
sudo chmod -R 755 dist/

# 9. 测试Nginx配置
log_info "测试Nginx配置..."
sudo nginx -t || handle_error "Nginx配置测试失败"

# 10. 重新加载Nginx
log_info "重新加载Nginx..."
sudo systemctl reload nginx || handle_error "Nginx重新加载失败"

# 11. 等待服务生效
log_info "等待服务生效..."
sleep 5

# 12. 验证前端部署
log_info "验证前端部署..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://43.134.141.188:6886/)
if [ "$FRONTEND_STATUS" = "200" ]; then
    log_success "前端页面正常访问 (状态码: $FRONTEND_STATUS)"
else
    log_warning "前端页面访问异常 (状态码: $FRONTEND_STATUS)"
fi

# 13. 检查关键文件
log_info "检查关键静态文件..."
STATIC_JS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://43.134.141.188:6886/assets/ | head -c 1)
if [ "$STATIC_JS_STATUS" = "2" ] || [ "$STATIC_JS_STATUS" = "3" ]; then
    log_success "静态文件访问正常"
else
    log_warning "静态文件访问可能有问题"
fi

# 14. 清理旧备份（保留最近3个前端备份）
log_info "清理旧的前端备份..."
cd /home/ubuntu/backup
ls -t | grep frontend_ | tail -n +4 | xargs -r sudo rm -rf
log_success "旧备份清理完成"

# 15. 显示构建信息
log_info "显示构建信息..."
echo ""
echo "📊 构建统计:"
echo "   构建时间: $(date)"
echo "   构建大小: $(du -sh $FRONTEND_DIR/dist 2>/dev/null | cut -f1)"
echo "   文件数量: $(find $FRONTEND_DIR/dist -type f | wc -l)"

# 16. 显示最终状态
echo ""
echo "🎉 前端重新发布完成！"
echo "=================================="
echo "📋 访问地址:"
echo "   前端: http://43.134.141.188:6886/"
echo ""
echo "📁 路径信息:"
echo "   前端源码: $FRONTEND_DIR"
echo "   构建文件: $NGINX_ROOT"
echo "   备份位置: $BACKUP_DIR"
echo ""
echo "🔧 管理命令:"
echo "   重新加载Nginx: sudo systemctl reload nginx"
echo "   查看Nginx状态: sudo systemctl status nginx"
echo "   查看Nginx日志: sudo tail -f /var/log/nginx/error.log"
echo "   重新构建前端: cd $FRONTEND_DIR && npm run build"
echo ""

# 17. 提供故障排除建议
if [ "$FRONTEND_STATUS" != "200" ]; then
    echo "⚠️  故障排除建议:"
    echo "1. 检查Nginx配置: sudo nginx -t"
    echo "2. 查看Nginx错误日志: sudo tail -20 /var/log/nginx/error.log"
    echo "3. 检查文件权限: ls -la $NGINX_ROOT"
    echo "4. 重启Nginx: sudo systemctl restart nginx"
    echo "5. 恢复备份: sudo rm -rf $NGINX_ROOT && sudo mv $BACKUP_DIR $NGINX_ROOT"
    echo ""
fi

log_success "前端重新发布脚本执行完成！"

# 18. 显示下一步建议
echo ""
echo "💡 建议:"
echo "1. 在浏览器中访问 http://43.134.141.188:6886/ 验证前端功能"
echo "2. 检查浏览器控制台是否有错误"
echo "3. 测试关键功能是否正常工作"
echo "4. 如有问题，可以使用备份快速恢复" 
