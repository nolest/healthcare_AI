# 患者信息接口更新 - 包含历史测量数据

## 更新概述

患者信息接口（`/api/users/:id`）现在包含该患者的所有历史测量记录，以便在诊断页面中显示完整的测量历史。

## 更改内容

### 后端更改

1. **用户服务 (`healthcare_backend/src/users/users.service.ts`)**
   - 在 `findById` 方法中添加了对患者历史测量数据的查询
   - 当查询的用户是患者时，自动包含 `history_measurements` 字段
   - 测量数据按创建时间倒序排列（最新的在前）

2. **用户模块 (`healthcare_backend/src/users/users.module.ts`)**
   - 导入了 `Measurement` 模式以支持测量数据查询

### 前端更改

1. **API服务 (`healthcare_frontend/src/services/api.js`)**
   - 添加了 `getUserById(userId)` 方法来获取单个用户信息

2. **诊断页面 (`healthcare_frontend/src/pages/DiagnosisPage.jsx`)**
   - 修改了 `fetchPatientData` 函数，首先尝试通过用户API获取包含历史测量数据的患者信息
   - 如果失败，则回退到原有的患者列表API

3. **诊断表单 (`healthcare_frontend/src/components/DiagnosisForm.jsx`)**
   - 修改了 `fetchPatientMeasurements` 函数，优先使用患者对象中的 `history_measurements` 字段
   - 如果患者对象没有包含历史测量数据，则回退到原有的测量API调用

## API响应格式

### 患者信息接口响应

当请求患者信息时（`GET /api/users/:patientId`），响应现在包含：

```json
{
  "_id": "患者ID",
  "username": "患者用户名",
  "fullName": "患者姓名",
  "email": "患者邮箱",
  "role": "patient",
  "createdAt": "创建时间",
  "updatedAt": "更新时间",
  "history_measurements": [
    {
      "_id": "测量记录ID",
      "userId": "患者ID",
      "systolic": 120,
      "diastolic": 80,
      "heartRate": 75,
      "temperature": 36.5,
      "oxygenSaturation": 98,
      "bloodSugar": 95,
      "isAbnormal": false,
      "abnormalReasons": [],
      "status": "pending",
      "measurementTime": "测量时间",
      "createdAt": "记录创建时间",
      "location": "测量地点",
      "notes": "备注"
    }
    // ... 更多测量记录，按时间倒序排列
  ]
}
```

## 功能特点

1. **自动包含**: 当查询患者信息时，自动包含该患者的所有历史测量记录
2. **时间排序**: 测量记录按数据录入时间倒序排列（最新的在前）
3. **完整数据**: 包含所有测量字段和异常检测结果
4. **向下兼容**: 对非患者用户，接口行为保持不变
5. **前端优化**: 前端优先使用患者对象中的历史数据，减少API调用

## 诊断页面显示

在诊断页面的"相关测量记录"块中：
- 测量记录按时间从上到下排列（最新的在最上面）
- 显示完整的测量数据和异常状态
- 支持选择相关的测量记录进行诊断关联

## 测试

可以使用以下测试脚本验证功能：

```bash
cd healthcare_backend
node test_patient_with_measurements.js
```

## 注意事项

1. 只有患者角色的用户才会包含 `history_measurements` 字段
2. 如果患者没有测量记录，`history_measurements` 将是空数组
3. 前端保持了向后兼容性，如果患者对象没有历史数据，会自动回退到原有的API调用方式 