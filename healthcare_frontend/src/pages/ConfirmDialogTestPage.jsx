import React, { useState } from 'react'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'

export default function ConfirmDialogTestPage() {
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

  const handleConfirm = (type) => {
    console.log(`${type} 对话框确认操作`)
    hideDialog(type)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-blue-500/10">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800">ConfirmDialog 组件测试</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              测试各种类型的确认对话框组件
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* 按钮网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Button 
                onClick={() => showDialog('alert')}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg h-12"
              >
                警告对话框
              </Button>
              <Button 
                onClick={() => showDialog('warning')}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg h-12"
              >
                警告对话框
              </Button>
              <Button 
                onClick={() => showDialog('info')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg h-12"
              >
                信息对话框
              </Button>
              <Button 
                onClick={() => showDialog('success')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg h-12"
              >
                成功对话框
              </Button>
              <Button 
                onClick={() => showDialog('tips')}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg h-12"
              >
                提示对话框
              </Button>
            </div>

            {/* 说明文字 */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">使用说明：</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• <strong>警告 (Alert)</strong>: 红色主题，用于危险操作确认，有取消和确认按钮</li>
                <li>• <strong>警告 (Warning)</strong>: 橙色主题，用于重要操作确认，有取消和确认按钮</li>
                <li>• <strong>信息 (Info)</strong>: 蓝色主题，用于信息提示确认，有取消和确认按钮</li>
                <li>• <strong>成功 (Success)</strong>: 绿色主题，用于成功操作确认，只有确认按钮</li>
                <li>• <strong>提示 (Tips)</strong>: 紫色主题，用于提示信息确认，只有确认按钮</li>
              </ul>
            </div>

            {/* 特性展示 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">🎨</div>
                <h4 className="font-semibold text-blue-800">渐变背景</h4>
                <p className="text-sm text-blue-600">白色渐变背景，毛玻璃效果</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">🌈</div>
                <h4 className="font-semibold text-green-800">动态阴影</h4>
                <p className="text-sm text-green-600">根据类型显示不同颜色阴影</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold text-purple-800">平滑动画</h4>
                <p className="text-sm text-purple-600">所有交互都有过渡动画</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 各种类型的对话框 */}
      <ConfirmDialog
        open={dialogs.alert}
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, alert: open }))}
        type="alert"
        title="危險操作確認"
        description="此操作將永久刪除該記錄，無法恢復。請確認您真的要執行此操作。"
        confirmText="刪除"
        cancelText="取消"
        onConfirm={() => handleConfirm('alert')}
        onCancel={() => hideDialog('alert')}
      />

      <ConfirmDialog
        open={dialogs.warning}
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, warning: open }))}
        type="warning"
        title="重要操作確認"
        description="此操作將影響系統設置和其他用戶的數據，請確認您有相應權限。"
        onConfirm={() => handleConfirm('warning')}
        onCancel={() => hideDialog('warning')}
      />

      <ConfirmDialog
        open={dialogs.info}
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, info: open }))}
        type="info"
        title="系統信息提示"
        description="您的操作將被記錄在系統日誌中，用於審計和追蹤目的。"
        onConfirm={() => handleConfirm('info')}
        onCancel={() => hideDialog('info')}
      />

      <ConfirmDialog
        open={dialogs.success}
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, success: open }))}
        type="success"
        title="操作成功"
        description="您的操作已成功完成！數據已保存到系統中。"
        confirmText="知道了"
        showCancel={false}
        onConfirm={() => handleConfirm('success')}
      />

      <ConfirmDialog
        open={dialogs.tips}
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, tips: open }))}
        type="tips"
        title="使用提示"
        description="您可以通過點擊右上角的設置按鈕來自定義您的偏好設置，包括主題、語言等選項。"
        confirmText="明白了"
        showCancel={false}
        onConfirm={() => handleConfirm('tips')}
      />
    </div>
  )
} 