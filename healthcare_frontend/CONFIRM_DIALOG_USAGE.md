# ConfirmDialog 通用确认对话框组件使用指南

## 组件特性

ConfirmDialog 是一个通用的确认对话框组件，支持多种类型和样式：

- **警告 (alert)**: 红色主题，用于危险操作确认
- **警告 (warning)**: 橙色主题，用于重要操作确认  
- **信息 (info)**: 蓝色主题，用于信息提示确认
- **成功 (success)**: 绿色主题，用于成功操作确认
- **提示 (tips)**: 紫色主题，用于提示信息确认

## 基本用法

### 1. 警告类型 (Alert) - 有取消和确认按钮

```jsx
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'

const [showAlert, setShowAlert] = useState(false)

const handleDelete = () => {
  // 执行删除操作
  console.log('删除操作已确认')
  setShowAlert(false)
}

<ConfirmDialog
  open={showAlert}
  onOpenChange={setShowAlert}
  type="alert"
  title="確認刪除"
  description="此操作將永久刪除該記錄，無法恢復。是否繼續？"
  confirmText="刪除"
  cancelText="取消"
  onConfirm={handleDelete}
  onCancel={() => setShowAlert(false)}
/>
```

### 2. 警告类型 (Warning) - 有取消和确认按钮

```jsx
<ConfirmDialog
  open={showWarning}
  onOpenChange={setShowWarning}
  type="warning"
  title="確認導航"
  description="打開新的詳情會清理當前已填入的診斷内容，是否繼續？"
  onConfirm={() => {
    // 执行导航操作
    setShowWarning(false)
  }}
  onCancel={() => setShowWarning(false)}
/>
```

### 3. 信息类型 (Info) - 有取消和确认按钮

```jsx
<ConfirmDialog
  open={showInfo}
  onOpenChange={setShowInfo}
  type="info"
  title="系統提示"
  description="您的操作將影響其他用戶的數據，請確認您有相應權限。"
  onConfirm={() => {
    // 执行操作
    setShowInfo(false)
  }}
  onCancel={() => setShowInfo(false)}
/>
```

### 4. 成功类型 (Success) - 只有确认按钮

```jsx
<ConfirmDialog
  open={showSuccess}
  onOpenChange={setShowSuccess}
  type="success"
  title="操作成功"
  description="您的操作已成功完成！"
  confirmText="知道了"
  showCancel={false}
  onConfirm={() => setShowSuccess(false)}
/>
```

### 5. 提示类型 (Tips) - 只有确认按钮

```jsx
<ConfirmDialog
  open={showTips}
  onOpenChange={setShowTips}
  type="tips"
  title="使用提示"
  description="您可以通過點擊右上角的設置按鈕來自定義您的偏好設置。"
  confirmText="明白了"
  showCancel={false}
  onConfirm={() => setShowTips(false)}
/>
```

## 组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | boolean | - | 控制对话框是否显示 |
| `onOpenChange` | function | - | 对话框状态改变时的回调 |
| `type` | string | 'alert' | 对话框类型：'alert', 'warning', 'info', 'success', 'tips' |
| `title` | string | - | 对话框标题 |
| `description` | string | - | 对话框描述内容 |
| `confirmText` | string | '確認' | 确认按钮文本 |
| `cancelText` | string | '取消' | 取消按钮文本 |
| `onConfirm` | function | - | 确认按钮点击回调 |
| `onCancel` | function | - | 取消按钮点击回调 |
| `showCancel` | boolean | true | 是否显示取消按钮 |
| `confirmButtonVariant` | string | 'default' | 确认按钮样式变体 |

## 样式特性

- **渐变背景**: 使用白色渐变背景，支持毛玻璃效果
- **动态阴影**: 根据类型显示不同颜色的阴影效果
- **图标支持**: 每种类型都有对应的图标
- **响应式设计**: 适配不同屏幕尺寸
- **平滑动画**: 所有交互都有平滑的过渡动画

## 使用建议

1. **选择合适的类型**: 根据操作的危险程度选择对应的类型
2. **清晰的描述**: 提供明确的操作说明和后果提示
3. **合理的按钮文本**: 使用用户容易理解的按钮文本
4. **适当的确认**: 对于危险操作，建议使用双按钮确认
5. **及时反馈**: 操作完成后及时关闭对话框

## 完整示例

```jsx
import React, { useState } from 'react'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'

export default function ExamplePage() {
  const [dialogs, setDialogs] = useState({
    alert: false,
    warning: false,
    info: false,
    success: false,
    tips: false
  })

  const showDialog = (type) => {
    setDialogs(prev => ({ ...prev, [type]: true }))
  }

  const hideDialog = (type) => {
    setDialogs(prev => ({ ...prev, [type]: false }))
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">ConfirmDialog 示例</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button onClick={() => showDialog('alert')} className="btn btn-red">
          警告对话框
        </button>
        <button onClick={() => showDialog('warning')} className="btn btn-orange">
          警告对话框
        </button>
        <button onClick={() => showDialog('info')} className="btn btn-blue">
          信息对话框
        </button>
        <button onClick={() => showDialog('success')} className="btn btn-green">
          成功对话框
        </button>
        <button onClick={() => showDialog('tips')} className="btn btn-purple">
          提示对话框
        </button>
      </div>

      {/* 各种类型的对话框 */}
      <ConfirmDialog
        open={dialogs.alert}
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, alert: open }))}
        type="alert"
        title="危險操作"
        description="此操作將永久刪除數據，無法恢復！"
        confirmText="刪除"
        onConfirm={() => {
          console.log('执行删除操作')
          hideDialog('alert')
        }}
        onCancel={() => hideDialog('alert')}
      />

      <ConfirmDialog
        open={dialogs.warning}
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, warning: open }))}
        type="warning"
        title="重要提示"
        description="此操作將影響系統設置，請確認。"
        onConfirm={() => {
          console.log('执行警告操作')
          hideDialog('warning')
        }}
        onCancel={() => hideDialog('warning')}
      />

      <ConfirmDialog
        open={dialogs.info}
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, info: open }))}
        type="info"
        title="信息提示"
        description="這是一個信息提示的示例。"
        onConfirm={() => {
          console.log('执行信息操作')
          hideDialog('info')
        }}
        onCancel={() => hideDialog('info')}
      />

      <ConfirmDialog
        open={dialogs.success}
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, success: open }))}
        type="success"
        title="操作成功"
        description="您的操作已成功完成！"
        confirmText="知道了"
        showCancel={false}
        onConfirm={() => hideDialog('success')}
      />

      <ConfirmDialog
        open={dialogs.tips}
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, tips: open }))}
        type="tips"
        title="使用提示"
        description="這是一個使用提示的示例。"
        confirmText="明白了"
        showCancel={false}
        onConfirm={() => hideDialog('tips')}
      />
    </div>
  )
}
``` 