# 医护主页诊断评估模块待处理数量显示修复

## 问题描述
在 `/medical` 页面中，"診斷評估"模块没有显示 pending 状态的异常测量记录数量。

## 问题原因
前端代码在处理 API 响应时没有正确解构数据。后端 API 返回的数据格式为：
```json
{
  "success": true,
  "data": [...],
  "count": number
}
```

但前端直接使用了响应对象，而不是其中的 `data` 字段，导致统计逻辑无法正确执行。

## 解决方案

### 1. 修复数据解构问题
**文件**: `healthcare_frontend/src/pages/MedicalStaffPage.jsx`

**修改前**:
```javascript
const [measurements, diagnoses, covidStats] = await Promise.all([
  apiService.getAbnormalMeasurements(),
  apiService.getAllDiagnoses(),
  apiService.getCovidAssessmentStats()
])

measurements.forEach(measurement => {
  // 统计逻辑...
})
```

**修改后**:
```javascript
const [measurementsResponse, diagnoses, covidStats] = await Promise.all([
  apiService.getAbnormalMeasurements(),
  apiService.getAllDiagnoses(),
  apiService.getCovidAssessmentStats()
])

// 解构API响应，获取实际数据
const measurements = measurementsResponse.data || measurementsResponse

measurements.forEach(measurement => {
  // 统计逻辑...
})
```

### 2. 徽章显示逻辑
诊断评估模块的徽章配置：
```javascript
{
  title: '診斷評估',
  description: '進行患者診斷與治療建議',
  icon: FileText,
  color: 'text-green-600',  
  path: '/medical/diagnosis',
  badge: stats?.pendingMeasurements > 0 ? stats.pendingMeasurements : null
}
```

### 3. 统计逻辑
```javascript
// 统计待处理的异常测量记录
measurements.forEach(measurement => {
  const patientId = measurement.userId?._id || measurement.userId
  
  if (patientId) {
    if (!patientMap.has(patientId)) {
      patientMap.set(patientId, { pendingCount: 0 })
    }
    
    // 统计待处理的异常测量记录
    if (measurement.isAbnormal && measurement.status === 'pending') {
      patientMap.get(patientId).pendingCount++
      pendingMeasurements++ // 统计待处理的异常测量记录总数
    }
  }
})
```

## 技术细节

### 数据流程
1. **后端API**: `/measurements/abnormal` 返回所有异常测量记录
2. **前端统计**: 筛选出 `status === 'pending'` 的记录
3. **徽章显示**: 在诊断评估模块显示待处理数量

### 状态定义
- `pending`: 待处理
- `processed`: 已处理
- `reviewed`: 已审核

### 统计范围
- **总异常数**: 所有 `isAbnormal: true` 的记录
- **待处理数**: `isAbnormal: true` 且 `status: 'pending'` 的记录
- **已处理数**: `status: 'processed'` 或 `status: 'reviewed'` 的记录

## 修改文件
- `healthcare_frontend/src/pages/MedicalStaffPage.jsx`

## 测试建议
1. 访问 `/medical` 页面
2. 确认"診斷評估"模块显示正确的待处理数量
3. 检查徽章数字与实际待处理记录数量是否一致
4. 验证处理记录后数量是否正确更新

## 相关文档
- `MEDICAL_DIAGNOSIS_BADGE_UPDATE.md` - 之前的徽章更新记录
- `DIAGNOSIS_PAGE_STATISTICS_FIX.md` - 诊断页面统计修复
- `MEASUREMENT_TIME_FIELD_UPDATE.md` - 测量时间字段更新 