import React, { useState, useEffect } from 'react'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import i18n from '../utils/i18n.js'

export default function ConfirmDialogTestPage() {
  const [dialogs, setDialogs] = useState({
    alert: false,
    warning: false,
    info: false,
    success: false,
    tips: false
  })
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    
    return () => {
      i18n.removeListener(handleLanguageChange)
    }
  }, [])

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

  const t = (key) => {
    language; // 确保组件依赖于language状态
    return i18n.t(key)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-blue-500/10">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800">{t('pages.confirm_dialog_test.title')}</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              {t('pages.confirm_dialog_test.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* 按钮网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Button 
                onClick={() => showDialog('alert')}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg h-12"
              >
                {t('pages.confirm_dialog_test.alert_dialog')}
              </Button>
              <Button 
                onClick={() => showDialog('warning')}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg h-12"
              >
                {t('pages.confirm_dialog_test.warning_dialog')}
              </Button>
              <Button 
                onClick={() => showDialog('info')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg h-12"
              >
                {t('pages.confirm_dialog_test.info_dialog')}
              </Button>
              <Button 
                onClick={() => showDialog('success')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg h-12"
              >
                {t('pages.confirm_dialog_test.success_dialog')}
              </Button>
              <Button 
                onClick={() => showDialog('tips')}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg h-12"
              >
                {t('pages.confirm_dialog_test.tips_dialog')}
              </Button>
            </div>

            {/* 说明文字 */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('pages.confirm_dialog_test.usage_instructions')}：</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• <strong>{t('pages.confirm_dialog_test.alert_type')}</strong>: {t('pages.confirm_dialog_test.alert_desc')}</li>
                <li>• <strong>{t('pages.confirm_dialog_test.warning_type')}</strong>: {t('pages.confirm_dialog_test.warning_desc')}</li>
                <li>• <strong>{t('pages.confirm_dialog_test.info_type')}</strong>: {t('pages.confirm_dialog_test.info_desc')}</li>
                <li>• <strong>{t('pages.confirm_dialog_test.success_type')}</strong>: {t('pages.confirm_dialog_test.success_desc')}</li>
                <li>• <strong>{t('pages.confirm_dialog_test.tips_type')}</strong>: {t('pages.confirm_dialog_test.tips_desc')}</li>
              </ul>
            </div>

            {/* 特性展示 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">🎨</div>
                <h4 className="font-semibold text-blue-800">{t('pages.confirm_dialog_test.gradient_background')}</h4>
                <p className="text-sm text-blue-600">{t('pages.confirm_dialog_test.gradient_background_desc')}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">🌈</div>
                <h4 className="font-semibold text-green-800">{t('pages.confirm_dialog_test.dynamic_shadow')}</h4>
                <p className="text-sm text-green-600">{t('pages.confirm_dialog_test.dynamic_shadow_desc')}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold text-purple-800">{t('pages.confirm_dialog_test.smooth_animation')}</h4>
                <p className="text-sm text-purple-600">{t('pages.confirm_dialog_test.smooth_animation_desc')}</p>
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
        title={t('pages.confirm_dialog_test.alert_title')}
        description={t('pages.confirm_dialog_test.alert_description')}
        confirmText={t('pages.confirm_dialog_test.delete')}
        cancelText={t('common.cancel')}
        onConfirm={() => handleConfirm('alert')}
        onCancel={() => hideDialog('alert')}
      />

      <ConfirmDialog
        open={dialogs.warning}
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, warning: open }))}
        type="warning"
        title={t('pages.confirm_dialog_test.warning_title')}
        description={t('pages.confirm_dialog_test.warning_description')}
        onConfirm={() => handleConfirm('warning')}
        onCancel={() => hideDialog('warning')}
      />

      <ConfirmDialog
        open={dialogs.info}
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, info: open }))}
        type="info"
        title={t('pages.confirm_dialog_test.info_title')}
        description={t('pages.confirm_dialog_test.info_description')}
        onConfirm={() => handleConfirm('info')}
        onCancel={() => hideDialog('info')}
      />

      <ConfirmDialog
        open={dialogs.success}
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, success: open }))}
        type="success"
        title={t('pages.confirm_dialog_test.success_title')}
        description={t('pages.confirm_dialog_test.success_description')}
        confirmText={t('pages.confirm_dialog_test.got_it')}
        showCancel={false}
        onConfirm={() => handleConfirm('success')}
      />

      <ConfirmDialog
        open={dialogs.tips}
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, tips: open }))}
        type="tips"
        title={t('pages.confirm_dialog_test.tips_title')}
        description={t('pages.confirm_dialog_test.tips_description')}
        confirmText={t('pages.confirm_dialog_test.understand')}
        showCancel={false}
        onConfirm={() => handleConfirm('tips')}
      />
    </div>
  )
} 