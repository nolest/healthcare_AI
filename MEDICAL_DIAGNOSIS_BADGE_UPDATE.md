# 醫護主頁診斷評估塊更新

## 問題描述
`/medical` 頁面的"診斷評估"塊需要顯示 measurement 表中待處理的數量，以便醫護人員快速了解需要診斷的異常測量記錄數量。

## 修改內容

### 文件：`healthcare_frontend/src/pages/MedicalStaffPage.jsx`

#### 1. 統計邏輯更新

**修改前**：
```javascript
// 只統計待處理患者數量
const patientMap = new Map()
measurements.forEach(measurement => {
  const patientId = measurement.userId._id
  if (!patientMap.has(patientId)) {
    patientMap.set(patientId, { pendingCount: 0 })
  }
  if (measurement.isAbnormal && measurement.status === 'pending') {
    patientMap.get(patientId).pendingCount++
  }
})
const pendingPatients = Array.from(patientMap.values()).filter(p => p.pendingCount > 0).length
```

**修改後**：
```javascript
// 同時統計待處理患者數量和待處理測量記錄數量
const patientMap = new Map()
let pendingMeasurements = 0 // 待處理的異常測量記錄數量

measurements.forEach(measurement => {
  const patientId = measurement.userId._id
  if (!patientMap.has(patientId)) {
    patientMap.set(patientId, { pendingCount: 0 })
  }
  if (measurement.isAbnormal && measurement.status === 'pending') {
    patientMap.get(patientId).pendingCount++
    pendingMeasurements++ // 統計待處理的異常測量記錄總數
  }
})
const pendingPatients = Array.from(patientMap.values()).filter(p => p.pendingCount > 0).length
```

#### 2. 狀態對象更新

**修改前**：
```javascript
setStats({
  totalDiagnoses: diagnoses.length,
  pendingPatients,
  highRiskPatients: covidStats?.highRiskCount || 0,
  totalAssessments: covidStats?.totalAssessments || 0,
  riskDistribution
})
```

**修改後**：
```javascript
setStats({
  totalDiagnoses: diagnoses.length,
  pendingPatients,
  pendingMeasurements, // 新增待處理測量記錄數量
  highRiskPatients: covidStats?.highRiskCount || 0,
  totalAssessments: covidStats?.totalAssessments || 0,
  riskDistribution
})
```

#### 3. 診斷評估塊配置更新

**修改前**：
```javascript
{
  title: '診斷評估',
  description: '進行患者診斷與治療建議',
  icon: FileText,
  color: 'text-green-600',  
  path: '/medical/diagnosis'
},
```

**修改後**：
```javascript
{
  title: '診斷評估',
  description: '進行患者診斷與治療建議',
  icon: FileText,
  color: 'text-green-600',  
  path: '/medical/diagnosis',
  badge: stats?.pendingMeasurements || null
},
```

## 功能說明

### 統計邏輯
- **待處理測量記錄數量**：統計所有 `isAbnormal: true` 且 `status: 'pending'` 的測量記錄總數
- **顯示位置**：在"診斷評估"塊的右上角顯示紅色徽章
- **動態更新**：當有新的異常測量記錄或記錄狀態改變時，數量會自動更新

### 徽章顯示
- **顯示條件**：當 `pendingMeasurements > 0` 時顯示
- **樣式**：紅色背景，白色文字，帶動畫效果
- **位置**：功能塊的右上角

## 使用場景

1. **醫護人員登錄**：可以立即看到需要診斷的異常測量記錄數量
2. **工作優先級**：根據數量判斷診斷工作的緊急程度
3. **快速導航**：點擊"診斷評估"塊直接進入診斷頁面處理待處理記錄

## 與其他功能的關係

### 數據來源
- 使用 `apiService.getAbnormalMeasurements()` API 獲取數據
- 該 API 現在返回所有異常測量記錄（包括各種狀態）

### 相關頁面
- `/medical/diagnosis`：診斷評估頁面，顯示詳細的異常測量列表
- 兩個頁面的數據保持一致性

## 測試建議

1. **數據驗證**：
   - 檢查徽章數量是否與診斷頁面的待處理記錄數量一致
   - 驗證處理記錄後徽章數量是否正確減少

2. **界面測試**：
   - 確認徽章只在有待處理記錄時顯示
   - 檢查徽章樣式和動畫效果是否正常

3. **功能測試**：
   - 點擊"診斷評估"塊是否正確跳轉
   - 處理異常記錄後返回主頁，徽章數量是否更新

## 效果預期

- ✅ 醫護人員可以快速了解待診斷的異常測量記錄數量
- ✅ 提高工作效率，優先處理緊急的診斷任務
- ✅ 界面更加直觀，重要信息一目了然
- ✅ 數據實時更新，保持信息準確性 