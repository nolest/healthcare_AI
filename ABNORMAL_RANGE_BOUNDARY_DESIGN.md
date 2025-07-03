# 異常範圍設定 - 分界點設計方案

## 🎯 設計理念

傳統的多slider設計存在以下問題：
- 操作複雜，容易出現邏輯錯誤
- 範圍重疊難以避免
- 用戶需要理解6個不同的範圍概念
- 設定過程繁瑣

**全新的分界點設計**解決了這些問題：
- 用戶只需設定5個關鍵分界點
- 系統自動生成6個完整範圍
- 邏輯錯誤即時檢測和提示
- 操作直觀，符合醫學思維

## 🏗️ 核心概念

### 分界點思維
醫護人員在實際工作中是這樣思考的：
1. "什麼數值以下算嚴重偏低？"
2. "什麼數值以下算偏低？"
3. "正常範圍的上限是多少？"
4. "什麼數值以上算偏高？"
5. "什麼數值以上算嚴重偏高？"

### 自動範圍生成
基於5個分界點自動生成6個範圍：

```
分界點設定：
- 嚴重偏低上限: 40
- 偏低上限: 60 (正常下限)
- 正常上限: 100
- 偏高上限: 120
- 嚴重偏高上限: 150

自動生成範圍：
- 嚴重偏低: [0, 40]
- 偏低: [40, 60]
- 正常: [60, 100]
- 偏高: [100, 120]
- 嚴重偏高: [120, 150]
- 危急: [150, 250]
```

## 🎨 交互設計

### 1. 分界點輸入
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {Object.entries(paramConfig.boundaries).map(([boundaryKey, value]) => (
    <div key={boundaryKey} className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        {getBoundaryLabel(boundaryKey)}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value}
          onChange={(e) => handleBoundaryChange(measurementType, parameter, boundaryKey, e.target.value)}
          step={measurementType === 'temperature' ? 0.1 : 1}
          min={paramConfig.absoluteMin}
          max={paramConfig.absoluteMax}
          className="w-20"
        />
        <span className="text-sm text-gray-500">{config.unit}</span>
      </div>
    </div>
  ))}
</div>
```

### 2. 即時範圍預覽
```jsx
<div className="bg-gray-50 rounded-lg p-4">
  <h5 className="text-sm font-medium text-gray-700 mb-3">生成的範圍預覽：</h5>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
    {Object.entries(ranges).map(([rangeType, values]) => (
      <div key={rangeType} className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getRangeColor(rangeType)}`}></div>
        <span className="text-gray-700">
          {getRangeLabel(rangeType)}: {values[0]}-{values[1]}
        </span>
      </div>
    ))}
  </div>
</div>
```

### 3. 智能驗證
```jsx
const validateBoundaries = (boundaries) => {
  const orderedKeys = ['severe_low_max', 'low_max', 'normal_max', 'high_max', 'severe_high_max']
  const errors = []
  
  for (let i = 0; i < orderedKeys.length - 1; i++) {
    const current = boundaries[orderedKeys[i]]
    const next = boundaries[orderedKeys[i + 1]]
    
    if (current >= next) {
      errors.push(`${getBoundaryLabel(orderedKeys[i])} 必須小於 ${getBoundaryLabel(orderedKeys[i + 1])}`)
    }
  }
  
  return errors
}
```

## 📊 各測量類型配置

### 心率 (Heart Rate)
```javascript
heart_rate: {
  parameters: {
    rate: {
      name: '心率',
      boundaries: {
        severe_low_max: 40,    // 嚴重心動過緩上限
        low_max: 60,           // 心動過緩上限 (正常下限)
        normal_max: 100,       // 正常上限 (心動過速下限)
        high_max: 120,         // 輕度心動過速上限
        severe_high_max: 150   // 中度心動過速上限 (嚴重心動過速下限)
      },
      absoluteMin: 0,
      absoluteMax: 250
    }
  }
}
```

**生成的範圍**：
- 嚴重心動過緩: 0-40 bpm
- 心動過緩: 40-60 bpm
- 正常: 60-100 bpm
- 輕度心動過速: 100-120 bpm
- 中度心動過速: 120-150 bpm
- 嚴重心動過速: 150-250 bpm

### 血壓 (Blood Pressure)
```javascript
blood_pressure: {
  parameters: {
    systolic: {
      name: '收縮壓',
      boundaries: {
        severe_low_max: 70,    // 嚴重低血壓上限
        low_max: 90,           // 低血壓上限 (正常下限)
        normal_max: 140,       // 正常上限 (高血壓下限)
        high_max: 160,         // 高血壓1期上限
        severe_high_max: 180   // 高血壓2期上限 (危象下限)
      },
      absoluteMin: 0,
      absoluteMax: 250
    },
    diastolic: { /* 類似配置 */ }
  }
}
```

### 體溫 (Temperature)
```javascript
temperature: {
  parameters: {
    temperature: {
      name: '體溫',
      boundaries: {
        severe_low_max: 35.0,  // 嚴重體溫過低上限
        low_max: 36.1,         // 體溫過低上限 (正常下限)
        normal_max: 37.2,      // 正常上限 (發熱下限)
        high_max: 38.3,        // 低熱上限
        severe_high_max: 39.1  // 中等熱度上限 (高熱下限)
      },
      absoluteMin: 30.0,
      absoluteMax: 45.0
    }
  }
}
```

### 血氧飽和度 (Oxygen Saturation)
```javascript
oxygen_saturation: {
  parameters: {
    oxygen_saturation: {
      name: '血氧飽和度',
      boundaries: {
        severe_low_max: 85,    // 嚴重缺氧上限
        low_max: 90,           // 中度缺氧上限
        normal_max: 95,        // 正常下限
        high_max: 100,         // 正常上限
        severe_high_max: 100   // 無意義（血氧不會超過100%）
      },
      absoluteMin: 0,
      absoluteMax: 100
    }
  }
}
```

## 🔧 核心功能

### 1. 分界點設定
- 用戶只需輸入5個關鍵數值
- 支援小數點精度（體溫）
- 自動範圍限制（absoluteMin/Max）

### 2. 自動範圍生成
```javascript
const generateRangesFromBoundaries = (boundaries, absoluteMin, absoluteMax) => {
  const ranges = {}
  
  ranges.severe_low = [absoluteMin, boundaries.severe_low_max]
  ranges.low = [boundaries.severe_low_max, boundaries.low_max]
  ranges.normal = [boundaries.low_max, boundaries.normal_max]
  ranges.high = [boundaries.normal_max, boundaries.high_max]
  ranges.severe_high = [boundaries.high_max, boundaries.severe_high_max]
  ranges.critical = [boundaries.severe_high_max, absoluteMax]
  
  return ranges
}
```

### 3. 即時驗證
- 檢查分界點順序是否正確
- 顯示具體的錯誤訊息
- 紅色警告框突出顯示問題

### 4. 視覺化預覽
- 彩色範圍條顯示完整範圍
- 即時更新預覽
- 範圍標籤和數值顯示

### 5. 重置功能
- 一鍵重置為醫學標準預設值
- 保留其他設定不變

## 🎯 用戶體驗優勢

### 1. 認知負擔低
- 只需理解5個分界點概念
- 符合醫學思維模式
- 避免複雜的範圍重疊問題

### 2. 操作簡單
- 直接輸入數值，無需拖拽
- 支援鍵盤輸入
- 即時反饋和驗證

### 3. 錯誤預防
- 自動檢測邏輯錯誤
- 清晰的錯誤提示
- 無法設定無效範圍

### 4. 視覺直觀
- 範圍條即時更新
- 顏色編碼清晰
- 數值預覽一目了然

## 📱 響應式設計

### 桌面端
- 3列網格佈局
- 完整的標籤和說明
- 大尺寸輸入框

### 平板端
- 2列網格佈局
- 適中的間距
- 觸控友好的輸入

### 手機端
- 單列佈局
- 緊湊的間距
- 大按鈕設計

## 🔄 與後端整合

### 資料轉換
分界點設定會轉換為標準的normalRange格式：
```javascript
normalRange: {
  [parameter]: {
    min: boundaries.low_max,        // 正常範圍下限
    max: boundaries.normal_max      // 正常範圍上限
  }
}
```

### API兼容性
- 保持與現有API的完全兼容
- 自動從normalRange推導分界點
- 支援增量更新

## 🎉 總結

這個全新的分界點設計方案：

✅ **解決了原有問題**：
- 消除了slider操作困難
- 避免了範圍重疊錯誤
- 簡化了用戶認知負擔

✅ **提供了更好的體驗**：
- 符合醫學思維模式
- 操作簡單直觀
- 即時驗證和預覽

✅ **保持了技術優勢**：
- 完全兼容現有API
- 響應式設計
- 專業的醫療界面

這種設計讓醫護人員能夠更快速、更準確地配置異常範圍，大大提升了系統的可用性和專業性。 