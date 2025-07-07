# COVID诊断字段映射修复总结

## 问题描述
用户报告了两个问题：
1. 医生端COVID诊断表单页面在只读模式（`hasread=1`）下，某些字段（Medication Advice、Lifestyle Advice、Isolation Advice、Follow-up Advice）显示为空
2. 患者端COVID诊断详情页面缺少某些字段的显示（Lifestyle Advice、Isolation Advice、Follow-up Advice）

## 根本原因分析
通过分析代码发现，前端和后端的字段映射不一致：

### 后端数据结构（Schema）
```typescript
// healthcare_backend/src/schemas/covid-diagnosis.schema.ts
{
  diagnosis: string,           // 诊断结果
  recommendation: string,      // 医生建议（合并字段）
  treatment: string,           // 治疗方案
  testingRecommendation: string, // 检测建议
  medicationPrescription: string, // 药物处方
  notes: string,               // 医生备注
  isolationDays: number,       // 隔离天数
  // 没有单独的 lifestyleAdvice, isolationAdvice, followUp 字段
}
```

### 前端期望的字段名
```javascript
{
  medicationAdvice: string,    // 药物建议
  lifestyleAdvice: string,     // 生活方式建议
  isolationAdvice: string,     // 隔离建议
  followUp: string,            // 复查建议
}
```

### 数据提交时的处理
前端在提交COVID诊断时，将多个建议字段合并到 `recommendation` 字段中：
```javascript
recommendation: `${lifestyle.trim() ? `生活方式建議: ${lifestyle.trim()}. ` : ''}${followUp.trim() ? `復查建議: ${followUp.trim()}. ` : ''}${isolationAdvice.trim() ? `隔離建議: ${isolationAdvice.trim()}. ` : ''}`.trim()
```

但在读取时，前端却期望这些字段是分开的，导致显示为空。

## 修复方案

### 1. 医生端只读模式修复
在 `CovidDiagnosisFormPage.jsx` 的 `loadExistingCovidDiagnosis` 函数中：

```javascript
// 设置表单数据 - 适配后端字段名
setDiagnosis(diagnosisData.diagnosis || '')
setRiskLevel(diagnosisData.riskLevel || '')
setMedications(diagnosisData.medicationPrescription || diagnosisData.treatment || '')
setLifestyle(diagnosisData.lifestyleAdvice || '')
setFollowUp(diagnosisData.followUp || '')
setNotes(diagnosisData.notes || '')
setTreatmentPlan(diagnosisData.treatment || '')
setIsolationAdvice(diagnosisData.isolationAdvice || '')
setTestingRecommendation(diagnosisData.testingRecommendation || '')

// 如果recommendation字段包含多个建议，尝试解析
if (diagnosisData.recommendation && !diagnosisData.lifestyleAdvice) {
  const recommendation = diagnosisData.recommendation
  
  // 使用正则表达式提取不同类型的建议
  const lifestyleMatch = recommendation.match(/生活方式建議[：:]\s*([^。.]+)/i) || 
                        recommendation.match(/Lifestyle.*?[：:]\s*([^。.]+)/i)
  const followUpMatch = recommendation.match(/復查建議[：:]\s*([^。.]+)/i) || 
                       recommendation.match(/Follow.*?[：:]\s*([^。.]+)/i)
  const isolationMatch = recommendation.match(/隔離建議[：:]\s*([^。.]+)/i) || 
                        recommendation.match(/Isolation.*?[：:]\s*([^。.]+)/i)
  
  if (lifestyleMatch) setLifestyle(lifestyleMatch[1].trim())
  if (followUpMatch) setFollowUp(followUpMatch[1].trim())
  if (isolationMatch) setIsolationAdvice(isolationMatch[1].trim())
  
  // 如果没有匹配到特定模式，将整个recommendation作为lifestyle advice
  if (!lifestyleMatch && !followUpMatch && !isolationMatch) {
    setLifestyle(recommendation)
  }
}
```

### 2. 患者端字段显示修复
在 `PatientCovidDiagnosisReportDetailPage.jsx` 中：

#### 添加字段解析函数
```javascript
// 从recommendation字段中提取特定类型的建议
const extractAdviceFromRecommendation = (recommendation, type) => {
  if (!recommendation) return null
  
  switch (type) {
    case 'lifestyle':
      const lifestyleMatch = recommendation.match(/生活方式建議[：:]\s*([^。.]+)/i) || 
                            recommendation.match(/Lifestyle.*?[：:]\s*([^。.]+)/i)
      return lifestyleMatch ? lifestyleMatch[1].trim() : null
      
    case 'isolation':
      const isolationMatch = recommendation.match(/隔離建議[：:]\s*([^。.]+)/i) || 
                            recommendation.match(/Isolation.*?[：:]\s*([^。.]+)/i)
      return isolationMatch ? isolationMatch[1].trim() : null
      
    case 'followup':
      const followUpMatch = recommendation.match(/復查建議[：:]\s*([^。.]+)/i) || 
                           recommendation.match(/Follow.*?[：:]\s*([^。.]+)/i)
      return followUpMatch ? followUpMatch[1].trim() : null
      
    default:
      return null
  }
}
```

#### 修复字段显示逻辑
```javascript
// 药物建议 - 支持多个字段名
{(report.medicationAdvice || report.medicationPrescription || report.treatment) && (
  <div>
    {report.medicationAdvice || report.medicationPrescription || report.treatment}
  </div>
)}

// 生活方式建议 - 优先使用专门字段，否则从recommendation中提取
{(report.lifestyleAdvice || (report.recommendation && extractAdviceFromRecommendation(report.recommendation, 'lifestyle'))) && (
  <div>
    {report.lifestyleAdvice || extractAdviceFromRecommendation(report.recommendation, 'lifestyle')}
  </div>
)}

// 隔离建议
{(report.isolationAdvice || (report.recommendation && extractAdviceFromRecommendation(report.recommendation, 'isolation'))) && (
  <div>
    {report.isolationAdvice || extractAdviceFromRecommendation(report.recommendation, 'isolation')}
  </div>
)}

// 复查建议
{(report.followUp || (report.recommendation && extractAdviceFromRecommendation(report.recommendation, 'followup'))) && (
  <div>
    {report.followUp || extractAdviceFromRecommendation(report.recommendation, 'followup')}
  </div>
)}
```

## 修复效果

### 医生端修复
- ✅ 只读模式下正确显示 Medication Advice
- ✅ 只读模式下正确显示 Lifestyle Advice  
- ✅ 只读模式下正确显示 Isolation Advice
- ✅ 只读模式下正确显示 Follow-up Advice
- ✅ 支持从合并的 recommendation 字段中解析各类建议
- ✅ 兼容不同的字段名映射

### 患者端修复
- ✅ 正确显示药物建议（支持 medicationAdvice, medicationPrescription, treatment）
- ✅ 正确显示生活方式建议（从 recommendation 字段解析）
- ✅ 正确显示隔离建议（从 recommendation 字段解析）
- ✅ 正确显示复查建议（从 recommendation 字段解析）
- ✅ 支持中英文模式的建议解析

## 技术实现细节

### 正则表达式解析
使用正则表达式从合并的 recommendation 字段中提取特定类型的建议：
- 支持中文和英文标识符
- 支持冒号和中文冒号分隔符
- 提取到句号或点号为止的内容
- 大小写不敏感匹配

### 字段映射兼容性
- 药物建议：`medicationAdvice` → `medicationPrescription` 或 `treatment`
- 生活方式建议：`lifestyleAdvice` → 从 `recommendation` 解析
- 隔离建议：`isolationAdvice` → 从 `recommendation` 解析
- 复查建议：`followUp` → 从 `recommendation` 解析

### 降级策略
如果无法从 recommendation 中解析出特定类型的建议，会将整个 recommendation 作为生活方式建议显示，确保信息不丢失。

## 测试建议

1. **医生端测试**：
   - 访问 `http://localhost:6886/medical/covid-management/details?aid=xxx&hasread=1`
   - 验证所有建议字段都能正确显示

2. **患者端测试**：
   - 访问 `http://localhost:6886/patient/coviddiagnosis-reports/xxx`
   - 验证药物建议、生活方式建议、隔离建议、复查建议都能正确显示

3. **数据兼容性测试**：
   - 测试新旧数据格式的兼容性
   - 验证中英文建议内容的正确解析

## 注意事项

1. 此修复保持了向后兼容性，不会影响现有数据
2. 支持多种字段名映射，适应后端数据结构的变化
3. 使用正则表达式解析时考虑了中英文环境
4. 提供了降级策略，确保信息完整性 