#!/bin/bash

echo "🔍 Healthcare AI 图片上传问题诊断脚本"
echo "======================================="

# 检查基本系统信息
echo ""
echo "📊 系统信息:"
echo "操作系统: $(lsb_release -d | cut -f2)"
echo "内核版本: $(uname -r)"
echo "当前用户: $(whoami)"
echo "当前用户ID: $(id -u)"
echo "当前组ID: $(id -g)"
echo "当前目录: $(pwd)"

# 检查磁盘空间
echo ""
echo "💾 磁盘空间:"
df -h | grep -E "(Filesystem|/dev/)"

# 检查内存使用
echo ""
echo "🧠 内存使用:"
free -h

# 检查项目目录结构
echo ""
echo "📁 项目目录结构检查:"
PROJECT_PATHS=(
    "/home/ubuntu/code/healthcare_AI"
    "/home/ubuntu/code/healthcare_AI/healthcare_backend"
    "/home/ubuntu/code/healthcare_AI/healthcare_backend/uploads"
    "/home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/pic"
    "/home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/pic/measurement"
    "/home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/pic/covid"
)

for path in "${PROJECT_PATHS[@]}"; do
    if [ -d "$path" ]; then
        echo "✅ $path 存在"
        ls -ld "$path"
    else
        echo "❌ $path 不存在"
    fi
done

# 检查Docker状态
echo ""
echo "🐳 Docker状态:"
if command -v docker &> /dev/null; then
    echo "Docker已安装: $(docker --version)"
    echo ""
    echo "运行中的容器:"
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo "Healthcare后端容器状态:"
    if docker ps | grep -q healthcare-backend; then
        echo "✅ Healthcare后端容器正在运行"
        CONTAINER_NAME=$(docker ps --format "{{.Names}}" | grep healthcare)
        echo "容器名称: $CONTAINER_NAME"
        
        # 检查容器内uploads目录权限
        echo ""
        echo "📁 容器内uploads目录权限检查:"
        docker exec $CONTAINER_NAME ls -la /app/ | grep uploads || echo "❌ uploads目录不存在"
        
        if docker exec $CONTAINER_NAME test -d /app/uploads; then
            echo "✅ uploads目录存在"
            docker exec $CONTAINER_NAME ls -la /app/uploads/
            
            # 检查容器内用户权限
            echo ""
            echo "🔐 容器内用户权限:"
            docker exec $CONTAINER_NAME whoami
            docker exec $CONTAINER_NAME id
            
            # 测试容器内写入权限
            echo ""
            echo "✍️ 容器内写入权限测试:"
            docker exec $CONTAINER_NAME touch /app/uploads/test_write.txt 2>/dev/null && \
                echo "✅ 可以创建文件" || echo "❌ 无法创建文件"
            
            docker exec $CONTAINER_NAME rm -f /app/uploads/test_write.txt 2>/dev/null
            
            # 检查子目录权限
            echo ""
            echo "📂 uploads子目录权限:"
            docker exec $CONTAINER_NAME find /app/uploads -type d -exec ls -ld {} \; 2>/dev/null | head -10
            
        else
            echo "❌ 无法访问uploads目录"
        fi
        
        # 检查容器日志中的错误
        echo ""
        echo "📋 容器最近日志 (最后20行):"
        docker logs $CONTAINER_NAME --tail 20
        
    else
        echo "❌ Healthcare后端容器未运行"
    fi
else
    echo "❌ Docker未安装"
fi

# 检查PM2状态
echo ""
echo "🔄 PM2状态:"
if command -v pm2 &> /dev/null; then
    echo "PM2已安装: $(pm2 --version)"
    echo ""
    pm2 list
    
    # 检查PM2应用的工作目录
    echo ""
    echo "📂 PM2应用工作目录:"
    pm2 show healthcare-backend 2>/dev/null | grep -E "(cwd|script)" || echo "未找到healthcare-backend应用"
    
else
    echo "❌ PM2未安装"
fi

# 检查端口监听
echo ""
echo "🌐 端口监听状态:"
echo "端口7723 (后端):"
netstat -tlnp 2>/dev/null | grep :7723 || echo "❌ 端口7723未监听"

echo "端口6886 (前端/Nginx):"
netstat -tlnp 2>/dev/null | grep :6886 || echo "❌ 端口6886未监听"

# 检查Nginx状态
echo ""
echo "🌍 Nginx状态:"
if command -v nginx &> /dev/null; then
    echo "Nginx已安装: $(nginx -v 2>&1)"
    systemctl is-active nginx && echo "✅ Nginx正在运行" || echo "❌ Nginx未运行"
    
    echo ""
    echo "Nginx配置测试:"
    nginx -t 2>&1
    
    echo ""
    echo "Nginx client_max_body_size 检查:"
    grep -r "client_max_body_size" /etc/nginx/ 2>/dev/null || echo "❌ 未找到client_max_body_size配置"
    
else
    echo "❌ Nginx未安装"
fi

# 详细的uploads目录权限检查 (项目目录)
echo ""
echo "📂 项目uploads目录权限详细检查:"
BACKEND_UPLOADS="/home/ubuntu/code/healthcare_AI/healthcare_backend/uploads"

if [ -d "$BACKEND_UPLOADS" ]; then
    echo "✅ 后端uploads目录存在: $BACKEND_UPLOADS"
    echo ""
    echo "📋 uploads目录详细信息:"
    ls -la "$BACKEND_UPLOADS"
    
    echo ""
    echo "🔐 uploads目录权限:"
    stat "$BACKEND_UPLOADS" | grep -E "(Access|Uid|Gid)"
    
    echo ""
    echo "✍️ uploads目录写入权限测试:"
    touch "$BACKEND_UPLOADS/test_write.txt" 2>/dev/null && \
        echo "✅ 可以创建文件" || echo "❌ 无法创建文件"
    
    rm -f "$BACKEND_UPLOADS/test_write.txt" 2>/dev/null
    
    # 检查pic子目录
    PIC_DIR="$BACKEND_UPLOADS/pic"
    if [ -d "$PIC_DIR" ]; then
        echo ""
        echo "📁 pic子目录权限:"
        ls -la "$PIC_DIR"
        stat "$PIC_DIR" | grep -E "(Access|Uid|Gid)"
        
        echo ""
        echo "✍️ pic子目录写入权限测试:"
        touch "$PIC_DIR/test_write.txt" 2>/dev/null && \
            echo "✅ 可以创建文件" || echo "❌ 无法创建文件"
        
        rm -f "$PIC_DIR/test_write.txt" 2>/dev/null
        
        # 检查measurement和covid子目录
        MEASUREMENT_DIR="$PIC_DIR/measurement"
        COVID_DIR="$PIC_DIR/covid"
        
        echo ""
        echo "📊 业务子目录权限检查:"
        for business_dir in "$MEASUREMENT_DIR" "$COVID_DIR"; do
            dir_name=$(basename "$business_dir")
            if [ -d "$business_dir" ]; then
                echo "✅ $dir_name 目录存在"
                ls -ld "$business_dir"
                stat "$business_dir" | grep -E "(Access|Uid|Gid)"
                
                # 写入权限测试
                touch "$business_dir/test_write.txt" 2>/dev/null && \
                    echo "✅ $dir_name 可以创建文件" || echo "❌ $dir_name 无法创建文件"
                
                rm -f "$business_dir/test_write.txt" 2>/dev/null
                
                # 检查用户目录
                echo "👥 $dir_name 用户目录 (显示前3个):"
                find "$business_dir" -maxdepth 1 -type d | head -4 | while read user_dir; do
                    if [ "$user_dir" != "$business_dir" ]; then
                        echo "  目录: $user_dir"
                        ls -ld "$user_dir"
                        stat "$user_dir" | grep -E "(Access|Uid|Gid)" | head -1
                    fi
                done
                echo ""
            else
                echo "❌ $dir_name 目录不存在"
            fi
        done
        
    else
        echo "❌ pic子目录不存在"
    fi
    
    # 检查目录层次结构
    echo ""
    echo "🌳 uploads目录结构:"
    find "$BACKEND_UPLOADS" -type d | head -20
    
else
    echo "❌ 后端uploads目录不存在: $BACKEND_UPLOADS"
    echo ""
    echo "🔧 创建uploads目录建议:"
    echo "mkdir -p $BACKEND_UPLOADS/pic/measurement"
    echo "mkdir -p $BACKEND_UPLOADS/pic/covid"
    echo "chmod 755 $BACKEND_UPLOADS"
    echo "chmod 755 $BACKEND_UPLOADS/pic"
    echo "chmod 755 $BACKEND_UPLOADS/pic/measurement"
    echo "chmod 755 $BACKEND_UPLOADS/pic/covid"
fi

# 检查当前工作目录的uploads (兼容性检查)
echo ""
echo "📂 当前目录uploads检查 (兼容性):"
if [ -d "uploads" ]; then
    echo "✅ 当前目录uploads存在"
    ls -la uploads/
else
    echo "❌ 当前目录uploads不存在"
fi

if [ -d "healthcare_backend/uploads" ]; then
    echo "✅ 相对路径healthcare_backend/uploads存在"
    ls -la healthcare_backend/uploads/
else
    echo "❌ 相对路径healthcare_backend/uploads不存在"
fi

# 检查Docker挂载目录权限
echo ""
echo "📂 Docker挂载目录权限检查:"
if [ -d "/opt/healthcare/uploads" ]; then
    echo "✅ /opt/healthcare/uploads 目录存在"
    echo ""
    echo "📋 挂载目录详细信息:"
    ls -la /opt/healthcare/uploads/
    
    echo ""
    echo "🔐 挂载目录权限:"
    stat /opt/healthcare/uploads/ | grep -E "(Access|Uid|Gid)"
    
    echo ""
    echo "✍️ 挂载目录写入权限测试:"
    touch /opt/healthcare/uploads/test_write.txt 2>/dev/null && \
        echo "✅ 可以创建文件" || echo "❌ 无法创建文件"
    
    rm -f /opt/healthcare/uploads/test_write.txt 2>/dev/null
    
else
    echo "❌ /opt/healthcare/uploads 目录不存在"
    echo ""
    echo "🔧 创建Docker挂载目录建议:"
    echo "sudo mkdir -p /opt/healthcare/uploads"
    echo "sudo chown 1001:1001 /opt/healthcare/uploads"
    echo "sudo chmod 755 /opt/healthcare/uploads"
fi

# 测试API连通性
echo ""
echo "🔗 API连通性测试:"
echo "测试健康检查端点..."
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" http://localhost:7723/ || echo "❌ 无法连接到后端API"

echo ""
echo "测试文件上传端点..."
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" http://localhost:7723/hcbe/api/measurements || echo "❌ 无法连接到measurements API"

# 检查最近的错误日志
echo ""
echo "📝 系统错误日志 (最近10行):"
if [ -f "/var/log/nginx/error.log" ]; then
    echo "Nginx错误日志:"
    tail -10 /var/log/nginx/error.log 2>/dev/null || echo "无法读取Nginx错误日志"
fi

# PM2日志检查
if command -v pm2 &> /dev/null; then
    echo ""
    echo "📋 PM2应用日志 (最近10行):"
    pm2 logs healthcare-backend --lines 10 2>/dev/null || echo "无法读取PM2日志"
fi

# 权限问题诊断总结
echo ""
echo "🔍 权限问题诊断总结:"
echo "================================"

# 检查常见权限问题
PERMISSION_ISSUES=0

# 检查项目uploads目录权限
if [ -d "$BACKEND_UPLOADS" ]; then
    UPLOADS_PERM=$(stat -c "%a" "$BACKEND_UPLOADS" 2>/dev/null)
    if [ "$UPLOADS_PERM" != "755" ] && [ "$UPLOADS_PERM" != "775" ]; then
        echo "⚠️  项目uploads目录权限异常: $UPLOADS_PERM (建议: 755)"
        PERMISSION_ISSUES=$((PERMISSION_ISSUES + 1))
    fi
    
    # 检查pic目录权限
    if [ -d "$BACKEND_UPLOADS/pic" ]; then
        PIC_PERM=$(stat -c "%a" "$BACKEND_UPLOADS/pic" 2>/dev/null)
        if [ "$PIC_PERM" != "755" ] && [ "$PIC_PERM" != "775" ]; then
            echo "⚠️  pic目录权限异常: $PIC_PERM (建议: 755)"
            PERMISSION_ISSUES=$((PERMISSION_ISSUES + 1))
        fi
    fi
    
    # 检查业务目录权限
    for business_dir in "$BACKEND_UPLOADS/pic/measurement" "$BACKEND_UPLOADS/pic/covid"; do
        if [ -d "$business_dir" ]; then
            BUSINESS_PERM=$(stat -c "%a" "$business_dir" 2>/dev/null)
            if [ "$BUSINESS_PERM" != "755" ] && [ "$BUSINESS_PERM" != "775" ]; then
                echo "⚠️  $(basename $business_dir)目录权限异常: $BUSINESS_PERM (建议: 755)"
                PERMISSION_ISSUES=$((PERMISSION_ISSUES + 1))
            fi
        fi
    done
fi

if [ -d "/opt/healthcare/uploads" ]; then
    DOCKER_UPLOADS_PERM=$(stat -c "%a" /opt/healthcare/uploads 2>/dev/null)
    if [ "$DOCKER_UPLOADS_PERM" != "755" ] && [ "$DOCKER_UPLOADS_PERM" != "775" ]; then
        echo "⚠️  Docker挂载目录权限异常: $DOCKER_UPLOADS_PERM (建议: 755)"
        PERMISSION_ISSUES=$((PERMISSION_ISSUES + 1))
    fi
    
    DOCKER_UPLOADS_OWNER=$(stat -c "%U:%G" /opt/healthcare/uploads 2>/dev/null)
    if [ "$DOCKER_UPLOADS_OWNER" != "1001:1001" ]; then
        echo "⚠️  Docker挂载目录所有者异常: $DOCKER_UPLOADS_OWNER (建议: 1001:1001)"
        PERMISSION_ISSUES=$((PERMISSION_ISSUES + 1))
    fi
fi

if [ $PERMISSION_ISSUES -eq 0 ]; then
    echo "✅ 未发现明显的权限问题"
else
    echo "❌ 发现 $PERMISSION_ISSUES 个权限问题"
fi

echo ""
echo "🎯 诊断建议:"
echo "1. 如果使用Docker部署，请运行: docker logs healthcare-backend-container"
echo "2. 如果使用PM2部署，请运行: pm2 logs healthcare-backend"
echo "3. 检查Nginx配置中的client_max_body_size设置"
echo "4. 确保uploads目录权限正确 (755)"
echo "5. Docker部署时确保挂载目录所有者为1001:1001"
echo "6. 查看完整的错误日志以获取更多信息"

echo ""
echo "🔧 权限修复命令:"
echo "项目目录部署 (PM2/直接运行):"
echo "  chmod 755 $BACKEND_UPLOADS"
echo "  chmod 755 $BACKEND_UPLOADS/pic"
echo "  chmod 755 $BACKEND_UPLOADS/pic/measurement"
echo "  chmod 755 $BACKEND_UPLOADS/pic/covid"
echo "  # 如果需要，修复所有用户目录权限:"
echo "  find $BACKEND_UPLOADS -type d -exec chmod 755 {} \\;"
echo ""
echo "Docker部署:"
echo "  sudo chown -R 1001:1001 /opt/healthcare/uploads"
echo "  sudo chmod -R 755 /opt/healthcare/uploads"

echo ""
echo "✅ 诊断完成！" 