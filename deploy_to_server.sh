#!/bin/bash

echo "🏥 醫療AI系統 - Ubuntu服務器部署腳本"
echo "========================================"

# 更新系統
echo "📦 更新系統包..."
sudo apt update && sudo apt upgrade -y

# 安裝必要軟件
echo "🔧 安裝必要軟件..."
sudo apt install -y nginx curl git

# 安裝Docker
echo "🐳 安裝Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt install -y docker-compose

# 安裝Node.js
echo "📦 安裝Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 克隆項目
echo "📂 克隆項目..."
sudo rm -rf /home/ubuntu/code/healthcare_AI
sudo git clone <your-repo-url> /home/ubuntu/code/healthcare_AI
sudo chown -R $USER:$USER /home/ubuntu/code/healthcare_AI

# 構建前端
echo "🌐 構建前端..."
cd /home/ubuntu/code/healthcare_AI/healthcare_frontend
npm install
npm run build

# 配置Nginx
echo "⚙️ 配置Nginx..."
sudo tee /etc/nginx/sites-available/healthcare > /dev/null <<'EOF'
server {
    listen 6886;
    server_name 43.134.141.188;
    
    client_max_body_size 100M;
    
    location / {
        root /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    location /hcbe/ {
        rewrite ^/hcbe/(.*)$ /$1 break;
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
    }
    
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
    
    location /health {
        proxy_pass http://127.0.0.1:7723/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location /uploads/ {
        proxy_pass http://127.0.0.1:7723/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist;
    }
}
EOF

# 啟用Nginx站點
sudo ln -sf /etc/nginx/sites-available/healthcare /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 啟動Docker服務
echo "🚀 啟動Docker服務..."
cd /home/ubuntu/code/healthcare_AI/healthcare_backend
docker-compose down
docker-compose up -d

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 30

# 初始化數據庫
echo "🗄️ 初始化數據庫..."
docker exec healthcare-api npm run db:setup

# 配置防火牆
echo "🔒 配置防火牆..."
sudo ufw allow 6886
sudo ufw --force enable

# 設置自啟動
echo "🔄 設置自啟動..."
sudo systemctl enable docker
sudo systemctl enable nginx

# 創建系統服務
sudo tee /etc/systemd/system/healthcare-ai.service > /dev/null <<EOF
[Unit]
Description=Healthcare AI System
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/code/healthcare_AI/healthcare_backend
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable healthcare-ai.service
sudo systemctl start healthcare-ai.service

echo ""
echo "🎉 部署完成！"
echo "📋 訪問地址："
echo "   前端: http://43.134.141.188:6886/"
echo "   API: http://43.134.141.188:6886/hcbe/"
echo "   數據庫管理: http://43.134.141.188:6886/db/"
echo ""
echo "🔑 默認賬戶："
echo "   管理員: admin / admin123"
echo "   醫生: doctor001 / doctor123"
echo "   患者: patient001 / patient123"
echo ""
echo "🔧 管理命令："
echo "   查看服務狀態: docker-compose ps"
echo "   查看日誌: docker-compose logs -f"
echo "   重啟服務: sudo systemctl restart healthcare-ai" 
