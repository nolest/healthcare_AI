# 🏥 医疗 AI 项目 - 数据库设置指南

## 📋 数据库表结构

本项目使用 MongoDB 数据库，包含以下 7 个主要集合（表）：

### 核心表（必需）
1. **users** - 用户管理（患者和医护人员）
2. **measurements** - 健康测量数据
3. **diagnoses** - 诊断记录
4. **covidassessments** - COVID 评估记录

### 扩展表（可选）
5. **medical_records** - 完整医疗记录
6. **prescriptions** - 处方管理
7. **appointments** - 预约管理

## 🚀 快速部署

### 1. 环境要求
- Node.js 18+
- MongoDB 4.4+
- npm 或 yarn

### 2. 安装依赖
```bash
cd healthcare_backend
npm install
```

### 3. 配置数据库连接
创建 `.env` 文件：
```env
MONGODB_URI=mongodb://127.0.0.1:27017/healthcare_local
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=7723
```

### 4. 初始化数据库
```bash
# 创建数据库表和索引，添加默认用户
npm run db:init

# 生成示例数据（可选）
npm run db:seed

# 或者一键完成初始化和示例数据
npm run db:setup
```

### 5. 启动服务
```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

## 🔧 数据库管理脚本

### 可用命令

```bash
# 初始化数据库（创建表、索引、默认用户）
npm run db:init

# 重置数据库（删除所有数据）
npm run db:reset

# 生成示例数据
npm run db:seed

# 完整设置（初始化 + 示例数据）
npm run db:setup

# 测试 API 接口
npm run test:api
```

### 默认账户

初始化后会创建以下测试账户：

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | admin | admin123 | 系统管理员 |
| 医生 | doctor001 | doctor123 | 示例医生 |
| 患者 | patient001 | patient123 | 示例患者 |

## 📊 数据库索引

为了优化查询性能，系统会自动创建以下索引：

### users 表
- `username` (唯一索引)
- `email` (唯一索引)
- `role` (普通索引)

### measurements 表
- `userId` (普通索引)
- `createdAt` (降序索引)
- `status` (普通索引)
- `isAbnormal` (普通索引)

### diagnoses 表
- `patientId` (普通索引)
- `doctorId` (普通索引)
- `measurementId` (普通索引)
- `createdAt` (降序索引)
- `status` (普通索引)

### covidassessments 表
- `userId` (普通索引)
- `riskLevel` (普通索引)
- `createdAt` (降序索引)

## 🔄 在新机器上部署

### 方法 1：完整部署
```bash
# 1. 克隆项目
git clone <your-repo-url>
cd healthcare_AI/healthcare_backend

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件设置数据库连接

# 4. 初始化数据库
npm run db:setup

# 5. 启动服务
npm run start:prod
```

### 方法 2：Docker 部署（推荐）
```bash
# 构建镜像
docker build -t healthcare-api .

# 运行容器
docker run -d \
  --name healthcare-api \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://your-mongo-host:27017/healthcare_local \
  healthcare-api
```

## 🔍 API 文档

启动服务后，可以访问：
- **Swagger API 文档**: http://localhost:7723/api
- **健康检查**: http://localhost:7723/health

## 🛠️ 故障排除

### 常见问题

1. **MongoDB 连接失败**
   ```bash
   # 检查 MongoDB 是否运行
   mongosh --eval "db.runCommand({ping: 1})"
   
   # 检查端口是否监听
   netstat -an | grep 27017
   ```

2. **权限错误**
   ```bash
   # 确保有 MongoDB 写入权限
   # 检查数据库用户权限
   ```

3. **端口冲突**
   ```bash
   # 修改 .env 文件中的 PORT 设置
   PORT=3001
   ```

### 重新初始化

如果需要重新开始：
```bash
# 1. 重置数据库
npm run db:reset

# 2. 重新初始化
npm run db:setup

# 3. 重启服务
npm run start:dev
```

## 📈 性能优化

### 生产环境建议

1. **数据库连接池**
   ```javascript
   // 在 database.config.ts 中配置
   export const databaseConfig = {
     uri: process.env.MONGODB_URI,
     options: {
       maxPoolSize: 10,
       serverSelectionTimeoutMS: 5000,
       socketTimeoutMS: 45000,
     }
   };
   ```

2. **启用压缩**
   ```javascript
   // 在 main.ts 中添加
   app.use(compression());
   ```

3. **设置请求限制**
   ```javascript
   // 添加速率限制
   app.use(rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   }));
   ```

## 🔐 安全建议

1. **更改默认密码**
2. **设置强 JWT 密钥**
3. **启用 HTTPS**
4. **配置防火墙规则**
5. **定期备份数据库**

## 📞 支持

如有问题，请检查：
1. MongoDB 服务是否正常运行
2. 网络连接是否正常
3. 环境变量是否正确配置
4. 依赖是否完整安装 