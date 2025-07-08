#!/bin/bash

# 测试图片上传功能
echo "🧪 测试图片上传功能..."

cd /home/ubuntu/code/healthcare_AI/healthcare_backend

# 1. 检查容器状态
echo "📊 检查容器状态..."
docker-compose ps

# 2. 检查容器内权限
echo "🔍 检查容器内权限..."
echo "容器内 /app/uploads/ 目录权限:"
docker exec healthcare-api ls -la /app/uploads/

echo "容器内 /app/uploads/pic/ 目录权限:"
docker exec healthcare-api ls -la /app/uploads/pic/

echo "容器内 /app/uploads/pic/measurement/ 目录权限:"
docker exec healthcare-api ls -la /app/uploads/pic/measurement/

# 3. 测试目录创建权限
echo "🧪 测试目录创建权限..."
TEST_USER="test_user_$(date +%s)"
echo "尝试创建目录: /app/uploads/pic/measurement/${TEST_USER}"
docker exec healthcare-api mkdir -p "/app/uploads/pic/measurement/${TEST_USER}"

if [ $? -eq 0 ]; then
    echo "✅ 目录创建成功"
    
    # 测试文件创建
    echo "尝试创建文件: /app/uploads/pic/measurement/${TEST_USER}/test.txt"
    docker exec healthcare-api touch "/app/uploads/pic/measurement/${TEST_USER}/test.txt"
    
    if [ $? -eq 0 ]; then
        echo "✅ 文件创建成功"
        docker exec healthcare-api ls -la "/app/uploads/pic/measurement/${TEST_USER}/"
        
        # 测试文件写入
        echo "尝试写入文件内容..."
        docker exec healthcare-api sh -c "echo 'test content' > /app/uploads/pic/measurement/${TEST_USER}/test.txt"
        
        if [ $? -eq 0 ]; then
            echo "✅ 文件写入成功"
            docker exec healthcare-api cat "/app/uploads/pic/measurement/${TEST_USER}/test.txt"
        else
            echo "❌ 文件写入失败"
        fi
        
        # 清理测试文件
        docker exec healthcare-api rm -rf "/app/uploads/pic/measurement/${TEST_USER}"
    else
        echo "❌ 文件创建失败"
    fi
else
    echo "❌ 目录创建失败"
fi

# 4. 检查服务器上的对应目录
echo "📂 检查服务器上的对应目录..."
ls -la /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/pic/measurement/

# 5. 测试API健康状态
echo "🏥 测试API健康状态..."
curl -f http://localhost:7723/api/health

# 6. 查看最近的后端日志
echo "📋 查看最近的后端日志..."
docker-compose logs healthcare-api --tail=30

# 7. 检查容器内的用户和权限
echo "👤 检查容器内的用户和权限..."
docker exec healthcare-api whoami
docker exec healthcare-api id
docker exec healthcare-api ls -la /app/

echo "✅ 测试完成！"
echo "🌐 请访问 http://43.134.141.188:6886/ 测试前端图片上传功能" 