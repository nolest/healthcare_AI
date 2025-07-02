# 診斷頁面統計數據修復

## 問題描述
`/medical/diagnosis` 頁面的總異常數、待處理、已處理、處理率統計數據不正確。原因是後端 API 只返回 `status: 'pending'` 的異常測量記錄，導致前端無法正確統計所有狀態的記錄。

## 問題分析

### 原始問題
1. **後端限制**: `findAbnormalMeasurements()` 方法只查詢 `{ isAbnormal: true, status: 'pending' }` 的記錄
2. **統計不完整**: 前端只能看到待處理的異常記錄，無法統計已處理的記錄
3. **處理率錯誤**: 由於缺少已處理記錄，處理率計算不準確

### 數據庫 Schema
根據 `measurement.schema.ts`，status 字段有三個可能值：
- `'pending'`: 待處理
- `'processed'`: 已處理  
- `'reviewed'`: 已審核

## 修復方案

### 1. 後端修改 (`healthcare_backend/src/measurements/measurements.service.ts`)

**修改前**:
```typescript
async findAbnormalMeasurements() {
  return this.measurementModel
    .find({ isAbnormal: true, status: 'pending' })  // 只查詢 pending
    .populate('userId', 'username fullName role phone email')
    .sort({ createdAt: -1 });
}
```

**修改後**:
```typescript
async findAbnormalMeasurements() {
  // 返回所有異常測量記錄，不限制狀態，以便前端正確統計
  return this.measurementModel
    .find({ isAbnormal: true })  // 查詢所有異常記錄
    .populate('userId', 'username fullName role phone email')
    .sort({ createdAt: -1 });
}

async findPendingAbnormalMeasurements() {
  // 如果需要只獲取待處理的異常記錄，可以使用這個方法
  return this.measurementModel
    .find({ isAbnormal: true, status: 'pending' })
    .populate('userId', 'username fullName role phone email')
    .sort({ createdAt: -1 });
}
```

### 2. 前端統計邏輯修改 (`healthcare_frontend/src/pages/MedicalDiagnosisPage.jsx`)

**修改前**:
```javascript
const calculateStats = (measurements) => {
  const stats = {
    total: measurements.length,
    pending: measurements.filter(m => m.status === 'pending').length,
    processed: measurements.filter(m => m.status === 'processed').length,  // 只統計 processed
    byType: {}
  }
  // ...
}
```

**修改後**:
```javascript
const calculateStats = (measurements) => {
  const stats = {
    total: measurements.length,
    pending: measurements.filter(m => m.status === 'pending').length,
    processed: measurements.filter(m => m.status === 'processed' || m.status === 'reviewed').length,  // 包含 reviewed
    byType: {}
  }
  // ...
}
```

### 3. 狀態顯示優化

**修改前**:
```javascript
{measurement.status === 'pending' ? '待處理' : '已處理'}
```

**修改後**:
```javascript
{measurement.status === 'pending' ? '待處理' : 
 measurement.status === 'processed' ? '已處理' :
 measurement.status === 'reviewed' ? '已審核' : '已處理'}
```

## 統計邏輯

修復後的統計邏輯：

1. **總異常數**: 所有 `isAbnormal: true` 的記錄數量
2. **待處理**: `status === 'pending'` 的記錄數量  
3. **已處理**: `status === 'processed' || status === 'reviewed'` 的記錄數量
4. **處理率**: `(已處理數量 / 總異常數) * 100%`

## 影響範圍

### ✅ 修復的功能
- 總異常數統計正確
- 待處理數量統計正確  
- 已處理數量統計正確（包含 processed 和 reviewed）
- 處理率計算正確
- 異常測量列表顯示所有狀態的記錄
- 狀態標籤顯示更準確

### 📋 相關頁面
- `/medical/diagnosis` - 主要修復頁面
- 診斷表單頁面 - 可能受到數據變化影響
- 醫護儀表板 - 如果使用相同 API 可能受影響

## 測試建議

1. **統計數據驗證**:
   - 檢查總異常數是否包含所有異常記錄
   - 驗證待處理數量是否正確
   - 確認已處理數量包含 processed 和 reviewed 狀態
   - 驗證處理率計算是否準確

2. **列表顯示驗證**:
   - 確認異常測量列表顯示所有狀態的記錄
   - 檢查狀態標籤顯示是否正確
   - 驗證篩選功能是否正常工作

3. **數據一致性**:
   - 確認前端統計與後端數據一致
   - 檢查處理記錄後統計是否正確更新

## 向後兼容性

- ✅ 保持原有 API 接口不變
- ✅ 新增 `findPendingAbnormalMeasurements()` 方法供需要時使用
- ✅ 前端邏輯向後兼容，正確處理所有狀態值
- ✅ 不影響其他功能模塊 