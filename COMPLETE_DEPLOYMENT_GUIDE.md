# 🏥 医疗AI系统 - Ubuntu完整部署指南

## 📋 目录
1. [系统要求](#系统要求)
2. [环境准备](#环境准备)
3. [项目下载](#项目下载)
4. [后端部署](#后端部署)
5. [前端部署](#前端部署)
6. [Nginx配置](#nginx配置)
7. [服务启动](#服务启动)
8. [域名和SSL配置](#域名和ssl配置)
9. [监控和维护](#监控和维护)
10. [故障排除](#故障排除)

---

## 🖥️ 系统要求

### 最低配置
- **操作系统**: Ubuntu 20.04 LTS 或更高版本
- **CPU**: 2核心
- **内存**: 4GB RAM
- **存储**: 20GB 可用空间
- **网络**: 公网IP地址

### 推荐配置
- **操作系统**: Ubuntu 22.04 LTS
- **CPU**: 4核心
- **内存**: 8GB RAM
- **存储**: 50GB SSD
- **网络**: 稳定的公网IP

---

## 🔧 环境准备

### 1. 更新系统
```bash
# 更新软件包列表
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git vim htop unzip
```

### 2. 安装Node.js (v18+)
```bash
# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version  # 应该显示 v18.x.x
npm --version   # 应该显示 9.x.x
```

### 3. 安装Docker和Docker Compose
```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 将当前用户添加到docker组
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version

# 重新登录使组权限生效
newgrp docker
```

### 4. 安装Nginx
```bash
# 安装Nginx
sudo apt install -y nginx

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证安装
sudo systemctl status nginx
```

---

## 📥 项目下载

### 1. 创建项目目录
```bash
# 创建项目根目录
sudo mkdir -p /home/ubuntu/code
cd /home/ubuntu/code

# 设置权限
sudo chown -R ubuntu:ubuntu /home/ubuntu/code
```

### 2. 下载项目代码
```bash
# 克隆项目（如果有Git仓库）
git clone <your-repository-url> healthcare_AI

# 或者上传项目文件
# 使用scp、rsync或其他方式上传项目文件到 /home/ubuntu/code/healthcare_AI/

cd healthcare_AI
```

---

## 🔙 后端部署

### 1. 进入后端目录
```bash
cd /home/ubuntu/code/healthcare_AI/healthcare_backend
```

### 2. 安装依赖
```bash
# 安装Node.js依赖
npm install

# 如果使用pnpm
npm install -g pnpm
pnpm install
```

### 3. 配置环境变量
```bash
# 创建环境配置文件
cat > .env << 'EOF'
NODE_ENV=production
PORT=7723
MONGODB_URI=mongodb://localhost:8899/healthcare
JWT_SECRET=your-super-secret-jwt-key-here
UPLOAD_PATH=./uploads
EOF
```

### 4. 配置Docker Compose
```bash
# 确保docker-compose.yml配置正确
cat docker-compose.yml

# 示例配置：
```

```yaml
version: '3.8'

services:
  healthcare-api:
    build: .
    container_name: healthcare-api
    ports:
      - "7723:7723"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/healthcare
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - mongodb
    networks:
      - healthcare-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7723/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mongodb:
    image: mongo:5.0
    container_name: healthcare-mongodb
    ports:
      - "8899:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - healthcare-network
    restart: unless-stopped

  mongo-express:
    image: mongo-express
    container_name: healthcare-mongo-express
    ports:
      - "8081:8081"
    environment:
      - ME_CONFIG_MONGODB_SERVER=mongodb
      - ME_CONFIG_MONGODB_PORT=27017
      - ME_CONFIG_BASICAUTH_USERNAME=admin
      - ME_CONFIG_BASICAUTH_PASSWORD=admin123
    depends_on:
      - mongodb
    networks:
      - healthcare-network
    restart: unless-stopped

volumes:
  mongodb_data:

networks:
  healthcare-network:
    driver: bridge
```

### 5. 创建上传目录
```bash
# 创建上传目录结构
mkdir -p uploads/pic
mkdir -p uploads/covid
mkdir -p uploads/measurement

# 设置权限
sudo chown -R 1000:1000 uploads/
sudo chmod -R 777 uploads/
```

### 6. 构建和启动后端服务
```bash
# 构建Docker镜像
docker-compose build

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs healthcare-api
```

---

## 🎨 前端部署

### 1. 进入前端目录
```bash
cd /home/ubuntu/code/healthcare_AI/healthcare_frontend
```

### 2. 安装依赖
```bash
# 安装前端依赖
npm install

# 如果遇到权限问题
sudo chown -R ubuntu:ubuntu node_modules/
```

### 3. 配置环境变量
```bash
# 创建生产环境配置
cat > .env << 'EOF'
NODE_ENV=production
VITE_API_URL=http://43.134.141.188:6886/hcbe
VITE_STATIC_URL=http://43.134.141.188:6886
EOF

# 注意：将 43.134.141.188 替换为你的实际服务器IP
```

### 4. 构建前端
```bash
# 构建生产版本
npm run build

# 检查构建结果
ls -la dist/
```

### 5. 设置文件权限
```bash
# 设置Nginx访问权限
sudo chown -R www-data:www-data dist/
sudo chmod -R 755 dist/
```

---

## 🌐 Nginx配置

### 1. 创建Nginx配置文件
```bash
# 创建站点配置
sudo tee /etc/nginx/sites-available/healthcare > /dev/null << 'EOF'
server {
    listen 6886;
    server_name 43.134.141.188 localhost;
    
    # 前端静态文件
    location / {
        root /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
    }

    # 上传文件静态访问
    location /hcbe/uploads/ {
        alias /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/;
        
        # 允许跨域访问
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
        
        # 缓存设置
        expires 1d;
        add_header Cache-Control "public";
        
        # 安全设置
        location ~* \.(php|php5|sh|pl|py)$ {
            deny all;
        }
        
        # 文件类型限制
        location ~* \.(jpg|jpeg|png|gif|bmp|ico|svg|tif|tiff|webp)$ {
            access_log off;
        }
    }

    # 后端API代理
    location /hcbe/ {
        # 排除uploads路径，避免冲突
        location ~ ^/hcbe/uploads/ {
            # 这个会被上面的location处理
        }
        
        # 其他API请求
        rewrite ^/hcbe/(.*)$ /api/$1 break;
        proxy_pass http://127.0.0.1:7723;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 上传文件大小限制
        client_max_body_size 50M;
    }

    # 数据库管理界面代理
    location /db/ {
        rewrite ^/db/(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# 注意：将 43.134.141.188 替换为你的实际服务器IP
```

### 2. 启用站点配置
```bash
# 创建软链接启用站点
sudo ln -sf /etc/nginx/sites-available/healthcare /etc/nginx/sites-enabled/

# 删除默认站点（可选）
sudo rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
sudo nginx -t

# 重新加载Nginx
sudo systemctl reload nginx
```

---

## 🚀 服务启动

### 1. 启动所有服务
```bash
# 启动后端服务
cd /home/ubuntu/code/healthcare_AI/healthcare_backend
docker-compose up -d

# 重启Nginx
sudo systemctl restart nginx

# 设置服务开机自启
sudo systemctl enable nginx
sudo systemctl enable docker
```

### 2. 验证服务状态
```bash
# 检查Docker容器
docker-compose ps

# 检查Nginx状态
sudo systemctl status nginx

# 检查端口监听
sudo netstat -tlnp | grep -E ':(6886|7723|8081|8899)'
```

### 3. 测试访问
```bash
# 测试前端页面
curl -I http://43.134.141.188:6886/

# 测试API接口
curl -I http://43.134.141.188:6886/hcbe/api-docs

# 测试健康检查
curl http://43.134.141.188:6886/hcbe/health

# 注意：将 43.134.141.188 替换为你的实际服务器IP
```

---

## 🔒 云服务器安全组配置

### 需要开放的端口
- **6886**: 前端访问端口
- **22**: SSH访问端口（默认开放）
- **80**: HTTP（可选，用于重定向到HTTPS）
- **443**: HTTPS（如果配置SSL）

### 配置步骤（以阿里云为例）
1. 登录阿里云控制台
2. 进入ECS实例管理
3. 找到你的服务器实例
4. 点击"管理" → "本实例安全组"
5. 添加安全组规则：
   - 规则方向：入方向
   - 协议类型：TCP
   - 端口范围：6886/6886
   - 授权对象：0.0.0.0/0
   - 描述：医疗AI系统访问端口

---

## 🌍 域名和SSL配置（可选）

### 1. 域名配置
```bash
# 如果有域名，修改Nginx配置
sudo sed -i 's/43.134.141.188/yourdomain.com/g' /etc/nginx/sites-available/healthcare
sudo systemctl reload nginx
```

### 2. SSL证书配置
```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 申请SSL证书
sudo certbot --nginx -d yourdomain.com

# 设置自动续期
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 监控和维护

### 1. 创建监控脚本
```bash
# 创建服务监控脚本
cat > /home/ubuntu/monitor_services.sh << 'EOF'
#!/bin/bash

echo "=== 医疗AI系统服务状态监控 ==="
echo "时间: $(date)"
echo ""

echo "1. Docker容器状态:"
cd /home/ubuntu/code/healthcare_AI/healthcare_backend
docker-compose ps

echo ""
echo "2. Nginx状态:"
sudo systemctl status nginx --no-pager -l

echo ""
echo "3. 磁盘使用情况:"
df -h

echo ""
echo "4. 内存使用情况:"
free -h

echo ""
echo "5. 服务访问测试:"
curl -s -o /dev/null -w "前端页面: %{http_code}\n" http://localhost:6886/
curl -s -o /dev/null -w "API接口: %{http_code}\n" http://localhost:6886/hcbe/health

echo ""
echo "=== 监控完成 ==="
EOF

chmod +x /home/ubuntu/monitor_services.sh
```

### 2. 设置定时备份
```bash
# 创建备份脚本
cat > /home/ubuntu/backup_data.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "开始备份 - $DATE"

# 备份数据库
docker exec healthcare-mongodb mongodump --out /data/backup/$DATE
docker cp healthcare-mongodb:/data/backup/$DATE $BACKUP_DIR/mongodb_$DATE

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /home/ubuntu/code/healthcare_AI/healthcare_backend uploads/

# 清理7天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "mongodb_*" -mtime +7 -exec rm -rf {} \;

echo "备份完成 - $DATE"
EOF

chmod +x /home/ubuntu/backup_data.sh

# 设置定时备份（每天凌晨2点）
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup_data.sh >> /var/log/backup.log 2>&1") | crontab -
```

### 3. 日志管理
```bash
# 创建日志清理脚本
cat > /home/ubuntu/cleanup_logs.sh << 'EOF'
#!/bin/bash

# 清理Docker日志
docker system prune -f
docker-compose logs --tail=1000 healthcare-api > /tmp/api_recent.log

# 清理Nginx日志（保留最近30天）
sudo find /var/log/nginx -name "*.log" -mtime +30 -delete

# 清理系统日志
sudo journalctl --vacuum-time=30d

echo "日志清理完成 - $(date)"
EOF

chmod +x /home/ubuntu/cleanup_logs.sh

# 设置定时清理（每周日凌晨3点）
(crontab -l 2>/dev/null; echo "0 3 * * 0 /home/ubuntu/cleanup_logs.sh >> /var/log/cleanup.log 2>&1") | crontab -
```

---

## 🔧 故障排除

### 常见问题和解决方案

#### 1. 服务无法启动
```bash
# 检查Docker服务
sudo systemctl status docker
sudo systemctl start docker

# 检查端口占用
sudo netstat -tlnp | grep :7723
sudo lsof -i :7723

# 重启所有服务
cd /home/ubuntu/code/healthcare_AI/healthcare_backend
docker-compose down
docker-compose up -d
```

#### 2. 前端页面无法访问
```bash
# 检查Nginx配置
sudo nginx -t
sudo systemctl status nginx

# 检查前端文件
ls -la /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist/

# 重新构建前端
cd /home/ubuntu/code/healthcare_AI/healthcare_frontend
npm run build
sudo chown -R www-data:www-data dist/
```

#### 3. 图片上传失败
```bash
# 检查上传目录权限
ls -la /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/

# 修复权限
sudo chmod -R 777 /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/
sudo chown -R 1000:1000 /home/ubuntu/code/healthcare_AI/healthcare_backend/uploads/
```

#### 4. 数据库连接失败
```bash
# 检查MongoDB容器
docker-compose logs mongodb

# 重启数据库
docker-compose restart mongodb

# 检查数据库连接
docker exec -it healthcare-mongodb mongo --eval "db.stats()"
```

### 快速诊断脚本
```bash
# 创建快速诊断脚本
cat > /home/ubuntu/quick_diagnosis.sh << 'EOF'
#!/bin/bash

echo "🔍 医疗AI系统快速诊断"
echo "===================="

echo "1. 检查关键服务状态..."
systemctl is-active nginx docker

echo ""
echo "2. 检查Docker容器..."
cd /home/ubuntu/code/healthcare_AI/healthcare_backend
docker-compose ps

echo ""
echo "3. 检查端口监听..."
ss -tlnp | grep -E ':(6886|7723|8081|8899)'

echo ""
echo "4. 检查磁盘空间..."
df -h / | tail -1

echo ""
echo "5. 测试服务访问..."
curl -s -o /dev/null -w "前端(6886): %{http_code} " http://localhost:6886/ && echo "✅" || echo "❌"
curl -s -o /dev/null -w "API(7723): %{http_code} " http://localhost:7723/api/health && echo "✅" || echo "❌"
curl -s -o /dev/null -w "MongoDB(8081): %{http_code} " http://localhost:8081/ && echo "✅" || echo "❌"

echo ""
echo "6. 检查最近错误日志..."
docker-compose logs --tail=5 healthcare-api | grep -i error || echo "无错误日志"

echo ""
echo "诊断完成！"
EOF

chmod +x /home/ubuntu/quick_diagnosis.sh
```

---

## 🎉 部署完成检查清单

### ✅ 系统层面
- [ ] Ubuntu系统已更新
- [ ] Node.js 18+ 已安装
- [ ] Docker 和 Docker Compose 已安装
- [ ] Nginx 已安装并运行

### ✅ 后端服务
- [ ] 后端依赖已安装
- [ ] Docker容器正常运行
- [ ] MongoDB数据库可访问
- [ ] API接口响应正常
- [ ] 上传目录权限正确

### ✅ 前端服务
- [ ] 前端已构建完成
- [ ] 静态文件权限正确
- [ ] 环境变量配置正确

### ✅ Nginx配置
- [ ] 站点配置已创建
- [ ] 配置语法检查通过
- [ ] 服务已重新加载
- [ ] 静态文件访问正常

### ✅ 网络访问
- [ ] 云服务器安全组已配置
- [ ] 前端页面可访问
- [ ] API接口可访问
- [ ] 图片上传和显示正常

### ✅ 监控维护
- [ ] 监控脚本已创建
- [ ] 备份脚本已设置
- [ ] 日志清理已配置
- [ ] 定时任务已设置

---

## 📞 技术支持

如果在部署过程中遇到问题，可以：

1. **运行诊断脚本**: `./quick_diagnosis.sh`
2. **查看详细日志**: `docker-compose logs healthcare-api`
3. **检查Nginx日志**: `sudo tail -f /var/log/nginx/error.log`
4. **查看系统日志**: `sudo journalctl -u nginx -f`

---

## 🔄 更新部署

### 更新代码
```bash
# 1. 备份当前版本
cd /home/ubuntu/code/healthcare_AI
tar -czf ../healthcare_backup_$(date +%Y%m%d).tar.gz .

# 2. 更新代码（Git方式）
git pull origin main

# 3. 更新后端
cd healthcare_backend
npm install
docker-compose build
docker-compose up -d

# 4. 更新前端
cd ../healthcare_frontend
npm install
npm run build
sudo chown -R www-data:www-data dist/

# 5. 重启服务
sudo systemctl reload nginx
```

---

**🎉 恭喜！你的医疗AI系统已经成功部署在Ubuntu服务器上！**

访问地址: `http://你的服务器IP:6886/` 