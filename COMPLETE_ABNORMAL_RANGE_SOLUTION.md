# 完整異常範圍系統解決方案

## 問題分析

您提到的問題非常重要：
1. **只保存了normalRange** - 前端只發送正常範圍到後端
2. **缺少完整的異常範圍** - 沒有保存嚴重偏低、偏低、偏高、嚴重偏高、危急等級別
3. **異常檢測不完整** - 無法區分異常的嚴重程度

## 解決方案概述

我已經實施了完整的解決方案，包括：

### 1. 擴展數據庫Schema

**abnormal-range.schema.ts** - 添加完整異常範圍支持：
```typescript
@Prop({ type: Object })
abnormalRanges?: {
  // 每個測量參數的異常範圍
  oxygenSaturation?: {
    critical?: { min: number; max: number };
    severeHigh?: { min: number; max: number };
    high?: { min: number; max: number };
    low?: { min: number; max: number };
    severeLow?: { min: number; max: number };
  };
  // ... 其他參數
};
```

**measurement.schema.ts** - 添加嚴重程度字段：
```typescript
@Prop({ default: 'normal', enum: ['normal', 'low', 'high', 'severeLow', 'severeHigh', 'critical'] })
severity: string; // 异常严重程度
```

### 2. 更新DTO驗證

**abnormal-range.dto.ts** - 添加完整的異常範圍DTO：
```typescript
class AbnormalLevelsDto {
  critical?: RangeValue;
  severeHigh?: RangeValue;
  high?: RangeValue;
  low?: RangeValue;
  severeLow?: RangeValue;
}

class AbnormalRangesDto {
  oxygenSaturation?: AbnormalLevelsDto;
  // ... 其他參數
}
```

### 3. 前端完整範圍生成

**前端邏輯** - 從分界點生成完整異常範圍：
```javascript
const abnormalRanges = {}

Object.entries(config.parameters).forEach(([parameter, paramConfig]) => {
  const boundaries = paramConfig.boundaries
  const absoluteMin = paramConfig.absoluteMin || 0
  const absoluteMax = paramConfig.absoluteMax || 1000
  
  // 異常範圍
  const abnormalRangeData = {
    severeLow: { min: absoluteMin, max: parseFloat(boundaries.severe_low_max) },
    low: { min: parseFloat(boundaries.severe_low_max), max: parseFloat(boundaries.low_max) },
    high: { min: parseFloat(boundaries.normal_max), max: parseFloat(boundaries.high_max) },
    severeHigh: { min: parseFloat(boundaries.high_max), max: parseFloat(boundaries.severe_high_max) },
    critical: { min: parseFloat(boundaries.severe_high_max), max: absoluteMax }
  }
  abnormalRanges[backendParamName] = abnormalRangeData
})
```

### 4. 智能異常檢測

**後端異常檢測** - 根據完整範圍判斷嚴重程度：
```typescript
async checkMeasurementAbnormal(measurementType: string, values: any): Promise<{ 
  isAbnormal: boolean; 
  reasons: string[]; 
  severity?: string 
}> {
  // 檢查值落在哪個異常範圍內
  const getSeverityLevel = (value: number, paramName: string, abnormalRanges: any) => {
    if (ranges.critical && value >= ranges.critical.min && value <= ranges.critical.max) {
      return 'critical';
    }
    if (ranges.severeHigh && value >= ranges.severeHigh.min && value <= ranges.severeHigh.max) {
      return 'severeHigh';
    }
    // ... 其他級別檢查
    return 'normal';
  };
}
```

## 完整的數據流程

### 1. 前端設定保存
```
用戶設定分界點 → 生成6個完整範圍 → 發送到後端 → 保存normalRange + abnormalRanges
```

### 2. 測量值檢測
```
患者提交測量 → 檢查正常範圍 → 如果異常，檢查具體級別 → 保存結果 + 嚴重程度
```

### 3. 醫護查看
```
醫護查看異常測量 → 顯示具體嚴重程度 → 優先處理高嚴重程度
```

## 血氧飽和度完整範例

### 前端分界點設定：
- 嚴重偏低上限: 85%
- 偏低上限: 95%  
- 正常上限: 100%
- 偏高上限: 100%
- 嚴重偏高上限: 100%

### 後端保存的完整範圍：
```json
{
  "normalRange": {
    "oxygenSaturation": { "min": 95, "max": 100 }
  },
  "abnormalRanges": {
    "oxygenSaturation": {
      "severeLow": { "min": 0, "max": 85 },
      "low": { "min": 85, "max": 95 },
      "high": { "min": 100, "max": 100 },
      "severeHigh": { "min": 100, "max": 100 },
      "critical": { "min": 100, "max": 100 }
    }
  }
}
```

### 異常檢測結果：
- 97% → 正常，severity: "normal"
- 92% → 異常，severity: "low"，原因: "血氧飽和度異常 (92%, 嚴重程度: low)"
- 80% → 異常，severity: "severeLow"，原因: "血氧飽和度異常 (80%, 嚴重程度: severeLow)"

## 修改的檔案清單

### 後端檔案
1. `src/schemas/abnormal-range.schema.ts` - 添加abnormalRanges字段
2. `src/schemas/measurement.schema.ts` - 添加severity字段
3. `src/dto/abnormal-range.dto.ts` - 添加異常範圍DTO
4. `src/abnormal-ranges/abnormal-ranges.service.ts` - 智能異常檢測
5. `src/measurements/measurements.service.ts` - 嚴重程度處理

### 前端檔案
1. `src/pages/AbnormalDataSettingsPage.jsx` - 完整範圍生成和保存

### 測試檔案
1. `test_full_abnormal_ranges.js` - 完整功能測試

## 使用說明

### 1. 設定異常範圍
1. 訪問 `/medical/abnormal-settings` 頁面
2. 設定5個分界點數值
3. 系統自動生成6個完整範圍
4. 點擊保存，後端保存normalRange + abnormalRanges

### 2. 測量異常檢測
1. 患者提交測量值
2. 系統檢查是否在正常範圍內
3. 如果異常，確定具體嚴重程度
4. 保存結果包含severity字段

### 3. 醫護管理
1. 查看異常測量列表
2. 按嚴重程度排序（critical > severeHigh > severeeLow > high > low）
3. 優先處理高嚴重程度案例

## 技術特點

1. **完整性** - 保存6個完整的異常範圍級別
2. **智能性** - 自動判斷異常嚴重程度
3. **擴展性** - 支持所有測量類型（血壓、心率、體溫、血氧）
4. **一致性** - 前後端數據格式完全匹配
5. **用戶友好** - 醫護人員可以清楚看到異常嚴重程度

## 測試驗證

運行測試腳本驗證功能：
```bash
node test_full_abnormal_ranges.js
```

測試內容：
- 獲取現有設定
- 更新完整異常範圍
- 驗證保存結果
- 測試異常檢測功能
- 確認嚴重程度判斷

現在系統已經支持完整的異常範圍管理，不再僅僅保存normalRange，而是包含所有級別的異常範圍和智能的嚴重程度判斷！ 