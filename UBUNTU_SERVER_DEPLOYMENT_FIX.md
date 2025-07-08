# Ubuntu服务器生产环境图片上传500错误修复指南

## 问题描述
在Ubuntu服务器生产环境中，当用户上传图片时，`POST http://43.134.141.188:6886/hcbe/api/measurements` 和 `POST http://43.134.141.188:6886/hcbe/api/covid-assessments` 接口返回500错误，但开发环境正常。

## 根本原因分析
1. **文件系统权限问题**: Ubuntu服务器上的应用进程无法创建/写入uploads目录
2. **目录不存在**: 生产环境中uploads目录结构未正确创建
3. **Nginx反向代理配置**: 可能存在文件上传大小限制
4. **PM2/Docker进程权限**: 进程运行用户权限不足

## 修复方案

### 方案1: 如果使用Docker部署

#### 1.1 检查当前容器状态
```bash
# 连接到Ubuntu服务器
ssh your_username@43.134.141.188

# 查看运行中的容器
docker ps

# 查看后端容器日志
docker logs healthcare-backend-container
```

#### 1.2 重新构建和部署
```bash
# 进入项目目录
cd /path/to/healthcare_AI/healthcare_backend

# 拉取最新代码
git pull origin main

# 重新构建镜像
docker build -t healthcare-backend:latest .

# 停止旧容器
docker stop healthcare-backend-container
docker rm healthcare-backend-container

# 启动新容器，确保挂载uploads目录
docker run -d \
  --name healthcare-backend-container \
  -p 7723:3000 \
  -v /opt/healthcare/uploads:/app/uploads \
  -e NODE_ENV=production \
  --restart unless-stopped \
  healthcare-backend:latest

# 检查容器启动状态
docker logs -f healthcare-backend-container
```

#### 1.3 验证uploads目录权限
```bash
# 创建主机上的uploads目录
sudo mkdir -p /opt/healthcare/uploads/pic/measurement
sudo mkdir -p /opt/healthcare/uploads/pic/covid

# 设置权限（假设容器内用户ID是1001）
sudo chown -R 1001:1001 /opt/healthcare/uploads
sudo chmod -R 755 /opt/healthcare/uploads

# 验证权限
ls -la /opt/healthcare/uploads/
```

### 方案2: 如果使用PM2直接部署

#### 2.1 检查当前PM2进程
```bash
# 查看PM2进程状态
pm2 list

# 查看后端应用日志
pm2 logs healthcare-backend
```

#### 2.2 更新代码和重启
```bash
# 进入项目目录
cd /path/to/healthcare_AI/healthcare_backend

# 拉取最新代码
git pull origin main

# 安装依赖
npm install

# 重新构建
npm run build

# 创建uploads目录
mkdir -p uploads/pic/measurement
mkdir -p uploads/pic/covid

# 设置权限
chmod -R 755 uploads/

# 运行检查脚本
node scripts/check-uploads.js

# 重启PM2应用
pm2 restart healthcare-backend
pm2 logs healthcare-backend --lines 50
```

### 方案3: Nginx配置优化

#### 3.1 检查Nginx配置
```bash
# 查看Nginx配置
sudo nano /etc/nginx/sites-available/healthcare

# 或者查看默认配置
sudo nano /etc/nginx/nginx.conf
```

#### 3.2 添加文件上传配置
确保Nginx配置包含以下内容：
```nginx
server {
    listen 6886;
    server_name 43.134.141.188;

    # 增加文件上传大小限制
    client_max_body_size 10M;
    client_body_timeout 60s;
    client_header_timeout 60s;

    location /hcbe/ {
        proxy_pass http://localhost:7723/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 文件上传相关配置
        proxy_request_buffering off;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        proxy_send_timeout 300s;
    }
}
```

#### 3.3 重启Nginx
```bash
# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 检查状态
sudo systemctl status nginx
```

## 详细调试步骤

### 步骤1: 检查服务器基本状态
```bash
# 检查磁盘空间
df -h

# 检查内存使用
free -h

# 检查进程状态
ps aux | grep node
ps aux | grep nginx

# 检查端口监听
netstat -tlnp | grep :7723
netstat -tlnp | grep :6886
```

### 步骤2: 实时监控日志
```bash
# 如果使用Docker
docker logs -f healthcare-backend-container

# 如果使用PM2
pm2 logs healthcare-backend --lines 100 -f

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 步骤3: 测试文件上传
```bash
# 创建测试脚本
cat > test_upload.sh << 'EOF'
#!/bin/bash

# 测试图片上传
curl -X POST \
  http://43.134.141.188:6886/hcbe/api/measurements \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@test_image.jpg" \
  -F "systolic=120" \
  -F "diastolic=80" \
  -F "measurementTime=$(date -Iseconds)" \
  -v
EOF

chmod +x test_upload.sh
```

### 步骤4: 检查应用内部状态
```bash
# 如果使用Docker，进入容器
docker exec -it healthcare-backend-container /bin/sh

# 检查uploads目录
ls -la /app/uploads/
ls -la /app/uploads/pic/

# 运行检查脚本
node scripts/check-uploads.js

# 测试目录写入权限
echo "test" > /app/uploads/test.txt
cat /app/uploads/test.txt
rm /app/uploads/test.txt
```

## 常见问题和解决方案

### 问题1: Permission denied (EACCES)
```bash
# 解决方案：修复目录权限
sudo chown -R $USER:$USER /path/to/uploads
chmod -R 755 /path/to/uploads

# 如果使用Docker
sudo chown -R 1001:1001 /opt/healthcare/uploads
```

### 问题2: No space left on device (ENOSPC)
```bash
# 检查磁盘空间
df -h

# 清理Docker无用镜像
docker system prune -a

# 清理日志文件
sudo journalctl --vacuum-time=7d
```

### 问题3: Nginx 413 Request Entity Too Large
```bash
# 修改Nginx配置
sudo nano /etc/nginx/nginx.conf

# 添加或修改
client_max_body_size 10M;

# 重启Nginx
sudo systemctl restart nginx
```

### 问题4: 端口被占用
```bash
# 查看端口占用
sudo lsof -i :7723
sudo lsof -i :6886

# 杀死占用进程
sudo kill -9 PID
```

## 快速修复脚本

创建一个一键修复脚本：

```bash
cat > fix_upload_issue.sh << 'EOF'
#!/bin/bash

echo "🔧 开始修复图片上传问题..."

# 1. 创建uploads目录
echo "📁 创建uploads目录..."
sudo mkdir -p /opt/healthcare/uploads/pic/measurement
sudo mkdir -p /opt/healthcare/uploads/pic/covid

# 2. 设置权限
echo "🔐 设置目录权限..."
sudo chown -R 1001:1001 /opt/healthcare/uploads
sudo chmod -R 755 /opt/healthcare/uploads

# 3. 重启Docker容器
echo "🔄 重启Docker容器..."
docker stop healthcare-backend-container
docker rm healthcare-backend-container

docker run -d \
  --name healthcare-backend-container \
  -p 7723:3000 \
  -v /opt/healthcare/uploads:/app/uploads \
  -e NODE_ENV=production \
  --restart unless-stopped \
  healthcare-backend:latest

# 4. 等待启动
echo "⏳ 等待容器启动..."
sleep 10

# 5. 检查状态
echo "✅ 检查容器状态..."
docker ps | grep healthcare-backend
docker logs healthcare-backend-container --tail 20

echo "🎉 修复完成！请测试图片上传功能。"
EOF

chmod +x fix_upload_issue.sh
sudo ./fix_upload_issue.sh
```

## 验证修复结果

1. **检查容器日志**：
   ```bash
   docker logs healthcare-backend-container | grep -E "\[STARTUP\]|Upload destination|Directory.*test"
   ```

2. **测试API端点**：
   ```bash
   curl -X GET http://43.134.141.188:6886/hcbe/api/health
   ```

3. **前端测试**：
   访问 `http://43.134.141.188:6886` 并尝试上传图片

如果问题仍然存在，请提供：
- 容器启动日志
- Nginx错误日志
- 具体的500错误响应内容 