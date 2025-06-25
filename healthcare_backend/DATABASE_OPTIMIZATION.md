# Healthcare_Local 数据库结构优化

## 概述

本次优化将数据库从 `healthcare_clean` 改回 `healthcare_local`，并基于前端实际使用的功能，确定了必需的集合结构，移除多余的集合。

## 数据库配置变更

### 1. 数据库名称变更
- **之前**: `healthcare_clean`
- **现在**: `healthcare_local`

### 2. 配置文件更新
- `src/config/database.config.ts` - 数据库连接字符串
- `scripts/` 目录下所有脚本 - 数据库名称参数

## 前端API使用分析

基于前端组件的实际使用情况，分析出以下必需的API功能：

### 认证相关 (Auth)
- `login` - 用户登录
- `register` - 用户注册  
- `getCurrentUser` - 获取当前用户信息
- `logout` - 用户登出

### 测量数据 (Measurements)
- `submitMeasurement` - 提交测量数据
- `getMyMeasurements` - 获取我的测量数据
- `getAbnormalMeasurements` - 获取异常测量数据
- `getUserMeasurements` - 获取指定用户测量数据
- `processPatientMeasurements` - 批量处理患者测量数据
- `updateMeasurementStatus` - 更新测量数据状态
- `getMeasurementStats` - 获取测量数据统计

### 用户管理 (Users)
- `getPatients` - 获取患者列表

### 诊断管理 (Diagnoses)
- `getMyDiagnoses` - 获取我的诊断记录
- `getAllDiagnoses` - 获取所有诊断记录
- `createDiagnosis` - 创建诊断记录
- `getDiagnosisStats` - 获取诊断统计

### COVID评估 (Covid Assessments)
- `getMyCovidAssessments` - 获取我的COVID评估
- `getAllCovidAssessments` - 获取所有COVID评估
- `submitCovidAssessment` - 提交COVID评估

## 必需集合定义

基于API使用分析，确定了4个必需集合：

### 1. users (用户集合)
**用途**: 存储患者和医护人员信息
**API支持**: 认证、用户管理
**字段**: username, password, fullName, email, role, phone, birthDate, gender, department, license_number

### 2. measurements (测量数据集合)
**用途**: 存储患者的生理测量数据
**API支持**: 测量数据管理、异常检测
**字段**: userId, systolic, diastolic, heartRate, temperature, oxygenSaturation, notes, status, isAbnormal, measurementTime

### 3. diagnoses (诊断集合)
**用途**: 存储医生对患者的诊断记录
**API支持**: 诊断管理
**字段**: patientId, doctorId, measurementId, diagnosis, treatment, followUpDate, notes, status

### 4. covidassessments (COVID评估集合)
**用途**: 存储COVID-19症状评估和风险评估
**API支持**: COVID评估功能
**字段**: userId, symptoms, severity, riskLevel, recommendations, exposureHistory, travelHistory, contactHistory, vaccinationStatus, testResults, notes

## 数据库管理工具

### 1. 分析工具
```bash
node analyze_local_db.js
```
- 检查当前数据库结构
- 分析必需和多余的集合
- 提供优化建议

### 2. 清理工具
```bash
node cleanup_local_db.js
```
- 删除多余的集合
- 保留必需的集合
- 显示清理结果

### 3. 初始化工具
```bash
node scripts/init-complete-database.js
```
- 重新创建完整的数据库结构
- 建立必要的索引
- 插入示例数据

### 4. 检查工具
```bash
node scripts/simple-db-check.js
```
- 快速检查数据库状态
- 显示集合和数据统计

### 5. 管理界面
```bash
manage_local_db.bat
```
- Windows批处理工具
- 交互式数据库管理
- 包含所有管理功能

## 优化效果

### 集合精简
- 移除未使用的集合
- 保留核心业务集合
- 减少数据库复杂度

### 性能优化
- 为常用查询字段建立索引
- 使用复合索引优化多字段查询
- 减少不必要的数据存储

### 维护简化
- 明确的集合职责划分
- 清晰的数据关系
- 便于后续扩展

## 数据关系图

```
healthcare_local 数据库
├── users (用户表)
│   ├── 患者 (role: patient)
│   └── 医护人员 (role: medical_staff)
├── measurements (测量数据)
│   └── 关联 users._id (患者)
├── diagnoses (诊断记录)  
│   ├── patientId → users._id (患者)
│   ├── doctorId → users._id (医生)
│   └── measurementId → measurements._id
└── covidassessments (COVID评估)
    └── userId → users._id
```

## 索引策略

### users 集合
- `username_1` (唯一)
- `email_1` (唯一)
- `role_1` (角色查询)

### measurements 集合
- `userId_1` (用户查询)
- `createdAt_-1` (时间排序)
- `isAbnormal_1` (异常筛选)
- `status_1` (状态筛选)
- `userId_1_createdAt_-1` (复合索引)

### diagnoses 集合
- `patientId_1` (患者查询)
- `doctorId_1` (医生查询)
- `measurementId_1` (测量关联)
- `createdAt_-1` (时间排序)
- `status_1` (状态筛选)

### covidassessments 集合
- `userId_1` (用户查询)
- `createdAt_-1` (时间排序)
- `riskLevel_1` (风险筛选)
- `severity_1` (严重程度筛选)

## 使用建议

1. **定期检查**: 使用分析工具检查数据库结构
2. **性能监控**: 关注查询性能，必要时调整索引
3. **数据清理**: 定期清理过期或无用数据
4. **备份策略**: 在执行清理操作前备份重要数据
5. **扩展规划**: 新增功能时先评估是否需要新集合

## 迁移说明

如果需要从其他数据库迁移到 `healthcare_local`:

1. 备份原数据库数据
2. 运行 `init-complete-database.js` 创建新结构
3. 根据需要导入原有数据
4. 验证数据完整性
5. 更新应用配置

## 注意事项

- 删除集合操作不可逆，请谨慎操作
- 建议在测试环境先验证所有操作
- 保持数据库结构与API接口的一致性
- 定期审查和优化数据库结构 