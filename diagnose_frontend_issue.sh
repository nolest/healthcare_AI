#!/bin/bash

echo "🔍 医疗AI系统 - 前端访问问题诊断脚本"
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

echo "开始诊断前端访问问题..."
echo ""

# 1. 检查前端构建文件
log_info "检查前端构建文件..."
FRONTEND_DIR="/home/ubuntu/code/healthcare_AI/healthcare_frontend"
if [ -f "$FRONTEND_DIR/dist/index.html" ]; then
    log_success "前端构建文件存在"
    echo "   文件大小: $(ls -lh $FRONTEND_DIR/dist/index.html | awk '{print $5}')"
    echo "   修改时间: $(ls -l $FRONTEND_DIR/dist/index.html | awk '{print $6, $7, $8}')"
else
    log_error "前端构建文件不存在: $FRONTEND_DIR/dist/index.html"
fi

# 2. 检查文件权限
log_info "检查文件权限..."
ls -la "$FRONTEND_DIR/dist/" | head -10

# 3. 检查Nginx状态
log_info "检查Nginx服务状态..."
sudo systemctl status nginx --no-pager -l | grep -E "(Active|Main PID|Memory|Tasks)"

# 4. 检查端口监听
log_info "检查端口监听状态..."
echo "6886端口（前端）："
sudo netstat -tlnp | grep :6886 || echo "❌ 6886端口未监听"

echo "80端口（HTTP）："
sudo netstat -tlnp | grep :80 || echo "❌ 80端口未监听"

echo "443端口（HTTPS）："
sudo netstat -tlnp | grep :443 || echo "❌ 443端口未监听"

# 5. 检查Nginx配置
log_info "检查Nginx配置..."
echo "测试Nginx配置语法："
sudo nginx -t

echo ""
echo "检查healthcare站点配置："
if [ -f "/etc/nginx/sites-available/healthcare" ]; then
    log_success "Nginx配置文件存在"
    echo "配置文件内容（前20行）："
    sudo head -20 /etc/nginx/sites-available/healthcare
else
    log_error "Nginx配置文件不存在: /etc/nginx/sites-available/healthcare"
fi

# 6. 检查软链接
log_info "检查Nginx站点软链接..."
if [ -L "/etc/nginx/sites-enabled/healthcare" ]; then
    log_success "软链接存在"
    echo "   链接目标: $(readlink /etc/nginx/sites-enabled/healthcare)"
else
    log_error "软链接不存在: /etc/nginx/sites-enabled/healthcare"
fi

# 7. 检查Nginx错误日志
log_info "检查Nginx错误日志（最近20行）..."
sudo tail -20 /var/log/nginx/error.log

# 8. 检查防火墙状态
log_info "检查防火墙状态..."
sudo ufw status

# 9. 测试本地访问
log_info "测试本地访问..."
echo "测试localhost:6886："
curl -s -o /dev/null -w "状态码: %{http_code}, 响应时间: %{time_total}s\n" http://localhost:6886/ || echo "连接失败"

echo "测试127.0.0.1:6886："
curl -s -o /dev/null -w "状态码: %{http_code}, 响应时间: %{time_total}s\n" http://127.0.0.1:6886/ || echo "连接失败"

# 10. 测试外部访问
log_info "测试外部访问..."
echo "测试43.143.141.188:6886："
curl -s -o /dev/null -w "状态码: %{http_code}, 响应时间: %{time_total}s\n" http://43.143.141.188:6886/ || echo "连接失败"

# 11. 检查系统资源
log_info "检查系统资源..."
echo "内存使用："
free -h

echo "磁盘使用："
df -h | grep -E "(Filesystem|/dev/)"

echo "CPU负载："
uptime

# 12. 检查进程
log_info "检查相关进程..."
echo "Nginx进程："
ps aux | grep nginx | grep -v grep

echo "Node.js进程："
ps aux | grep node | grep -v grep

# 13. 提供修复建议
echo ""
echo "🔧 修复建议："
echo "=================================="

# 检查是否需要重启Nginx
if ! sudo systemctl is-active --quiet nginx; then
    log_error "Nginx服务未运行"
    echo "1. 启动Nginx服务: sudo systemctl start nginx"
elif ! sudo netstat -tlnp | grep -q :6886; then
    log_error "6886端口未监听"
    echo "1. 检查Nginx配置文件"
    echo "2. 重启Nginx服务: sudo systemctl restart nginx"
else
    log_info "基本服务正常，可能的问题："
    echo "1. 防火墙阻止了6886端口"
    echo "2. 云服务器安全组未开放6886端口"
    echo "3. Nginx配置文件有问题"
fi

echo ""
echo "💡 快速修复命令："
echo "# 重新创建软链接"
echo "sudo ln -sf /etc/nginx/sites-available/healthcare /etc/nginx/sites-enabled/"
echo ""
echo "# 重启Nginx"
echo "sudo systemctl restart nginx"
echo ""
echo "# 开放防火墙端口"
echo "sudo ufw allow 6886"
echo ""
echo "# 检查云服务器安全组是否开放6886端口"
echo ""

log_success "诊断完成！" 