# 患者图片上传功能实现说明

## 功能概述

患者在提交测量数据时可以上传最多5张症状图片，图片将保存在服务器上并在医护人员进行诊断时展示。

## 后端实现

### 1. 数据库Schema更新

在 `measurement.schema.ts` 中添加了 `imagePaths` 字段：
```typescript
@Prop({ type: [String], default: [] })
imagePaths: string[]; // 患者上传的图片路径列表
```

### 2. 文件上传配置

创建了 `multer.config.ts` 配置文件：
- 支持的格式：JPEG, PNG, GIF, WebP
- 文件大小限制：5MB
- 文件数量限制：最多5个
- 存储路径：`uploads/pic/{userId}/{filename}`

### 3. 控制器更新

在 `measurements.controller.ts` 中：
- 使用 `@UseInterceptors(FilesInterceptor('images', 5, multerConfig))` 处理文件上传
- 添加了图片访问端点：`/measurements/images/:userId/:filename`
- 在创建测量记录时处理图片路径

### 4. 静态文件服务

在 `main.ts` 中配置了静态文件服务：
```typescript
app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads/',
});
```

## 前端实现

### 1. 测量表单更新

在 `MeasurementForm.jsx` 中添加了：
- 图片选择功能
- 图片预览
- 文件验证（类型、大小、数量）
- FormData提交

### 2. API服务更新

在 `api.js` 中添加了：
- `submitMeasurementWithImages()` 方法支持文件上传
- `getImageUrl()` 方法生成图片访问URL

### 3. 诊断页面更新

在 `DiagnosisForm.jsx` 中添加了：
- "患者症状信息"模块
- 图片缩略图展示
- 点击放大查看功能

## 文件存储结构

```
healthcare_backend/
├── uploads/
│   └── pic/
│       ├── {userId1}/
│       │   ├── {timestamp}-{random}.jpg
│       │   └── {timestamp}-{random}.png
│       └── {userId2}/
│           └── {timestamp}-{random}.jpg
```

## 图片处理流程

1. **上传阶段**：
   - 患者在测量表单中选择图片
   - 前端验证文件类型、大小、数量
   - 使用FormData提交到后端
   - 后端使用multer处理文件上传
   - 图片保存到 `uploads/pic/{userId}/` 目录
   - 图片路径保存到数据库

2. **展示阶段**：
   - 医护人员在诊断页面查看测量记录
   - 前端从数据库获取图片路径
   - 使用静态文件服务访问图片
   - 显示缩略图，点击可放大查看

## 安全考虑

1. **文件类型验证**：只允许图片格式
2. **文件大小限制**：单个文件最大5MB
3. **文件数量限制**：最多5张图片
4. **路径隔离**：每个用户的图片存储在独立目录
5. **认证要求**：需要有效的JWT token

## 测试

可以使用 `test_image_upload.js` 脚本测试图片上传功能：

```bash
cd healthcare_backend
node test_image_upload.js
```

## 部署注意事项

1. 确保服务器有足够的存储空间
2. 配置适当的文件权限
3. 考虑使用CDN或对象存储服务处理大量图片
4. 定期清理无效的图片文件 