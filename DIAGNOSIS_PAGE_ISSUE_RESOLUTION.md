# 诊断页面问题解决方案

## 问题描述
医护端诊断页面没有显示患者上传的图片，也没有显示患者提交的异常数据。

## 问题分析

### 1. 后端API问题
- **用户信息缺失**：在`measurements.service.ts`的`findByUserId`方法中没有populate用户信息
- **Token字段不一致**：后端返回`token`字段，前端期望`access_token`字段

### 2. 前端API配置问题
- **Token字段映射错误**：前端在处理登录响应时使用了错误的字段名

## 解决方案

### 1. 修复后端测量服务
**文件**: `healthcare_backend/src/measurements/measurements.service.ts`

```typescript
async findByUserId(userId: string) {
  return this.measurementModel
    .find({ userId })
    .populate('userId', 'username fullName role')  // 添加用户信息populate
    .sort({ createdAt: -1 });
}
```

**作用**: 确保返回的测量记录包含完整的用户信息，前端可以正确获取用户ID来构建图片URL。

### 2. 统一Token字段名称
**文件**: `healthcare_backend/src/auth/auth.service.ts`

```typescript
// 登录和注册方法中统一返回access_token字段
return {
  success: true,
  user: { ... },
  access_token: token,  // 改为access_token
};
```

**文件**: `healthcare_frontend/src/services/api.js`

```javascript
// 前端API服务中使用access_token字段
if (response.success && response.access_token) {
  this.setToken(response.access_token);
}
```

## 功能验证

### 诊断页面功能
1. **患者测量记录显示**：正确显示患者的所有测量记录
2. **异常数据标识**：异常测量记录显示红色标识和"整體異常"徽章
3. **图片显示**：在"患者症狀信息"模块显示上传的图片
4. **图片查看器**：点击图片可以打开专业的图片查看器

### API端点测试
- `GET /api/users/patients` - 获取患者列表 ✓
- `GET /api/measurements/user/{userId}` - 获取指定患者的测量记录 ✓
- `GET /uploads/pic/{userId}/{filename}` - 访问患者上传的图片 ✓

## 前端显示逻辑

### 图片URL构建
```javascript
// 在DiagnosisForm.jsx中
const userId = measurement.userId?._id || measurement.userId;
const imageUrl = apiService.getImageUrl(userId, filename);
```

### 异常数据显示
```javascript
// 异常记录的视觉标识
{measurement.isAbnormal && (
  <Badge variant="destructive">整體異常</Badge>
)}

// 异常原因显示
{measurement.abnormalReasons && measurement.abnormalReasons.length > 0 && (
  <div className="text-red-600">
    异常原因: {measurement.abnormalReasons.join(', ')}
  </div>
)}
```

## 测试结果
- ✅ 医护人员可以成功登录
- ✅ 可以获取患者列表
- ✅ 可以查看患者的测量记录
- ✅ 异常数据正确标识和显示
- ✅ 患者上传的图片正确显示
- ✅ 图片查看器功能正常

## 相关文件
- `healthcare_backend/src/measurements/measurements.service.ts`
- `healthcare_backend/src/auth/auth.service.ts`
- `healthcare_frontend/src/services/api.js`
- `healthcare_frontend/src/components/DiagnosisForm.jsx`
- `healthcare_frontend/src/components/ImageViewer.jsx`

## 注意事项
1. 确保后端服务正常运行在端口7723
2. 确保前端服务正常运行在端口6886
3. 图片文件存储在`uploads/pic/{userId}/`目录下
4. 医护人员账号：`doctor002/123456`
5. 患者账号：`p001/123456` 