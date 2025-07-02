# COVID诊断页面历史记录隐藏功能

## 需求描述
当访问COVID诊断详情页面时，如果URL参数 `hasread=1`（表示已诊断状态），需要隐藏"患者COVID評估歷史記錄"部分。

**URL示例**：
```
/medical/covid-management/details?aid=68656acf36f72cbb0c72e07c&hasread=1
```

## 实现方案

### 1. 布局调整

**文件**：`healthcare_frontend/src/pages/CovidDiagnosisFormPage.jsx`

**修改前**：
```jsx
{/* 主要内容区域 - 左右布局 */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  
  {/* 患者COVID评估历史 - 左侧 */}
  <div>
    <Card>
      {/* 历史记录内容 */}
    </Card>
  </div>

  {/* COVID诊断表单/只读信息 - 右侧 */}
  <div>
    {/* 诊断表单内容 */}
  </div>
</div>
```

**修改后**：
```jsx
{/* 主要内容区域 - 根据hasread状态调整布局 */}
<div className={`grid gap-8 ${hasRead === '1' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
  
  {/* 患者COVID评估历史 - 左侧 - 只有当hasread不为1时才显示 */}
  {hasRead !== '1' && (
    <div>
      <Card>
        {/* 历史记录内容 */}
      </Card>
    </div>
  )}

  {/* COVID诊断表单/只读信息 - 右侧或全宽 */}
  <div>
    {/* 诊断表单内容 */}
  </div>
</div>
```

### 2. 关键改进点

1. **条件渲染**：
   - 使用 `{hasRead !== '1' && (...)}` 条件渲染历史记录部分
   - 只有当 `hasread` 参数不为 `'1'` 时才显示历史记录

2. **响应式布局调整**：
   - `hasread=1` 时：使用 `grid-cols-1`（单列布局）
   - `hasread≠1` 时：使用 `grid-cols-1 lg:grid-cols-2`（移动端单列，大屏双列）

3. **动态高度调整优化**：
   ```jsx
   useEffect(() => {
     // 如果hasread=1，历史记录被隐藏，不需要调整高度
     if (hasRead === '1') {
       return
     }
     
     // 原有的高度调整逻辑
     // ...
   }, [hasRead, ...])
   ```

### 3. 用户体验改进

**hasread=0（待诊断）时**：
- ✅ 显示患者COVID评估历史记录
- ✅ 左右双列布局
- ✅ 动态高度调整
- ✅ 可编辑的诊断表单

**hasread=1（已诊断）时**：
- ✅ 隐藏患者COVID评估历史记录
- ✅ 单列全宽布局
- ✅ 只读模式显示
- ✅ 更简洁的查看界面

## 实现效果

### 1. hasread=0 (待诊断状态)
```
┌─────────────────────────────────────────────────────────────┐
│                    患者COVID評估信息                          │
└─────────────────────────────────────────────────────────────┘
┌──────────────────────────┐ ┌──────────────────────────────┐
│   患者COVID評估歷史記錄    │ │     COVID診斷評估表單         │
│                          │ │                              │
│  - 历史记录1             │ │  - 诊断结果输入框             │
│  - 历史记录2             │ │  - 风险等级选择               │
│  - 历史记录3             │ │  - 治疗建议输入               │
│                          │ │  - 提交按钮                   │
└──────────────────────────┘ └──────────────────────────────┘
```

### 2. hasread=1 (已诊断状态)
```
┌─────────────────────────────────────────────────────────────┐
│                    患者COVID評估信息                          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                COVID診斷記錄查看                              │
│                                                             │
│  此COVID評估記錄已完成診斷                                    │
│  該記錄的狀態為「已處理」，診斷評估表單已隱藏                    │
│                                                             │
│  [返回列表]                                                  │
└─────────────────────────────────────────────────────────────┘
```

## 技术细节

### 1. URL参数获取
```jsx
const [searchParams] = useSearchParams()
const hasRead = searchParams.get('hasread')
```

### 2. 条件渲染逻辑
```jsx
{hasRead !== '1' && (
  // 历史记录组件
)}
```

### 3. CSS类名动态切换
```jsx
className={`grid gap-8 ${hasRead === '1' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}
```

## 测试验证

### 1. hasread=0 测试
访问：`/medical/covid-management/details?aid=xxx&hasread=0`
- ✅ 应该显示历史记录
- ✅ 双列布局
- ✅ 可编辑表单

### 2. hasread=1 测试
访问：`/medical/covid-management/details?aid=xxx&hasread=1`
- ✅ 应该隐藏历史记录
- ✅ 单列布局
- ✅ 只读模式

### 3. 无hasread参数测试
访问：`/medical/covid-management/details?aid=xxx`
- ✅ 应该显示历史记录（默认行为）
- ✅ 双列布局
- ✅ 可编辑表单

## 相关文件

- `healthcare_frontend/src/pages/CovidDiagnosisFormPage.jsx` - 主要修改文件
- 影响的URL路由：`/medical/covid-management/details`

这个修改提升了已诊断记录的查看体验，通过隐藏不必要的历史记录部分，让用户专注于当前记录的诊断结果。 