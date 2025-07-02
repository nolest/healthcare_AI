# 诊断报告提交失败问题修复

## 问题描述

用户在医护端诊断表单页面提交诊断报告时遇到 400 Bad Request 错误：
- URL: `/medical/diagnosis/form?mid=68642e4b2eb2371bdde03b6c`
- API: `POST http://localhost:7723/api/diagnosis-reports`
- 状态码: 400 Bad Request

## 问题分析

通过分析前端和后端代码，发现了以下问题：

### 1. 数据格式不匹配
**问题**: 前端发送的数据格式与后端 DTO 期望的格式不匹配

**前端原始数据格式**:
```javascript
{
  patientId: measurementData.userId,
  measurementId: measurementData._id,  // ❌ 后端不期望此字段
  diagnosis: diagnosis,
  riskLevel: riskLevel,                // ❌ 后端期望 urgency
  recommendations: { ... },            // ❌ 后端期望 recommendation (字符串)
  notes: notes,
  treatmentPlan: treatmentPlan,        // ❌ 后端期望 treatment
  doctorId: currentUser._id,           // ❌ 后端不需要，会自动设置
  doctorName: currentUser.fullName     // ❌ 后端不需要
}
```

**后端期望的 DTO 格式**:
```typescript
{
  patientId: string;
  reportType: 'measurement' | 'covid_flu';  // ✅ 必需字段
  sourceId: string;                         // ✅ 必需字段
  diagnosis: string;                        // ✅ 必需字段
  recommendation: string;                   // ✅ 必需字段
  treatment?: string;                       // ✅ 可选字段
  urgency?: 'low' | 'medium' | 'high' | 'urgent'; // ✅ 可选字段
  notes?: string;                           // ✅ 可选字段
}
```

### 2. 风险等级值不匹配
**问题**: 前端使用的风险等级值与后端验证规则不匹配

- 前端: `'low'`, `'medium'`, `'high'`, `'critical'`
- 后端: `'low'`, `'medium'`, `'high'`, `'urgent'`

### 3. 错误处理不完善
**问题**: 前端无法正确捕获和显示后端的详细验证错误信息

## 修复方案

### 1. 修复数据格式映射

**修改文件**: `healthcare_frontend/src/pages/MedicalDiagnosisFormPage.jsx`

```javascript
// 修复前
const diagnosisData = {
  patientId: measurementData.userId,
  measurementId: measurementData._id,
  diagnosis: diagnosis,
  riskLevel: riskLevel,
  recommendations: {
    medications: medications,
    lifestyle: lifestyle,
    followUp: followUp,
    nextCheckup: ''
  },
  notes: notes,
  treatmentPlan: treatmentPlan,
  doctorId: currentUser._id,
  doctorName: currentUser.fullName || currentUser.username
}

// 修复后
const diagnosisData = {
  patientId: typeof measurementData.userId === 'string' ? measurementData.userId : measurementData.userId?._id,
  reportType: 'measurement',
  sourceId: measurementData._id,
  diagnosis: diagnosis,
  recommendation: `用藥建議: ${medications || '無'}\n\n生活方式建議: ${lifestyle || '無'}\n\n復查建議: ${followUp || '無'}`,
  treatment: `${medications || ''}${lifestyle ? '\n\n' + lifestyle : ''}`,
  urgency: urgencyMapping[riskLevel] || riskLevel,
  notes: notes || ''
}
```

### 2. 添加风险等级映射

```javascript
// 映射风险等级值
const urgencyMapping = {
  'low': 'low',
  'medium': 'medium', 
  'high': 'high',
  'critical': 'urgent'  // ✅ 关键修复
}
```

### 3. 改进错误处理

**修改文件**: `healthcare_frontend/src/services/api.js`

```javascript
// 改进 request 方法的错误处理
async request(endpoint, options = {}) {
  // ... 其他代码
  
  if (!response.ok) {
    // 创建包含详细错误信息的错误对象
    const error = new Error(data.message || `HTTP error! status: ${response.status}`);
    error.response = {
      status: response.status,
      statusText: response.statusText,
      data: data
    };
    throw error;
  }
  
  // ... 其他代码
}
```

**修改前端错误处理**:
```javascript
} catch (error) {
  console.error('提交诊断失败:', error)
  if (error.response && error.response.data) {
    console.error('错误详情:', error.response.data)
    setMessage(`❌ 提交診斷報告失敗: ${error.response.data.message || '請重試'}`)
  } else {
    setMessage('❌ 提交診斷報告失敗，請重試')
  }
}
```

## 验证修复

### 1. 数据格式验证
创建了测试脚本 `test_diagnosis_report.js` 来验证数据格式：

```javascript
const testData = {
  patientId: '68642e4b2eb2371bdde03b6c',
  reportType: 'measurement',          // ✅ 必需
  sourceId: '68642e4b2eb2371bdde03b6c', // ✅ 必需
  diagnosis: '测试诊断',               // ✅ 必需
  recommendation: '测试建议',          // ✅ 必需
  urgency: 'medium'                   // ✅ 正确的值
};
```

### 2. 字段验证规则
- ✅ `patientId`: 字符串，必需
- ✅ `reportType`: 'measurement' | 'covid_flu'，必需
- ✅ `sourceId`: 字符串，必需
- ✅ `diagnosis`: 字符串，必需
- ✅ `recommendation`: 字符串，必需
- ✅ `urgency`: 'low' | 'medium' | 'high' | 'urgent'，可选
- ✅ `treatment`: 字符串，可选
- ✅ `notes`: 字符串，可选

## 测试步骤

1. **启动后端服务**:
   ```bash
   cd healthcare_backend
   npm run start:dev
   ```

2. **启动前端服务**:
   ```bash
   cd healthcare_frontend
   npm run dev
   ```

3. **测试诊断报告提交**:
   - 访问 `/medical/diagnosis/form?mid=<measurement_id>`
   - 填写诊断表单
   - 点击提交按钮
   - 验证提交成功

## 预期结果

修复后，诊断报告提交应该：
- ✅ 不再出现 400 Bad Request 错误
- ✅ 能够正确提交到后端
- ✅ 显示成功提示信息
- ✅ 能够正确处理和显示错误信息

## 相关文件

- `healthcare_frontend/src/pages/MedicalDiagnosisFormPage.jsx` - 主要修复文件
- `healthcare_frontend/src/services/api.js` - API 错误处理改进
- `healthcare_backend/src/dto/diagnosis-report.dto.ts` - 后端 DTO 定义
- `healthcare_backend/src/diagnosis-reports/diagnosis-reports.service.ts` - 后端服务逻辑
- `healthcare_frontend/test_diagnosis_report.js` - 测试验证脚本 