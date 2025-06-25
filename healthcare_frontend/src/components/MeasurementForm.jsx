import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Loader2, Heart, Activity, Thermometer, Droplets } from 'lucide-react'
import apiService from '../services/api.js'

export default function MeasurementForm({ onMeasurementAdded }) {
  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
    temperature: '',
    oxygenSaturation: '',
    notes: '',
    measurementTime: ''
  })

  // 设置默认测量时间为当前时间
  useEffect(() => {
    const now = new Date()
    const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    setFormData(prev => ({
      ...prev,
      measurementTime: localISOTime
    }))
  }, [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const validateForm = () => {
    const errors = []
    
    // 检查是否至少填写了一个生理指标
    const hasAnyMeasurement = formData.systolic || formData.diastolic || formData.heartRate || 
                             formData.temperature || formData.oxygenSaturation
    
    if (!hasAnyMeasurement) {
      errors.push('请至少填写一个生理指标')
    }
    
    // 测量时间必填
    if (!formData.measurementTime) {
      errors.push('测量时间必须填写')
    }
    
    // 只检查基本的数据类型和极端值（防止明显错误输入）
    if (formData.systolic && (isNaN(formData.systolic) || formData.systolic <= 0)) {
      errors.push('收縮壓必須是有效數字')
    }
    if (formData.diastolic && (isNaN(formData.diastolic) || formData.diastolic <= 0)) {
      errors.push('舒張壓必須是有效數字')
    }
    if (formData.heartRate && (isNaN(formData.heartRate) || formData.heartRate <= 0)) {
      errors.push('心率必須是有效數字')
    }
    if (formData.temperature && (isNaN(formData.temperature) || formData.temperature <= 0)) {
      errors.push('體溫必須是有效數字')
    }
    if (formData.oxygenSaturation && (isNaN(formData.oxygenSaturation) || formData.oxygenSaturation <= 0)) {
      errors.push('血氧飽和度必須是有效數字')
    }
    
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // 表單驗證
      const validationErrors = validateForm()
      if (validationErrors.length > 0) {
        setError(validationErrors.join('、'))
        return
      }

      // 準備API數據（只包含有值的字段）
      const measurementData = {
        notes: formData.notes,
        measurementTime: formData.measurementTime
      }

      // 只添加有值的测量数据
      if (formData.systolic) measurementData.systolic = parseFloat(formData.systolic)
      if (formData.diastolic) measurementData.diastolic = parseFloat(formData.diastolic)
      if (formData.heartRate) measurementData.heartRate = parseFloat(formData.heartRate)
      if (formData.temperature) measurementData.temperature = parseFloat(formData.temperature)
      if (formData.oxygenSaturation) measurementData.oxygenSaturation = parseFloat(formData.oxygenSaturation)

      // 調用API提交測量數據
      const response = await apiService.submitMeasurement(measurementData)
      console.log('Measurement submitted:', response)

      // 使用后端返回的异常检测结果
      let successMessage = '✅ 測量記錄已成功保存！'
      if (response.abnormalResult && response.abnormalResult.isAbnormal) {
        successMessage += '\n\n⚠️ 異常檢測結果：\n' + response.abnormalResult.reasons.join('\n') + '\n\n建議盡快諮詢醫護人員。'
      } else {
        successMessage += '\n\n✅ 所有測量值均在正常範圍內。'
      }
      
      setSuccess(successMessage)
      
      // 重置表單（保留当前时间）
      const now = new Date()
      const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      setFormData({
        systolic: '',
        diastolic: '',
        heartRate: '',
        temperature: '',
        oxygenSaturation: '',
        notes: '',
        measurementTime: localISOTime
      })
      
      // 通知父組件
      if (onMeasurementAdded) {
        onMeasurementAdded()
      }
    } catch (error) {
      console.error('Submit error:', error)
      setError(error.message || '保存測量記錄失敗，請檢查網絡連接')
    } finally {
      setLoading(false)
    }
  }



  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-red-500" />
          <span>生理指標測量</span>
        </CardTitle>
        <CardDescription>
          請輸入您的生理指標測量數據（至少填寫一項）
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className={success.includes('⚠️') ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}>
              <AlertDescription className="whitespace-pre-line">{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="systolic" className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>收縮壓 (mmHg) <span className="text-gray-500 text-sm">可選</span></span>
              </Label>
              <Input
                id="systolic"
                type="number"
                placeholder="120"
                value={formData.systolic}
                onChange={(e) => handleChange('systolic', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diastolic" className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-blue-500" />
                <span>舒張壓 (mmHg) <span className="text-gray-500 text-sm">可選</span></span>
              </Label>
              <Input
                id="diastolic"
                type="number"
                placeholder="80"
                value={formData.diastolic}
                onChange={(e) => handleChange('diastolic', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heartRate" className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span>心率 (次/分) <span className="text-gray-500 text-sm">可選</span></span>
              </Label>
              <Input
                id="heartRate"
                type="number"
                placeholder="72"
                value={formData.heartRate}
                onChange={(e) => handleChange('heartRate', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature" className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <span>體溫 (°C) <span className="text-gray-500 text-sm">可選</span></span>
              </Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="36.5"
                value={formData.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="oxygenSaturation" className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-blue-600" />
                <span>血氧飽和度 (%) <span className="text-gray-500 text-sm">可選</span></span>
              </Label>
              <Input
                id="oxygenSaturation"
                type="number"
                placeholder="98"
                value={formData.oxygenSaturation}
                onChange={(e) => handleChange('oxygenSaturation', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="measurementTime">測量時間 <span className="text-red-500">*</span></Label>
              <Input
                id="measurementTime"
                type="datetime-local"
                value={formData.measurementTime}
                onChange={(e) => handleChange('measurementTime', e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備註（可選）</Label>
            <Textarea
              id="notes"
              placeholder="記錄任何相關的症狀或特殊情況..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                提交中...
              </>
            ) : (
              '提交測量記錄'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

