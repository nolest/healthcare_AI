# 远程医疗系统 API 使用指南

## 🚀 快速开始

### 环境要求
- Node.js 16+
- MongoDB 4.4+
- npm 或 pnpm

### 安装和启动

1. **安装依赖**
```bash
# 后端依赖
cd healthcare_backend
npm install

# 前端依赖  
cd ../healthcare_frontend
npm install
```

2. **启动MongoDB数据库**
```bash
# 确保MongoDB服务正在运行
mongod
```

3. **启动开发环境**
```bash
# 方式1: 使用批处理文件（Windows）
start_dev.bat

# 方式2: 手动启动
# 终端1 - 后端
cd healthcare_backend
npm run start:dev

# 终端2 - 前端  
cd healthcare_frontend
npm run dev
```

### 访问地址
- **前端应用**: http://localhost:6886
- **后端API**: http://localhost:7723/api
- **API文档**: http://localhost:7723/api-docs

## 📋 主要功能

### ✅ 已完成功能

#### 用户认证
- ✅ 用户注册（患者/医护人员）
- ✅ 用户登录/登出
- ✅ JWT Token认证
- ✅ 角色权限控制

#### 测量数据管理
- ✅ 提交生理指标（血压、心率、体温、血氧）
- ✅ 自动异常值检测
- ✅ 测量历史查询
- ✅ 异常数据标记和状态管理

#### 医护人员功能
- ✅ 查看异常患者列表
- ✅ 患者测量数据查看
- ✅ 批量处理患者记录

### 🔄 正在开发
- 诊断记录管理
- COVID评估功能
- 用户管理界面
- 数据统计图表

## 🔧 API 接口说明

### 认证接口

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "patient001",
  "password": "123456",
  "fullName": "张三",
  "email": "patient001@example.com",
  "role": "patient",
  "phone": "13800138000",
  "birthDate": "1990-01-01",
  "gender": "male"
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "patient001", 
  "password": "123456"
}
```

#### 获取用户信息
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### 测量数据接口

#### 提交测量数据
```http
POST /api/measurements
Authorization: Bearer <token>
Content-Type: application/json

{
  "systolic": 120,
  "diastolic": 80,
  "heartRate": 72,
  "temperature": 36.5,
  "oxygenSaturation": 98,
  "notes": "感觉良好",
  "measurementTime": "2024-06-24T10:00:00Z"
}
```

#### 获取我的测量记录
```http
GET /api/measurements/my
Authorization: Bearer <token>
```

#### 获取异常测量记录（医护人员）
```http
GET /api/measurements/abnormal
Authorization: Bearer <token>
```

#### 更新测量记录状态（医护人员）
```http
PATCH /api/measurements/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "processed",
  "isAbnormal": true
}
```

## 🎯 测试账户

系统启动后，您可以注册新账户或使用以下测试流程：

### 测试流程
1. **注册患者账户**
   - 角色选择"患者"
   - 填写基本信息

2. **注册医护人员账户**  
   - 角色选择"医护人员"
   - 填写科室和执照信息

3. **患者操作**
   - 登录患者账户
   - 提交测量数据（可以故意输入异常值测试）
   - 查看测量历史

4. **医护人员操作**
   - 登录医护人员账户
   - 查看异常患者列表
   - 处理异常测量记录

## 🔍 异常值标准

系统会自动检测以下异常值：
- **收缩压**: >140 或 <90 mmHg
- **舒张压**: >90 或 <60 mmHg  
- **心率**: >100 或 <60 次/分
- **体温**: >37.5°C 或 <36.0°C
- **血氧饱和度**: <95%

## 🐛 故障排除

### 常见问题

1. **后端启动失败**
   - 检查MongoDB是否运行
   - 检查端口7723（后端）和6886（前端）是否被占用
   - 查看终端错误信息

2. **前端无法连接后端**
   - 确认后端已启动
   - 检查API地址配置
   - 查看浏览器控制台错误

3. **数据库连接失败**
   - 确认MongoDB服务状态
   - 检查数据库连接字符串
   - 查看后端日志

### 日志查看
- **后端日志**: 在后端终端查看
- **前端日志**: 浏览器开发者工具 > Console
- **网络请求**: 浏览器开发者工具 > Network

## 📞 技术支持

如果遇到问题，请检查：
1. 所有依赖是否正确安装
2. MongoDB是否正常运行
3. 端口是否被占用
4. 浏览器控制台是否有错误信息

## 🔄 下一步开发计划

1. **完善诊断模块**
2. **添加数据可视化**
3. **实现消息通知**
4. **添加导出功能**
5. **优化移动端体验** 