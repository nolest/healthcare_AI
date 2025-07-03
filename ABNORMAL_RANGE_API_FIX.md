# 異常範圍API修復報告

## 🐛 問題描述

保存異常範圍設定時出現以下API驗證錯誤：

```
儲存異常範圍設定失敗: Error: property measurementType should not exist,
normalRange.systolic.property min should not exist,
normalRange.systolic.property max should not exist,
normalRange.diastolic.property min should not exist,
normalRange.diastolic.property max should not exist
```

## 🔍 問題分析

### 1. 後端DTO驗證問題
- `RangeValue` 類缺少 `@IsNumber()` 驗證裝飾器
- 導致 `min` 和 `max` 屬性被認為是無效的

### 2. API數據格式問題
- 更新操作時不應包含 `measurementType` 字段
- 參數名稱映射不正確（前端 `rate` vs 後端 `heartRate`）

### 3. 數據類型問題
- 前端發送的數值可能是字符串，需要轉換為數字

## 🔧 修復方案

### 1. 後端DTO修復
**文件**: `healthcare_backend/src/dto/abnormal-range.dto.ts`

```typescript
// 修復前
class RangeValue {
  min: number;
  max: number;
}

// 修復後
class RangeValue {
  @IsNumber()
  min: number;

  @IsNumber()
  max: number;
}
```

### 2. 前端數據格式修復
**文件**: `healthcare_frontend/src/pages/AbnormalDataSettingsPage.jsx`

#### 參數名稱映射
```javascript
const parameterMapping = {
  'systolic': 'systolic',
  'diastolic': 'diastolic',
  'rate': 'heartRate',              // 修復：rate -> heartRate
  'temperature': 'temperature',
  'oxygen_saturation': 'oxygenSaturation'  // 修復：oxygen_saturation -> oxygenSaturation
}
```

#### 創建和更新數據分離
```javascript
// 更新時不包含 measurementType
if (config.apiData && config.apiData._id) {
  const updateData = {
    name: config.name,
    normalRange,
    unit: config.unit,
    description: `${config.name}的異常範圍設定`,
    isActive: true
  }
  await apiService.updateAbnormalRange(config.apiData._id, updateData)
} else {
  // 創建時包含 measurementType
  const createData = {
    measurementType,
    name: config.name,
    normalRange,
    unit: config.unit,
    description: `${config.name}的異常範圍設定`,
    isActive: true
  }
  await apiService.createAbnormalRange(createData)
}
```

#### 數據類型轉換
```javascript
const rangeData = {
  min: parseFloat(paramConfig.boundaries.low_max),
  max: parseFloat(paramConfig.boundaries.normal_max)
}
```

### 3. 調試日誌增強
- 添加詳細的控制台日誌
- 改善錯誤消息顯示
- 自動重新載入設定以確保同步

## 📋 測試步驟

1. **重新啟動後端服務**
   ```bash
   cd healthcare_backend
   npm run start:dev
   ```

2. **重新啟動前端服務**
   ```bash
   cd healthcare_frontend
   npm run dev
   ```

3. **訪問異常範圍設定頁面**
   - 登錄醫護人員賬戶
   - 導航到 `/medical/abnormal-settings`

4. **測試保存功能**
   - 修改任意分界點數值
   - 點擊「儲存所有設定」按鈕
   - 檢查控制台日誌和成功消息

## 🎯 預期結果

- ✅ 保存操作成功完成
- ✅ 顯示成功消息：「異常範圍設定已成功儲存！」
- ✅ 控制台顯示詳細的處理日誌
- ✅ 設定自動重新載入以確保同步

## 📝 相關文件

### 修改的文件
- `healthcare_backend/src/dto/abnormal-range.dto.ts` - 添加數據驗證
- `healthcare_frontend/src/pages/AbnormalDataSettingsPage.jsx` - 修復數據格式和API調用

### 測試文件
- `test_abnormal_ranges_api.js` - API測試腳本（可選）

## 🔄 後續改進

1. **API文檔更新** - 更新API文檔以反映正確的數據格式
2. **單元測試** - 添加異常範圍API的單元測試
3. **前端驗證** - 添加前端數據驗證以防止無效數據提交
4. **錯誤處理** - 改善錯誤處理和用戶反饋

---

**修復時間**: 2025-01-03
**修復者**: AI Assistant
**狀態**: ✅ 完成 