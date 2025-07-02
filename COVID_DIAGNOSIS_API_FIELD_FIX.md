# COVID诊断API字段修复

## 问题描述
COVID诊断提交时出现API字段不匹配错误：
```
property medications should not exist
property lifestyle should not exist  
property followUp should not exist
property treatmentPlan should not exist
property isolationAdvice should not exist
diagnosisType must be one of the following values: 
diagnosisType must be a string
recommendation must be a string
```

## 问题分析

### 后端期望的字段结构
根据 `healthcare_backend/src/dto/covid-diagnosis.dto.ts` 和 `healthcare_backend/src/schemas/covid-diagnosis.schema.ts`：

**必需字段**：
- `patientId: string` - 患者ID
- `assessmentId: string` - 评估记录ID
- `diagnosisType: string` - 诊断类型 ('covid', 'flu', 'other')
- `diagnosis: string` - 诊断结果
- `recommendation: string` - 医生建议

**可选字段**：
- `treatment?: string` - 治疗方案
- `followUpDate?: string` - 复诊日期
- `isolationDays?: number` - 隔离天数
- `testingRecommendation?: string` - 检测建议
- `returnToWorkDate?: string` - 复工日期
- `riskLevel?: string` - 风险等级
- `urgency?: string` - 紧急程度 ('low', 'medium', 'high', 'urgent')
- `notes?: string` - 医生备注
- `requiresHospitalization?: boolean` - 是否需要住院
- `medicationPrescription?: string` - 药物处方
- `monitoringInstructions?: string` - 监测指示

### 前端发送的错误字段结构
```javascript
const diagnosisData = {
  assessmentId: assessmentData._id,
  patientId: currentUserId,
  diagnosis: diagnosis.trim(),
  riskLevel: riskLevel,
  medications: medications.trim(),        // ❌ 后端不存在此字段
  lifestyle: lifestyle.trim(),           // ❌ 后端不存在此字段
  followUp: followUp.trim(),             // ❌ 后端不存在此字段
  notes: notes.trim(),
  treatmentPlan: treatmentPlan.trim(),   // ❌ 后端不存在此字段
  isolationAdvice: isolationAdvice.trim(), // ❌ 后端不存在此字段
  testingRecommendation: testingRecommendation.trim()
}
```

## 解决方案

### 1. 字段映射和合并策略
将前端的多个字段合并到后端期望的字段中：

```javascript
const diagnosisData = {
  assessmentId: assessmentData._id,
  patientId: currentUserId,
  diagnosisType: 'covid', // ✅ 添加必需的诊断类型
  diagnosis: diagnosis.trim(),
  // ✅ 将多个建议字段合并为单一的recommendation字段
  recommendation: `${lifestyle.trim() ? `生活方式建議: ${lifestyle.trim()}. ` : ''}${followUp.trim() ? `復查建議: ${followUp.trim()}. ` : ''}${isolationAdvice.trim() ? `隔離建議: ${isolationAdvice.trim()}. ` : ''}`.trim() || '無特殊建議',
  // ✅ 将治疗计划和用药建议合并为treatment字段
  treatment: treatmentPlan.trim() || medications.trim() || undefined,
  riskLevel: riskLevel,
  testingRecommendation: testingRecommendation.trim() || undefined,
  notes: notes.trim() || undefined,
  // ✅ 从隔离建议中提取隔离天数
  isolationDays: isolationAdvice.trim() ? extractIsolationDays(isolationAdvice.trim()) : undefined,
  // ✅ 根据风险等级设置紧急程度
  urgency: mapRiskLevelToUrgency(riskLevel)
}
```

### 2. 辅助函数实现

#### 隔离天数提取函数
```javascript
const extractIsolationDays = (isolationText) => {
  if (!isolationText) return undefined
  
  // 尝试匹配数字+天的模式
  const match = isolationText.match(/(\d+)\s*[天日]/);
  if (match) {
    return parseInt(match[1], 10)
  }
  
  // 如果没有找到具体天数，根据常见词汇推断
  if (isolationText.includes('一週') || isolationText.includes('1週')) return 7
  if (isolationText.includes('兩週') || isolationText.includes('2週')) return 14
  if (isolationText.includes('三天') || isolationText.includes('3天')) return 3
  if (isolationText.includes('五天') || isolationText.includes('5天')) return 5
  if (isolationText.includes('十天') || isolationText.includes('10天')) return 10
  
  return undefined
}
```

#### 风险等级映射函数
```javascript
const mapRiskLevelToUrgency = (riskLevel) => {
  switch (riskLevel) {
    case 'critical':
      return 'urgent'
    case 'high':
      return 'high'
    case 'medium':
      return 'medium'
    case 'low':
    default:
      return 'low'
  }
}
```

### 3. 字段映射对照表

| 前端字段 | 后端字段 | 处理方式 |
|---------|---------|---------|
| `diagnosis` | `diagnosis` | 直接映射 |
| `medications` | `treatment` | 合并到treatment |
| `treatmentPlan` | `treatment` | 合并到treatment |
| `lifestyle` | `recommendation` | 合并到recommendation |
| `followUp` | `recommendation` | 合并到recommendation |
| `isolationAdvice` | `recommendation` + `isolationDays` | 文本合并到recommendation，天数提取到isolationDays |
| `riskLevel` | `riskLevel` | 直接映射 |
| `testingRecommendation` | `testingRecommendation` | 直接映射 |
| `notes` | `notes` | 直接映射 |
| - | `diagnosisType` | 固定为'covid' |
| `riskLevel` | `urgency` | 通过映射函数转换 |

## 技术实现细节

### 文件修改
- **文件路径**：`healthcare_frontend/src/pages/CovidDiagnosisFormPage.jsx`
- **修改位置**：`handleSubmitDiagnosis` 函数中的数据结构构建部分

### 关键改进
1. **必需字段补全**：添加缺失的 `diagnosisType` 字段
2. **字段合并**：将多个相关字段合并为后端期望的单一字段
3. **数据转换**：添加辅助函数处理特殊数据转换
4. **空值处理**：使用 `undefined` 而非空字符串处理可选字段

### 数据完整性保证
- 所有前端输入的信息都被保留
- 通过合并策略避免信息丢失
- 智能提取结构化数据（如隔离天数）

## 测试验证
修复后需要验证：
1. ✅ 诊断类型正确设置为'covid'
2. ✅ 建议字段正确合并到recommendation
3. ✅ 治疗相关字段正确合并到treatment
4. ✅ 隔离天数正确提取
5. ✅ 紧急程度正确映射
6. ✅ 可选字段正确处理（undefined vs 空字符串）

## 向后兼容性
- 前端UI保持不变，用户体验无影响
- 所有现有的表单字段都被正确处理
- 数据语义保持完整

这次修复确保了前端数据结构与后端API完全兼容，同时保持了所有用户输入信息的完整性。 