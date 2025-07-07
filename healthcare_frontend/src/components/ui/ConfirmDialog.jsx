import React, { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from './dialog.jsx'
import { Button } from './button.jsx'
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  HelpCircle, 
  XCircle 
} from 'lucide-react'
import i18n from '../../utils/i18n.js'

const ConfirmDialog = ({
  open,
  onOpenChange,
  type = 'alert', // 'alert', 'warning', 'info', 'success', 'tips'
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  showCancel = true,
  confirmButtonVariant = 'default'
}) => {
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    i18n.addListener(handleLanguageChange)
    return () => i18n.removeListener(handleLanguageChange)
  }, [])

  // 使用國際化翻譯，如果沒有提供自定義文本則使用默認翻譯
  const finalConfirmText = confirmText || i18n.t('common.confirm')
  const finalCancelText = cancelText || i18n.t('common.cancel')

  // 根据类型获取图标和样式
  const getTypeConfig = () => {
    switch (type) {
      case 'alert':
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-600',
          confirmButtonClass: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg',
          shadowColor: 'shadow-red-500/10'
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-orange-600',
          confirmButtonClass: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg',
          shadowColor: 'shadow-orange-500/10'
        }
      case 'info':
        return {
          icon: Info,
          iconColor: 'text-blue-600',
          confirmButtonClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg',
          shadowColor: 'shadow-blue-500/10'
        }
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-600',
          confirmButtonClass: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg',
          shadowColor: 'shadow-green-500/10'
        }
      case 'tips':
        return {
          icon: HelpCircle,
          iconColor: 'text-purple-600',
          confirmButtonClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg',
          shadowColor: 'shadow-purple-500/10'
        }
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-gray-600',
          confirmButtonClass: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg',
          shadowColor: 'shadow-gray-500/10'
        }
    }
  }

  const config = getTypeConfig()
  const IconComponent = config.icon

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[425px] bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl ${config.shadowColor} rounded-2xl`}>
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg text-gray-800 flex items-center gap-2">
            <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-4">
          {showCancel && (
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-xl shadow-inner hover:shadow-md transition-all duration-300 text-gray-600 hover:bg-gray-50/80"
            >
              {finalCancelText}
            </Button>
          )}
          <Button 
            variant={confirmButtonVariant}
            onClick={handleConfirm}
            className={`${config.confirmButtonClass} rounded-xl transition-all duration-300`}
          >
            {finalConfirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmDialog 