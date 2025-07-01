# COVID/流感业务模块分离实现

## 背景说明

根据业务需求，COVID/流感评估与生命体征测量是两个独立的业务模块：

1. **生命体征测量**：记录血压、心率、体温、血氧等生理数据，异常时需要医护诊断
2. **COVID/流感评估**：症状评估和风险分析，所有评估结果都需要医护诊断（不仅仅是异常情况）

两个模块有各自的历史记录页面和独立的诊断系统。

## 实现概述

### 前端实现

#### 新增页面
- `/patient/covid-assessment/history` - COVID/流感评估历史页面
- 功能完整的历史记录展示，包括：
  - 统计概览（总评估次数、高风险评估、近期状态）
  - 详细的评估记录列表
  - 风险等级、症状、建议等完整信息

#### 页面路由配置
```jsx
// AppRouter.jsx 新增路由
<Route path="/patient/covid-assessment/history" element={<PatientCovidAssessmentHistoryPage />} />
```

#### 统一Header设计
- 使用PatientHeader组件保持一致的设计风格
- 配置：`title="COVID/流感評估歷史"`, `icon={Shield}`, `backPath="/patient/covid-assessment"`

#### 导航优化
- COVID评估主页面添加"查看完整歷史"按钮
- 与生命体征测量页面的"查看歷史"按钮保持设计一致

### 后端实现

#### 新数据模型

**CovidDiagnosis Schema** (`covid-diagnosis.schema.ts`)
```typescript
class CovidDiagnosis {
  patientId: Types.ObjectId;           // 患者ID
  doctorId: Types.ObjectId;            // 医生ID
  assessmentId: Types.ObjectId;        // COVID评估ID（关联）
  diagnosisType: string;               // 诊断类型：'covid', 'flu', 'other'
  diagnosis: string;                   // 诊断结果
  recommendation: string;              // 医生建议
  treatment: string;                   // 治疗方案
  isolationDays: number;              // 隔离天数
  testingRecommendation: string;       // 检测建议
  returnToWorkDate: Date;             // 复工日期
  riskLevel: string;                  // 医生评估风险等级
  urgency: string;                    // 紧急程度
  requiresHospitalization: boolean;    // 是否需要住院
  medicationPrescription: string;      // 药物处方
  monitoringInstructions: string;      // 监测指示
  status: string;                     // 诊断状态
}
```

#### 完整的服务层

**CovidDiagnosesService** (`covid-diagnoses.service.ts`)
- `create()` - 创建COVID诊断
- `findByPatient()` - 获取患者的COVID诊断
- `findByDoctor()` - 获取医生的COVID诊断
- `getAssessmentsNeedingDiagnosis()` - 获取需要诊断的评估（所有评估都需要）
- `getStatistics()` - 获取统计数据

#### API接口

**REST API端点** (`covid-diagnoses.controller.ts`)
```
POST   /covid-diagnoses                    - 创建诊断
GET    /covid-diagnoses                    - 获取所有诊断
GET    /covid-diagnoses/pending            - 获取待处理诊断
GET    /covid-diagnoses/patient/:id        - 获取患者诊断
GET    /covid-diagnoses/statistics         - 获取统计数据
GET    /covid-diagnoses/assessments-needing-diagnosis - 获取需要诊断的评估
```

#### 前端API服务

**新增API方法** (`api.js`)
```javascript
- createCovidDiagnosis()
- getPatientCovidDiagnoses()
- getCovidDiagnosisByAssessment()
- getCovidAssessmentsNeedingDiagnosis()
- 等完整的CRUD操作
```

## 业务逻辑差异

### 生命体征测量诊断
- **触发条件**：仅当测量值异常时需要诊断
- **关联对象**：Measurement（测量记录）
- **诊断重点**：医疗建议、治疗方案、复诊安排
- **数据表**：`diagnoses`

### COVID/流感评估诊断
- **触发条件**：所有评估结果都需要医护诊断（无论风险等级）
- **关联对象**：CovidAssessment（评估记录）
- **诊断重点**：隔离建议、检测要求、复工安排、用药指导
- **数据表**：`covid_diagnoses`

## 数据库设计

### 独立的数据表结构

1. **measurements** - 生命体征测量数据
2. **diagnoses** - 生命体征诊断（关联measurement）
3. **covid_assessments** - COVID/流感评估数据
4. **covid_diagnoses** - COVID/流感诊断（关联covid_assessment）

### 关联关系
```
患者 (users)
├── 生命体征测量 (measurements)
│   └── 异常测量诊断 (diagnoses)
└── COVID评估 (covid_assessments)
    └── 评估诊断 (covid_diagnoses)
```

## 用户体验优化

### 独立的历史记录
- 生命体征：`/patient/measurement/history`
- COVID评估：`/patient/covid-assessment/history`

### 统一的设计语言
- 两个历史页面使用相同的PatientHeader组件
- 保持一致的视觉风格和交互模式
- 统一的返回导航逻辑

### 智能的数据展示
- COVID评估历史：症状、风险等级、建议措施
- 生命体征历史：测量值、异常标记、趋势分析

## 医护端集成

### 诊断工作流
1. **生命体征诊断**：医护人员查看异常测量，提供诊断建议
2. **COVID评估诊断**：医护人员查看所有评估，提供专业指导

### 数据分析
- 分别统计两种业务的数据
- 独立的风险评估和趋势分析
- 不同的紧急程度处理流程

## 技术架构优势

### 模块化设计
- 清晰的业务边界分离
- 独立的数据模型和API
- 便于后续功能扩展

### 代码复用
- 共享PatientHeader组件
- 统一的API服务基础架构
- 一致的错误处理和状态管理

### 可维护性
- 独立的业务逻辑，便于维护
- 清晰的数据流向和依赖关系
- 模块化的测试策略

## 部署说明

### 数据库迁移
- 新增`covid_diagnoses`表
- 保持现有数据结构不变
- 向后兼容的API设计

### 前端部署
- 新增路由和页面组件
- API服务扩展
- 保持现有功能完整性

这种设计确保了两个业务模块的独立性，同时保持了系统整体的一致性和用户体验的连贯性。 