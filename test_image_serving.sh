#!/bin/bash

# 测试图片服务功能
echo "🧪 测试图片服务功能..."

# 1. 检查uploads目录结构
echo "📂 检查uploads目录结构..."
echo "基础目录："
ls -la /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/

echo "图片目录："
ls -la /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/pic/

echo "测量目录："
ls -la /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/pic/measurement/

# 2. 查找所有图片文件
echo "🔍 查找所有图片文件..."
find /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/ -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | head -5

# 3. 测试特定图片文件访问
echo "🧪 测试特定图片文件访问..."
SPECIFIC_IMAGE="/home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/pic/measurement/686cfdaad9374526398a2413/aihs_1751973314891_337400509.png"

if [ -f "$SPECIFIC_IMAGE" ]; then
    echo "✅ 目标图片文件存在"
    echo "📏 文件大小: $(du -h "$SPECIFIC_IMAGE" | cut -f1)"
    echo "🔑 文件权限: $(ls -la "$SPECIFIC_IMAGE")"
    
    # 测试HTTP访问
    echo "🌐 测试HTTP访问..."
    HTTP_URL="http://localhost:6886/hcbe/uploads/pic/measurement/686cfdaad9374526398a2413/aihs_1751973314891_337400509.png"
    
    echo "请求URL: $HTTP_URL"
    curl -I "$HTTP_URL" 2>/dev/null || echo "❌ HTTP访问失败"
    
    # 测试外部访问
    echo "🌍 测试外部访问..."
    EXTERNAL_URL="http://43.134.141.188:6886/hcbe/uploads/pic/measurement/686cfdaad9374526398a2413/aihs_1751973314891_337400509.png"
    echo "外部URL: $EXTERNAL_URL"
    curl -I "$EXTERNAL_URL" 2>/dev/null || echo "❌ 外部访问失败"
    
else
    echo "❌ 目标图片文件不存在"
    echo "📂 查看用户目录内容："
    ls -la /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/pic/measurement/686cfdaad9374526398a2413/ 2>/dev/null || echo "用户目录不存在"
fi

# 4. 测试任意一张存在的图片
echo "🎲 测试任意一张存在的图片..."
RANDOM_IMAGE=$(find /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/pic/measurement/ -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | head -1)

if [ -n "$RANDOM_IMAGE" ]; then
    echo "✅ 找到图片: $RANDOM_IMAGE"
    
    # 构建相对路径
    REL_PATH=${RANDOM_IMAGE#/home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/}
    HTTP_URL="http://localhost:6886/hcbe/uploads/$REL_PATH"
    EXTERNAL_URL="http://43.134.141.188:6886/hcbe/uploads/$REL_PATH"
    
    echo "🌐 本地测试URL: $HTTP_URL"
    curl -I "$HTTP_URL" 2>/dev/null || echo "❌ 本地访问失败"
    
    echo "🌍 外部测试URL: $EXTERNAL_URL"
    curl -I "$EXTERNAL_URL" 2>/dev/null || echo "❌ 外部访问失败"
else
    echo "❌ 没有找到任何图片文件"
fi

# 5. 检查Nginx配置
echo "🔧 检查Nginx配置..."
sudo nginx -t

# 6. 检查Nginx状态
echo "📊 检查Nginx状态..."
sudo systemctl status nginx --no-pager -l

# 7. 查看最近的访问日志
echo "📋 查看最近的访问日志..."
sudo tail -5 /var/log/nginx/access.log 2>/dev/null || echo "访问日志为空"

# 8. 查看最近的错误日志
echo "📋 查看最近的错误日志..."
sudo tail -5 /var/log/nginx/error.log 2>/dev/null || echo "错误日志为空"

echo "✅ 图片服务测试完成！"
echo "🌐 如果测试通过，请在浏览器中访问图片URL验证" 