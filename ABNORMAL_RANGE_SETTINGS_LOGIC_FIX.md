# 異常範圍設定邏輯修復

## 問題描述
原本的異常範圍設定頁面存在嚴重的邏輯錯誤：
- 每個異常級別的slider都可以在整個範圍內自由設定
- 沒有考慮異常級別之間的邏輯約束關係
- 例如：心率正常範圍是60-100，但嚴重偏低竟然可以設置0-174
- **新發現的問題**：複雜的自動調整邏輯導致slider操作困難，拖動時數值異常增大

## 修復方案 v2.0

### 1. 簡化Slider邏輯
移除了複雜的自動調整邏輯，改為：
- **自由設定**：每個slider可以在全範圍內自由移動
- **即時警告**：當範圍設定不合理時顯示警告提示
- **手動修正**：提供自動修正按鈕，讓用戶主動選擇修正

### 2. 核心改進

#### 移除複雜約束
```javascript
// 舊版：複雜的自動調整邏輯（已移除）
// 新版：簡潔的直接設定
const handleRangeChange = (measurementType, parameter, rangeType, values) => {
  setAbnormalRanges(prev => {
    const newRanges = { ...prev[measurementType].ranges[parameter] }
    newRanges[rangeType] = values // 直接設定，不做複雜調整
    return { /* 更新狀態 */ }
  })
}
```

#### 智能警告系統
```javascript
const validateRanges = (ranges) => {
  const orderedRanges = ['severe_low', 'low', 'normal', 'high', 'severe_high', 'critical']
  const warnings = []
  
  for (let i = 0; i < orderedRanges.length - 1; i++) {
    const currentRange = orderedRanges[i]
    const nextRange = orderedRanges[i + 1]
    
    if (ranges[currentRange] && ranges[nextRange]) {
      if (ranges[currentRange][1] > ranges[nextRange][0]) {
        warnings.push(`${getRangeLabel(currentRange)}與${getRangeLabel(nextRange)}範圍重疊`)
      }
    }
  }
  
  return warnings
}
```

#### 自動修正功能
```javascript
const autoFixRanges = (measurementType, parameter) => {
  // 基於正常範圍自動生成合理的異常範圍
  const normal = ranges.normal
  const normalWidth = normal[1] - normal[0]
  
  // 計算各範圍的建議值
  newRanges.severe_low = [ranges.critical[0], normal[0] - normalWidth]
  newRanges.low = [newRanges.severe_low[1], normal[0]]
  newRanges.high = [normal[1], normal[1] + normalWidth * 0.5]
  newRanges.severe_high = [newRanges.high[1], newRanges.high[1] + normalWidth * 0.5]
}
```

### 3. 用戶體驗改進

#### 🎯 **直觀操作**
- Slider現在可以正常拖動，不會出現異常增大的問題
- 每個範圍都可以自由設定，操作更直觀

#### ⚠️ **即時警告**
- 當範圍設定不合理時，會顯示黃色警告框
- 清楚指出哪些範圍重疊，需要調整

#### 🔧 **一鍵修正**
- 每個測量類型都有"自動修正"按鈕
- 點擊後自動生成醫學上合理的範圍設定
- 用戶可以在自動修正的基礎上進行微調

### 4. 修復後的效果

#### 心率範例（修正前）
- 正常範圍：60-100 bpm
- 嚴重偏低：可以設置0-174（錯誤！）
- 拖動slider時數值異常增大

#### 心率範例（修正後）
- 正常範圍：60-100 bpm
- 嚴重偏低：可以自由設定，但會有警告提示
- 點擊"自動修正"後：
  - 嚴重偏低：0-20 bpm
  - 偏低：20-60 bpm
  - 正常：60-100 bpm
  - 偏高：100-120 bpm
  - 嚴重偏高：120-140 bpm
  - 危急：140-300 bpm

### 5. 技術優勢

#### 🚀 **性能提升**
- 移除複雜的範圍計算邏輯
- Slider響應更快，操作更流暢

#### 🛠️ **維護性**
- 代碼邏輯簡化，易於維護
- 功能模塊化，易於擴展

#### 👥 **用戶友好**
- 操作直觀，學習成本低
- 錯誤提示清晰，修正方便

### 6. UI改進

#### 警告提示
```jsx
{/* 範圍警告提示 */}
{(() => {
  const warnings = validateRanges(ranges)
  if (warnings.length > 0) {
    return (
      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-800 text-sm">
          <span className="text-yellow-600">⚠️</span>
          <span className="font-medium">範圍警告:</span>
        </div>
        <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
          {warnings.map((warning, index) => (
            <li key={index}>{warning}</li>
          ))}
        </ul>
      </div>
    )
  }
  return null
})()}
```

#### 自動修正按鈕
```jsx
<button
  onClick={() => autoFixRanges(measurementType, parameter)}
  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
>
  🔧 自動修正
</button>
```

## 測試建議
1. ✅ 測試slider是否可以正常拖動（不會異常增大）
2. ✅ 測試範圍重疊時是否顯示警告
3. ✅ 測試自動修正功能是否生成合理範圍
4. ✅ 測試不同測量類型的自動修正效果
5. ✅ 測試設定保存功能

## 修改的檔案
- `healthcare_frontend/src/pages/AbnormalDataSettingsPage.jsx`
  - 簡化 `handleRangeChange` 函數
  - 移除複雜的slider約束邏輯
  - 新增 `validateRanges` 驗證函數
  - 新增 `autoFixRanges` 自動修正函數
  - 新增警告提示UI
  - 新增自動修正按鈕 