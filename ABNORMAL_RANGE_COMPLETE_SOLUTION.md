# 異常範圍設定完整解決方案

## 問題總結

1. **血氧飽和度設定保存失敗** - 修改後刷新頁面仍然是舊值
2. **abnormalranges表沒有記錄** - 數據沒有正確保存到數據庫
3. **測量值異常判斷邏輯缺失** - 需要根據abnormalranges來判斷測量值是否異常

## 解決方案

### 1. 修復前端參數映射問題

**問題**: 前端和後端的參數名不匹配
- 前端: `oxygen_saturation`
- 後端: `oxygenSaturation`

**解決**: 在前端添加雙向參數映射

```javascript
// 前端到後端映射
const parameterMapping = {
  'systolic': 'systolic',
  'diastolic': 'diastolic',
  'rate': 'heartRate',
  'temperature': 'temperature',
  'oxygen_saturation': 'oxygenSaturation'
}

// 後端到前端映射
const backendToFrontendMapping = {
  'systolic': 'systolic',
  'diastolic': 'diastolic',
  'heartRate': 'rate',
  'temperature': 'temperature',
  'oxygenSaturation': 'oxygen_saturation'
}
```

### 2. 修復後端創建/更新邏輯

**問題**: 創建異常範圍時沒有檢查是否已存在相同類型的記錄

**解決**: 在創建時檢查是否已存在，如果存在則更新

```typescript
async create(createAbnormalRangeDto: CreateAbnormalRangeDto, userId: string) {
  console.log('🎯 創建異常範圍:', createAbnormalRangeDto);
  
  // 檢查是否已存在相同類型的記錄
  const existing = await this.abnormalRangeModel.findOne({ 
    measurementType: createAbnormalRangeDto.measurementType 
  });
  
  if (existing) {
    console.log('📝 記錄已存在，執行更新:', existing._id);
    return this.update(existing._id.toString(), createAbnormalRangeDto, userId);
  }
  
  // 創建新記錄
  const abnormalRange = new this.abnormalRangeModel({
    ...createAbnormalRangeDto,
    lastModifiedBy: userId,
    lastModifiedAt: new Date()
  });
  
  const saved = await abnormalRange.save();
  console.log('✅ 創建成功:', saved);
  return saved;
}
```

### 3. 集成異常判斷邏輯

**已實現**: MeasurementsService已經集成了AbnormalRangesService

```typescript
async create(userId: string, createMeasurementDto: CreateMeasurementDto) {
  // 使用异常值服务检测异常数据
  const abnormalResult = await this.detectAbnormalValues(createMeasurementDto);
  
  const measurement = new this.measurementModel({
    userId,
    ...createMeasurementDto,
    isAbnormal: abnormalResult.isAbnormal,
    abnormalReasons: abnormalResult.reasons,
    measurementTime: createMeasurementDto.measurementTime || new Date(),
  });

  const savedMeasurement = await measurement.save();
  
  // 返回包含异常检测结果的数据
  return {
    ...savedMeasurement.toObject(),
    abnormalResult
  };
}
```

### 4. 修復血氧飽和度預設值

**問題**: 前端預設值與數據庫中的值不匹配

**解決**: 調整前端預設值以匹配數據庫
- 數據庫: `oxygenSaturation: { min: 95, max: 100 }`
- 前端: `low_max: 95, normal_max: 100`

## 數據庫狀態

當前abnormalranges表中有5條記錄：

1. **blood_pressure** - 血壓
   - systolic: 90-140 mmHg
   - diastolic: 60-90 mmHg

2. **heart_rate** - 心率
   - heartRate: 60-100 bpm

3. **temperature** - 體溫
   - temperature: 36.1-37.2°C

4. **oxygen_saturation** - 血氧飽和度
   - oxygenSaturation: 95-100%

5. **blood_glucose** - 血糖
   - bloodGlucose: 70-140 mg/dL

## 異常判斷邏輯

當患者提交測量值時，系統會：

1. **檢查血壓**: 收縮壓和舒張壓是否在正常範圍內
2. **檢查心率**: 是否在60-100 bpm範圍內
3. **檢查體溫**: 是否在36.1-37.2°C範圍內
4. **檢查血氧**: 是否在95-100%範圍內
5. **生成異常原因**: 具體說明哪個指標異常及數值

## 測試驗證

創建了測試腳本 `test_measurement_abnormal_detection.js` 來驗證：

- 正常值測量 → isAbnormal: false
- 異常值測量 → isAbnormal: true + 詳細原因
- 綜合異常測量 → 多項異常原因

## 前端功能

1. **分界點設定**: 用戶可以設定5個關鍵分界點
2. **實時預覽**: 顯示6個完整範圍區間
3. **數據驗證**: 檢查分界點順序是否正確
4. **API同步**: 正確保存和載入異常範圍設定

## 完整的測量流程

1. **患者提交測量** → `/api/measurements` POST
2. **異常檢測** → AbnormalRangesService.checkMeasurementAbnormal()
3. **保存結果** → 包含 isAbnormal 和 abnormalReasons
4. **醫護人員查看** → 可以看到異常測量和具體原因
5. **統計分析** → 異常測量數量和類型統計

## 修改的檔案

### 後端
1. `healthcare_backend/src/abnormal-ranges/abnormal-ranges.service.ts`
   - 添加創建時的重複檢查邏輯
   - 添加調試日誌

2. `healthcare_backend/src/measurements/measurements.service.ts`
   - 已集成異常判斷邏輯（無需修改）

### 前端
1. `healthcare_frontend/src/pages/AbnormalDataSettingsPage.jsx`
   - 修復參數映射問題
   - 調整血氧飽和度預設值
   - 添加詳細的調試日誌

### 測試工具
1. `check_abnormal_ranges.js` - 檢查數據庫記錄
2. `test_measurement_abnormal_detection.js` - 測試異常檢測功能

## 使用說明

1. **設定異常範圍**: 訪問 `/medical/abnormal-settings` 頁面
2. **修改分界點**: 輸入5個關鍵分界點數值
3. **保存設定**: 點擊保存按鈕，系統會自動創建或更新記錄
4. **測量提交**: 患者提交測量時會自動檢測異常
5. **查看結果**: 醫護人員可在管理頁面查看異常測量

## 注意事項

1. **參數名映射**: 確保前後端參數名正確映射
2. **數據類型**: 所有數值都使用 parseFloat 轉換
3. **錯誤處理**: 添加了詳細的錯誤日誌和用戶提示
4. **權限控制**: 只有醫護人員可以修改異常範圍設定 