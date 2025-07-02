# COVID诊断页面"查看详情"按钮修复

## 问题描述
用户反馈 `/medical/covid-management/details` 页面中"患者COVID评估历史记录"的"查看详情"按钮点击没有反应。

## 问题分析

### 根本原因
`ConfirmDialog` 组件的属性不匹配导致确认对话框无法正常显示：

**错误使用**：
```jsx
<ConfirmDialog
  isOpen={confirmDialogOpen}  // 应该是 open
  onClose={cancelNavigation}  // 应该是 onCancel
  onConfirm={confirmNavigation}
  // 缺少 onOpenChange 属性
/>
```

**正确使用**：
```jsx
<ConfirmDialog
  open={confirmDialogOpen}
  onOpenChange={setConfirmDialogOpen}
  onCancel={cancelNavigation}
  onConfirm={confirmNavigation}
  type="warning"
/>
```

## 修复内容

### 文件
`healthcare_frontend/src/pages/CovidDiagnosisFormPage.jsx`

### 修复
1. `isOpen` → `open`
2. `onClose` → `onCancel`
3. 添加 `onOpenChange={setConfirmDialogOpen}`
4. 添加 `type="warning"`

## 功能说明

点击"查看详情"按钮的完整流程：
1. 检查表单是否有未保存数据
2. 有数据：显示确认对话框
3. 没有数据：直接导航到新页面
4. 在新标签页打开COVID详情页面

## 测试验证

修复后需要验证：
- 点击按钮有反应
- 确认对话框正常显示和关闭
- 页面导航正常工作 