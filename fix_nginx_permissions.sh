#!/bin/bash

# 修复Nginx权限问题
echo "🔧 修复Nginx权限问题..."

# 1. 检查当前权限状态
echo "🔍 检查当前权限状态..."
echo "uploads目录权限："
ls -la /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/

echo "用户目录权限："
ls -la /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/pic/measurement/686cfdaad9374526398a2413/

# 2. 检查Nginx运行用户
echo "👤 检查Nginx运行用户..."
ps aux | grep nginx | head -3

# 3. 解决方案1：修改目录权限，让所有用户可读
echo "🔧 方案1：设置目录为所有用户可读..."
sudo chmod -R 755 /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/
sudo chmod -R +r /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/

# 4. 解决方案2：确保父目录可访问
echo "🔧 方案2：确保父目录可访问..."
sudo chmod +x /home/ubuntu/
sudo chmod +x /home/ubuntu/code/
sudo chmod +x /home/ubuntu/code/healthcare_AI/
sudo chmod +x /home/ubuntu/code/healthcare_AI/healthcare_backend/

# 5. 解决方案3：将www-data用户添加到ubuntu组
echo "🔧 方案3：将www-data用户添加到ubuntu组..."
sudo usermod -a -G ubuntu www-data

# 6. 解决方案4：更改uploads目录所有权
echo "🔧 方案4：更改uploads目录所有权..."
sudo chown -R www-data:www-data /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/

# 7. 最终权限设置
echo "🔧 最终权限设置..."
sudo chmod -R 755 /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/

# 8. 验证权限设置
echo "✅ 验证权限设置..."
echo "uploads目录权限："
ls -la /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/

echo "图片文件权限："
ls -la /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/pic/measurement/686cfdaad9374526398a2413/ 2>/dev/null || echo "目录不存在"

# 9. 测试www-data用户访问
echo "🧪 测试www-data用户访问..."
sudo -u www-data ls /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/ || echo "www-data用户无法访问uploads目录"
sudo -u www-data ls /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/pic/measurement/ || echo "www-data用户无法访问measurement目录"

# 10. 重新加载Nginx配置
echo "🔄 重新加载Nginx配置..."
sudo systemctl reload nginx

# 11. 测试图片访问
echo "🧪 测试图片访问..."
sleep 2

# 测试特定图片
TEST_URL="http://localhost:6886/hcbe/uploads/pic/measurement/686cfdaad9374526398a2413/aihs_1751973314891_337400509.png"
echo "测试URL: $TEST_URL"
curl -I "$TEST_URL" 2>/dev/null

# 12. 查看最新的错误日志
echo "📋 查看最新的错误日志..."
sudo tail -3 /var/log/nginx/error.log

# 13. 创建测试文件验证权限
echo "🧪 创建测试文件验证权限..."
TEST_FILE="/home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/test_nginx_access.txt"
echo "test content" | sudo tee "$TEST_FILE" > /dev/null
sudo chmod 644 "$TEST_FILE"
sudo chown www-data:www-data "$TEST_FILE"

# 测试访问测试文件
TEST_FILE_URL="http://localhost:6886/hcbe/uploads/test_nginx_access.txt"
echo "测试文件URL: $TEST_FILE_URL"
curl -s "$TEST_FILE_URL" || echo "测试文件访问失败"

# 清理测试文件
sudo rm -f "$TEST_FILE"

echo "✅ Nginx权限修复完成！"
echo "🌐 请在浏览器中测试图片访问："
echo "   http://43.134.141.188:6886/hcbe/uploads/pic/measurement/686cfdaad9374526398a2413/aihs_1751973314891_337400509.png" 