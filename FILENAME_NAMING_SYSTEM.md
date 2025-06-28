# 文件命名系统说明

## 概述

为了统一管理和识别上传的医疗图片文件，本系统采用了新的文件命名规范：`aihs_时间戳_随机数.扩展名`

## 命名规则

### 格式
```
aihs_[时间戳]_[随机数].[扩展名]
```

### 组成部分
1. **前缀 (aihs_)**: 
   - 代表 "AI Health System"
   - 用于标识系统生成的文件
   - 便于区分新旧文件格式

2. **时间戳**: 
   - 13位Unix时间戳（毫秒级）
   - 记录文件上传的精确时间
   - 便于按时间排序和追溯

3. **随机数**: 
   - 9位随机整数
   - 防止同一时间戳下的文件名冲突
   - 增加文件名的唯一性

4. **扩展名**: 
   - 保持原始文件的扩展名
   - 支持：.png, .jpg, .jpeg, .gif, .webp
   - 默认为 .png

### 示例
```
aihs_1751108746307_939844373.png
aihs_1751108746329_596352406.jpg
aihs_1751108746350_123456789.jpeg
```

## 实现细节

### 后端实现

#### 文件上传配置 (`multer.config.ts`)
```typescript
filename: (req, file, cb) => {
  const filename = generateUniformFilename(file.originalname);
  cb(null, filename);
}
```

#### 工具函数 (`filename.utils.ts`)
```typescript
export function generateUniformFilename(originalName?: string, extension?: string): string {
  const timestamp = Date.now();
  const randomNumber = Math.round(Math.random() * 1E9);
  
  let ext = extension;
  if (!ext && originalName) {
    ext = extname(originalName);
  }
  if (!ext) {
    ext = '.png';
  }
  
  if (!ext.startsWith('.')) {
    ext = '.' + ext;
  }
  
  return `aihs_${timestamp}_${randomNumber}${ext}`;
}
```

#### 文件名解析
```typescript
export function parseAihsFilename(filename: string): {
  isAihsFormat: boolean;
  timestamp?: number;
  randomNumber?: number;
  extension?: string;
  createdAt?: Date;
} {
  const match = filename.match(/^aihs_(\d+)_(\d+)(\..+)?$/);
  
  if (!match) {
    return { isAihsFormat: false };
  }
  
  const [, timestampStr, randomNumberStr, extension] = match;
  const timestamp = parseInt(timestampStr, 10);
  const randomNumber = parseInt(randomNumberStr, 10);
  
  return {
    isAihsFormat: true,
    timestamp,
    randomNumber,
    extension: extension || '',
    createdAt: new Date(timestamp),
  };
}
```

### 前端实现

#### 显示名称生成 (`filename.utils.js`)
```javascript
export function getDisplayFilename(filename, fallbackName) {
  const parsed = parseAihsFilename(filename);
  
  if (parsed.isAihsFormat && parsed.createdAt) {
    const dateStr = parsed.createdAt.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    return `症状图片_${dateStr}${parsed.extension}`;
  }
  
  return fallbackName || filename;
}
```

#### 图片查看器集成
- 显示友好的文件名：`症状图片_2025/06/28 19:05.png`
- 下载时使用友好名称
- 保持向后兼容性

## 优势

### 1. 统一性
- 所有上传文件遵循相同命名规范
- 便于系统管理和维护
- 提高文件识别效率

### 2. 可追溯性
- 时间戳记录精确上传时间
- 便于按时间排序和查询
- 支持审计和日志追踪

### 3. 唯一性
- 时间戳 + 随机数确保文件名唯一
- 避免文件名冲突
- 支持高并发上传

### 4. 用户友好
- 前端显示友好的文件名
- 下载时使用有意义的名称
- 隐藏技术细节

### 5. 向后兼容
- 系统同时支持新旧格式
- 旧文件正常访问
- 平滑过渡升级

## 文件存储结构

```
uploads/
└── pic/
    └── [用户ID]/
        ├── aihs_1751108746307_939844373.png  (新格式)
        ├── aihs_1751108746329_596352406.jpg  (新格式)
        └── 1751087191804-356607885.png       (旧格式，兼容)
```

## 迁移策略

### 当前状态
- 新上传文件使用新命名格式
- 现有文件保持原有格式
- 系统同时支持两种格式

### 未来规划
1. **渐进式迁移**: 新文件使用新格式，旧文件保持不变
2. **批量重命名**: 可选择性地将旧文件重命名为新格式
3. **完全统一**: 最终所有文件使用统一格式

## 配置选项

### 环境变量
```bash
# 文件命名前缀（可自定义）
FILE_NAME_PREFIX=aihs

# 随机数位数
RANDOM_NUMBER_DIGITS=9

# 默认扩展名
DEFAULT_EXTENSION=png
```

### 自定义配置
可以通过修改 `generateUniformFilename` 函数来自定义命名规则：
- 更改前缀
- 调整时间戳格式
- 修改随机数生成方式

## 测试验证

### 测试脚本
运行 `test_filename_system.js` 验证：
- 文件名生成功能
- 格式验证
- 解析功能
- 兼容性测试

### 测试结果示例
```
✅ 格式验证: 通过
✅ 扩展名验证: 通过
✅ 解析功能: 正常
✅ 兼容性: 支持新旧格式
```

## 注意事项

1. **时区处理**: 时间戳使用UTC时间，前端显示时转换为本地时间
2. **文件大小**: 命名不影响文件大小限制（当前5MB）
3. **安全性**: 随机数增加文件名的不可预测性
4. **性能**: 命名规则对上传性能影响微乎其微
5. **备份**: 建议在重要操作前备份现有文件

## 相关文件

### 后端
- `src/config/multer.config.ts` - 文件上传配置
- `src/utils/filename.utils.ts` - 文件名工具函数
- `src/services/image-url.service.ts` - 图片URL服务

### 前端
- `src/utils/filename.utils.js` - 前端文件名工具
- `src/components/ImageViewer.jsx` - 图片查看器
- `src/components/DiagnosisForm.jsx` - 诊断表单

### 配置
- `ENVIRONMENT_CONFIG.md` - 环境配置说明
- `test_filename_system.js` - 测试脚本（临时） 