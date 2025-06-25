# 🚀 医疗 AI 项目 - 快速部署指南

## 📦 一键部署（推荐）

### 方法 1: 本地部署
```bash
# 1. 克隆项目并进入后端目录
git clone <your-repo-url>
cd healthcare_AI/healthcare_backend

# 2. 一键部署（安装依赖 + 初始化数据库 + 构建项目）
npm run deploy

# 3. 启动服务
npm run start:dev
```

### 方法 2: Docker 部署
```bash
# 1. 克隆项目并进入后端目录
git clone <your-repo-url>
cd healthcare_AI/healthcare_backend

# 2. 使用 Docker Compose 启动所有服务
docker-compose up -d

# 3. 初始化数据库数据
docker exec healthcare-api npm run db:init
docker exec healthcare-api npm run db:seed
```

## 🔧 手动部署步骤

### 1. 环境准备
- Node.js 18+
- MongoDB 4.4+
- npm 或 yarn

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
MONGODB_URI=mongodb://127.0.0.1:27017/healthcare_local
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=7723
```

### 4. 数据库初始化
```bash
# 创建数据库表和索引
npm run db:init

# 生成示例数据（可选）
npm run db:seed

# 检查数据库状态
npm run db:check
```

### 5. 构建和启动
```bash
# 构建项目
npm run build

# 启动开发服务器
npm run start:dev

# 或启动生产服务器
npm run start:prod
```

## 🐳 Docker 部署详细步骤

### 1. 构建镜像
```bash
docker build -t healthcare-api .
```

### 2. 启动 MongoDB
```bash
docker run -d \
  --name healthcare-mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:5.0
```

### 3. 启动 API 服务
```bash
docker run -d \
  --name healthcare-api \
  -p 3000:3000 \
  --link healthcare-mongodb:mongodb \
  -e MONGODB_URI=mongodb://mongodb:27017/healthcare_local \
  -e JWT_SECRET=your-super-secret-jwt-key \
  healthcare-api
```

### 4. 使用 Docker Compose（推荐）
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f healthcare-api

# 停止服务
docker-compose down
```

## 📊 验证部署

### 1. 检查服务状态
```bash
# 检查 API 服务
curl http://localhost:7723/health

# 检查数据库连接
npm run db:check
```

### 2. 访问 API 文档
打开浏览器访问: http://localhost:7723/api

### 3. 测试 API 接口
```bash
npm run test:api
```

## 🔑 默认账户信息

| 角色 | 用户名 | 密码 | 描述 |
|------|--------|------|------|
| 管理员 | admin | admin123 | 系统管理员 |
| 医生 | doctor001 | doctor123 | 示例医生账户 |
| 患者 | patient001 | patient123 | 示例患者账户 |

## 🛠️ 常用命令

```bash
# 数据库管理
npm run db:init      # 初始化数据库
npm run db:reset     # 重置数据库
npm run db:seed      # 生成示例数据
npm run db:check     # 检查数据库状态
npm run db:setup     # 完整设置（初始化+示例数据）

# 服务管理
npm run start:dev    # 开发模式启动
npm run start:prod   # 生产模式启动
npm run build        # 构建项目

# 测试
npm run test:api     # 测试 API 接口
npm run test         # 运行单元测试

# 部署
npm run deploy       # 一键部署
```

## 🔄 更新部署

### 本地更新
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 更新依赖
npm install

# 3. 重新构建
npm run build

# 4. 重启服务
npm run start:prod
```

### Docker 更新
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建镜像
docker-compose build

# 3. 重启服务
docker-compose up -d
```

## 🔍 故障排除

### 常见问题

1. **端口占用**
   ```bash
   # 查看端口占用
       netstat -an | findstr :7723
   
   # 修改端口（在 .env 文件中）
       PORT=7724
   ```

2. **MongoDB 连接失败**
   ```bash
   # 检查 MongoDB 服务
   mongosh --eval "db.runCommand({ping: 1})"
   
   # 检查连接字符串
   echo $MONGODB_URI
   ```

3. **权限错误**
   ```bash
   # 检查文件权限
   ls -la
   
   # 修复权限
   chmod +x scripts/*.js
   ```

### 重新部署
```bash
# 完全重置并重新部署
npm run db:reset
npm run deploy
```

## 📞 技术支持

如遇问题请检查：
1. Node.js 版本是否 18+
2. MongoDB 服务是否正常运行
3. 网络连接是否正常
4. 环境变量是否正确配置
5. 端口是否被占用

---

🎉 **部署完成后，您的医疗 AI 系统就可以正常使用了！** 