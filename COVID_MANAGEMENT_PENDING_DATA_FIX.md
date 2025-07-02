# COVID管理页面"待处理"数据修复

## 问题描述
用户反馈 `medical/covid-management` 页面上的四个数据展示中，"待处理"数据不正确。

## 问题分析

### 根本原因
后端 `getStats()` 方法中计算"待处理"数据的逻辑不完整：

**原始错误逻辑**：
```typescript
const pending = await this.covidAssessmentModel.countDocuments({ status: 'pending' });
```

**问题**：
1. 只统计 `status: 'pending'` 的记录
2. 忽略了没有 `status` 字段的历史记录
3. 忽略了 `status: null` 的记录

### 数据库状态分析
COVID评估记录的状态可能存在以下情况：
- `status: 'pending'` - 明确的待处理状态
- `status: { $exists: false }` - 历史记录没有status字段
- `status: null` - status字段存在但值为null
- `status: 'processed'` - 已处理
- `status: 'reviewed'` - 已审核

## 修复方案

### 1. 后端修复
**文件**: `healthcare_backend/src/covid-assessments/covid-assessments.service.ts`

**修复 getStats() 方法**：
```typescript
// 修复前
const pending = await this.covidAssessmentModel.countDocuments({ status: 'pending' });

// 修复后
const pending = await this.covidAssessmentModel.countDocuments({ 
  $or: [
    { status: { $exists: false } },
    { status: null },
    { status: 'pending' }
  ]
});
```

### 2. 前端修复
**文件**: `healthcare_frontend/src/pages/CovidManagementPage.jsx`

**修复 calculateStats() 方法**：
```javascript
// 修复前
pending: assessments.filter(a => !a.status || a.status === 'pending').length,

// 修复后
pending: assessments.filter(a => 
  !a.status || 
  a.status === null || 
  a.status === 'pending'
).length,
```

### 3. 数据库修复脚本
**文件**: `healthcare_backend/fix_covid_status.js`

创建脚本自动修复历史数据：
```javascript
// 批量更新没有status字段或status为null的记录
const result = await collection.updateMany(
  {
    $or: [
      { status: { $exists: false } },
      { status: null }
    ]
  },
  {
    $set: { status: 'pending' }
  }
);
```

## Schema验证
**文件**: `healthcare_backend/src/schemas/covid-assessment.schema.ts`

确认schema已正确定义默认值：
```typescript
@Prop({ required: true, default: 'pending' })
status: string; // 'pending', 'processed', 'reviewed'
```

## 执行步骤

1. **应用代码修复**：
   - 后端服务修复
   - 前端页面修复

2. **运行数据修复脚本**：
   ```bash
   cd healthcare_backend
   node fix_covid_status.js
   ```

3. **验证修复结果**：
   - 检查数据库中的状态统计
   - 验证前端页面显示的数据正确性

## 预期结果

修复后，COVID管理页面的统计数据应该正确显示：
- **总数**: 所有COVID评估记录
- **待处理**: 包括所有未被医护人员处理的记录（status为pending、null或不存在）
- **已处理**: status为'processed'或'reviewed'的记录
- **处理率**: (已处理数量/总数量) × 100%

## 防止问题再次出现

1. **新记录创建**: Schema已设置默认值，新记录会自动设置status为'pending'
2. **状态更新**: 在COVID诊断完成后，确保更新记录状态为'processed'
3. **数据一致性**: 前后端使用相同的逻辑计算统计数据

## 测试验证

修复完成后，应验证：
1. 管理页面四个统计数据显示正确
2. 待处理数量与实际未处理记录数量一致
3. 处理率计算准确
4. 筛选功能正常工作 