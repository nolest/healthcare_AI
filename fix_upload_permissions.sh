#!/bin/bash

echo "🔧 医疗AI系统 - 修复图片上传权限问题"
echo "====================================="

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
UPLOADS_DIR="$BACKEND_DIR/uploads"
CORRECT_IP="43.134.141.188"

# 1. 检查上传目录结构
log_info "检查上传目录结构..."
cd "$BACKEND_DIR"

echo "当前上传目录结构："
ls -la uploads/ 2>/dev/null || echo "uploads目录不存在"

if [ -d "uploads" ]; then
    echo ""
    echo "上传子目录："
    find uploads -type d -exec ls -ld {} \; 2>/dev/null | head -10
    echo ""
    echo "上传文件权限样例："
    find uploads -type f -exec ls -l {} \; 2>/dev/null | head -5
else
    log_warning "uploads目录不存在，将创建"
fi

# 2. 创建并修复上传目录权限
log_info "创建并修复上传目录权限..."

# 创建必要的上传目录
mkdir -p uploads/pic
mkdir -p uploads/covid
mkdir -p uploads/measurement

# 设置目录权限
sudo chown -R ubuntu:ubuntu uploads/
sudo chmod -R 755 uploads/

# 特别为Docker容器设置权限
sudo chown -R 1000:1000 uploads/
sudo chmod -R 777 uploads/

log_success "上传目录权限已修复"

# 3. 检查Docker容器内的权限
log_info "检查Docker容器内的权限..."
echo "Docker容器状态："
docker-compose ps

echo ""
echo "检查容器内uploads目录权限："
docker-compose exec healthcare-api ls -la /app/uploads 2>/dev/null || echo "无法访问容器内uploads目录"

# 4. 检查后端日志中的错误
log_info "检查后端日志中的上传错误..."
echo "最近的上传相关错误："
docker-compose logs healthcare-api 2>/dev/null | grep -i "upload\|error\|EACCES\|permission" | tail -10

# 5. 测试上传目录写入权限
log_info "测试上传目录写入权限..."
TEST_FILE="$UPLOADS_DIR/test_upload.txt"
echo "测试文件" > "$TEST_FILE" 2>/dev/null
if [ -f "$TEST_FILE" ]; then
    log_success "上传目录写入权限正常"
    rm "$TEST_FILE"
else
    log_error "上传目录写入权限异常"
fi

# 6. 检查磁盘空间
log_info "检查磁盘空间..."
df -h "$UPLOADS_DIR"
echo ""
echo "uploads目录大小："
du -sh "$UPLOADS_DIR" 2>/dev/null || echo "无法获取目录大小"

# 7. 重启后端服务以应用权限更改
log_info "重启后端服务以应用权限更改..."
docker-compose restart healthcare-api

echo "等待服务重启..."
sleep 15

# 8. 检查服务重启后的状态
log_info "检查服务重启后的状态..."
echo "Docker容器状态："
docker-compose ps

echo ""
echo "检查服务健康状态："
curl -s http://localhost:7723/api/health 2>/dev/null | head -100 || echo "健康检查失败"

# 9. 测试上传接口
log_info "测试上传接口..."
echo "测试COVID评估接口..."

# 创建测试数据
TEST_DATA='{
  "patientId": "test123",
  "symptoms": ["fever", "cough"],
  "temperature": 38.5,
  "images": []
}'

UPLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$TEST_DATA" \
    http://localhost:7723/api/covid-assessments 2>/dev/null)

UPLOAD_STATUS=$(echo "$UPLOAD_RESPONSE" | tail -n1)
UPLOAD_BODY=$(echo "$UPLOAD_RESPONSE" | head -n -1)

echo "上传接口测试结果："
echo "  状态码: $UPLOAD_STATUS"
echo "  响应内容: $UPLOAD_BODY"

# 10. 测试通过Nginx代理的上传
log_info "测试通过Nginx代理的上传..."
PROXY_UPLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$TEST_DATA" \
    http://$CORRECT_IP:6886/hcbe/covid-assessments 2>/dev/null)

PROXY_UPLOAD_STATUS=$(echo "$PROXY_UPLOAD_RESPONSE" | tail -n1)
PROXY_UPLOAD_BODY=$(echo "$PROXY_UPLOAD_RESPONSE" | head -n -1)

echo "Nginx代理上传测试结果："
echo "  状态码: $PROXY_UPLOAD_STATUS"
echo "  响应内容: $PROXY_UPLOAD_BODY"

# 11. 检查上传配置
log_info "检查上传配置..."
echo "检查Nginx上传配置："
sudo nginx -T 2>/dev/null | grep -A 5 -B 5 "client_max_body_size\|upload"

echo ""
echo "检查后端上传配置："
docker-compose exec healthcare-api cat /app/src/main.ts 2>/dev/null | grep -A 5 -B 5 "upload\|multer" || echo "无法读取后端配置"

# 12. 显示详细的目录权限信息
log_info "显示详细的目录权限信息..."
echo "uploads目录详细权限："
ls -la "$UPLOADS_DIR"
echo ""
echo "子目录权限："
for dir in pic covid measurement; do
    if [ -d "$UPLOADS_DIR/$dir" ]; then
        echo "$dir目录权限："
        ls -la "$UPLOADS_DIR/$dir" | head -3
    fi
done

# 13. 显示最终结果
echo ""
echo "🎉 图片上传权限修复完成！"
echo "=========================="
echo "📊 修复内容："
echo "   ✅ 创建了所有必要的上传目录"
echo "   ✅ 设置了正确的目录权限 (777)"
echo "   ✅ 修复了Docker容器权限"
echo "   ✅ 重启了后端服务"
echo ""
echo "📋 测试结果："
echo "   直接上传接口: 状态码 $UPLOAD_STATUS"
echo "   Nginx代理上传: 状态码 $PROXY_UPLOAD_STATUS"
echo ""
echo "🔧 上传目录路径："
echo "   主目录: $UPLOADS_DIR"
echo "   图片目录: $UPLOADS_DIR/pic"
echo "   COVID目录: $UPLOADS_DIR/covid"
echo "   测量目录: $UPLOADS_DIR/measurement"
echo ""

# 14. 提供故障排除建议
if [ "$PROXY_UPLOAD_STATUS" = "500" ]; then
    echo "⚠️  仍然返回500错误，可能的原因："
    echo "   1. 后端代码中的文件处理逻辑问题"
    echo "   2. 数据库连接问题"
    echo "   3. 文件大小超过限制"
    echo "   4. 请求格式问题"
    echo ""
    echo "🔧 进一步排查步骤："
    echo "   1. 查看详细后端日志："
    echo "      docker-compose logs healthcare-api | tail -50"
    echo ""
    echo "   2. 检查具体错误信息："
    echo "      curl -v -X POST -H \"Content-Type: application/json\" -d '$TEST_DATA' http://$CORRECT_IP:6886/hcbe/covid-assessments"
    echo ""
    echo "   3. 测试简单的GET请求："
    echo "      curl http://$CORRECT_IP:6886/hcbe/covid-assessments"
    echo ""
elif [ "$PROXY_UPLOAD_STATUS" = "200" ] || [ "$PROXY_UPLOAD_STATUS" = "201" ]; then
    echo "✅ 上传接口已正常工作！"
    echo ""
    echo "🧪 测试图片上传："
    echo "   现在可以尝试在前端页面上传图片了"
    echo "   访问: http://$CORRECT_IP:6886/"
else
    echo "⚠️  上传接口返回状态码: $PROXY_UPLOAD_STATUS"
    echo "   可能需要进一步检查后端服务"
fi

log_success "图片上传权限修复脚本执行完成！" 