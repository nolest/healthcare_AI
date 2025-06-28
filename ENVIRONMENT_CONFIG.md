# 环境配置说明

## 概述

本项目支持多环境配置，包括开发环境、测试环境和生产环境。通过统一的配置管理，确保图片路径和API地址在不同环境下正确工作。

## 后端配置

### 配置文件位置
- `healthcare_backend/src/config/app.config.ts`

### 环境检测
系统通过 `NODE_ENV` 环境变量确定当前环境：
- `development`：开发环境（默认）
- `testing` 或 `test`：测试环境
- `production`：生产环境

### 配置项说明

#### 开发环境 (development)
```typescript
{
  port: 7723,
  apiUrl: 'http://localhost:7723',
  frontendUrl: 'http://localhost:6886',
  staticUrl: 'http://localhost:7723',
  environment: 'development'
}
```

#### 测试环境 (testing)
```typescript
{
  port: 7724,
  apiUrl: 'http://localhost:7724',
  frontendUrl: 'http://localhost:6887',
  staticUrl: 'http://localhost:7724',
  environment: 'testing'
}
```

#### 生产环境 (production)
```typescript
{
  port: process.env.PORT || 7723,
  apiUrl: process.env.API_URL || 'https://your-api-domain.com',
  frontendUrl: process.env.FRONTEND_URL || 'https://your-frontend-domain.com',
  staticUrl: process.env.STATIC_URL || 'https://your-api-domain.com',
  environment: 'production'
}
```

### 环境变量（生产环境）
在生产环境中，可以通过以下环境变量覆盖默认配置：
- `PORT`：服务器端口
- `API_URL`：API服务地址
- `FRONTEND_URL`：前端应用地址
- `STATIC_URL`：静态资源服务地址

## 前端配置

### 配置文件位置
- `healthcare_frontend/src/config/app.config.js`

### 环境检测
系统通过 Vite 环境变量确定当前环境：
- `import.meta.env.PROD`：生产环境
- `import.meta.env.MODE === 'test'`：测试环境
- 其他：开发环境（默认）

### 配置项说明

#### 开发环境
```javascript
{
  apiUrl: 'http://localhost:7723/api',
  staticUrl: 'http://localhost:7723',
  environment: 'development'
}
```

#### 测试环境
```javascript
{
  apiUrl: 'http://localhost:7724/api',
  staticUrl: 'http://localhost:7724',
  environment: 'testing'
}
```

#### 生产环境
```javascript
{
  apiUrl: import.meta.env.VITE_API_URL || 'https://your-api-domain.com/api',
  staticUrl: import.meta.env.VITE_STATIC_URL || 'https://your-api-domain.com',
  environment: 'production'
}
```

### 环境变量（生产环境）
在生产环境中，可以通过以下环境变量覆盖默认配置：
- `VITE_API_URL`：API服务地址
- `VITE_STATIC_URL`：静态资源服务地址

## 图片URL处理

### 后端图片URL服务
`healthcare_backend/src/services/image-url.service.ts` 提供以下功能：

1. **getFullImageUrl(relativePath)**：将相对路径转换为完整URL
2. **getImageUrl(userId, filename)**：根据用户ID和文件名生成完整URL
3. **getFullImageUrls(imagePaths)**：批量处理图片路径数组

### 前端图片URL工具
`healthcare_frontend/src/config/app.config.js` 提供以下工具函数：

1. **getImageUrl(userId, filename)**：根据用户ID和文件名生成完整URL
2. **getFullImageUrl(relativePath)**：将相对路径转换为完整URL

### 使用示例

#### 后端使用
```typescript
import { ImageUrlService } from '../services/image-url.service';

// 注入服务
constructor(private imageUrlService: ImageUrlService) {}

// 使用
const fullUrl = this.imageUrlService.getFullImageUrl('/uploads/pic/userId/filename.png');
// 结果：http://localhost:7723/uploads/pic/userId/filename.png
```

#### 前端使用
```javascript
import { getImageUrl, getFullImageUrl } from '../config/app.config.js';

// 使用
const fullUrl = getImageUrl('userId', 'filename.png');
// 结果：http://localhost:7723/uploads/pic/userId/filename.png

const fullUrl2 = getFullImageUrl('/uploads/pic/userId/filename.png');
// 结果：http://localhost:7723/uploads/pic/userId/filename.png
```

## 部署配置

### 开发环境启动
```bash
# 后端
cd healthcare_backend
npm run start:dev

# 前端
cd healthcare_frontend
npm run dev
```

### 测试环境启动
```bash
# 后端
cd healthcare_backend
NODE_ENV=testing npm run start:dev

# 前端
cd healthcare_frontend
npm run build:test
npm run preview
```

### 生产环境部署
```bash
# 设置环境变量
export NODE_ENV=production
export API_URL=https://your-api-domain.com
export FRONTEND_URL=https://your-frontend-domain.com
export STATIC_URL=https://your-api-domain.com
export PORT=7723

# 后端
cd healthcare_backend
npm run build
npm run start:prod

# 前端
export VITE_API_URL=https://your-api-domain.com/api
export VITE_STATIC_URL=https://your-api-domain.com
cd healthcare_frontend
npm run build
```

## 配置验证

### 后端配置验证
启动后端服务时，控制台会显示当前配置：
```
🚀 应用启动成功！
🌍 环境: development
📱 API地址: http://localhost:7723/api
📚 API文档: http://localhost:7723/api-docs
📷 图片访问: http://localhost:7723/uploads/
🖥️  前端地址: http://localhost:6886
```

### 前端配置验证
可以在浏览器控制台中检查配置：
```javascript
import { appConfig } from './src/config/app.config.js';
console.log('当前配置:', appConfig);
```

## 注意事项

1. **图片路径兼容性**：系统同时支持新的 `imageUrls` 字段和旧的 `imagePaths` 字段
2. **环境变量优先级**：环境变量会覆盖默认配置
3. **CORS配置**：确保后端CORS配置与前端地址匹配
4. **静态文件服务**：确保静态文件服务路径正确配置
5. **HTTPS支持**：生产环境建议使用HTTPS

## 故障排除

### 图片无法显示
1. 检查静态文件服务是否正常：访问 `${staticUrl}/uploads/pic/userId/filename.png`
2. 检查CORS配置是否正确
3. 检查图片文件是否存在
4. 检查路径格式是否正确

### API请求失败
1. 检查API地址配置是否正确
2. 检查网络连接
3. 检查服务器是否正常运行
4. 检查认证token是否有效 