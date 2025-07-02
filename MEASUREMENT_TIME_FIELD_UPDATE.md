# 測量時間字段更新 - 使用 createdAt 字段

## 問題描述
medical/diagnosis 頁面中的異常測量列表顯示測量時間時，使用的是 `timestamp` 字段而不是數據庫中的 `createdAt` 字段。根據數據庫 schema，測量記錄應該優先使用 `createdAt` 字段來顯示創建時間。

## 修改內容

### 1. MedicalDiagnosisPage.jsx
- **時間篩選邏輯**: 將 `measurement.timestamp` 改為 `measurement.createdAt || measurement.timestamp`
- **表格顯示**: 將測量時間顯示從 `measurement.timestamp` 改為 `measurement.createdAt || measurement.timestamp`

### 2. PatientDetailPage.jsx  
- **時間顯示**: 將 `measurement.timestamp` 改為 `measurement.createdAt || measurement.timestamp`
- **排序邏輯**: 更新排序邏輯使用 `createdAt` 字段優先

### 3. MedicalPatientsPage.jsx
- **最後測量時間計算**: 更新統計邏輯使用 `createdAt` 字段優先
- **今日測量統計**: 更新篩選邏輯使用 `createdAt` 字段優先
- **排序邏輯**: 更新排序邏輯使用 `createdAt` 字段優先

### 4. MedicalDiagnosisFormPage.jsx
- **歷史記錄排序**: 更新排序邏輯使用 `createdAt` 字段優先
- **時間顯示**: 確保時間顯示使用 `createdAt` 字段優先

## 修改後的邏輯
所有時間相關的操作現在都使用以下邏輯：
```javascript
// 優先使用 createdAt，如果沒有則使用 timestamp
measurement.createdAt || measurement.timestamp
```

## 數據庫 Schema 參考
根據 `healthcare_backend/src/schemas/measurement.schema.ts`：
```typescript
@Schema({ timestamps: true })
export class Measurement {
  // ... 其他字段
  
  @Prop()
  measurementTime: Date;  // 用戶指定的測量時間
  
  // timestamps: true 會自動添加：
  // createdAt: Date    // 記錄創建時間 - 應該優先使用
  // updatedAt: Date    // 記錄更新時間
}
```

## 影響範圍
- ✅ 異常測量列表的時間顯示
- ✅ 測量記錄的時間篩選
- ✅ 患者詳情頁面的測量時間
- ✅ 患者管理頁面的統計邏輯
- ✅ 診斷表單頁面的歷史記錄

## 測試建議
1. 檢查 medical/diagnosis 頁面異常測量列表的時間顯示
2. 驗證時間篩選功能是否正常工作
3. 確認患者詳情頁面的測量時間顯示正確
4. 檢查患者管理頁面的統計數據是否準確
5. 驗證診斷表單頁面的歷史記錄排序是否正確

## 向後兼容性
通過使用 `createdAt || timestamp` 的邏輯，確保了：
- 新數據優先使用 `createdAt` 字段
- 舊數據如果沒有 `createdAt` 則使用 `timestamp` 字段
- 不會破壞現有功能 