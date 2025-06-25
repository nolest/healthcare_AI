import { useState } from 'react'
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
    
    if (!formData.systolic || formData.systolic <= 0) errors.push('收縮壓必須填寫')
    if (!formData.diastolic || formData.diastolic <= 0) errors.push('舒張壓必須填寫')
    if (!formData.heartRate || formData.heartRate <= 0) errors.push('心率必須填寫')
    if (!formData.temperature || formData.temperature <= 0) errors.push('體溫必須填寫')
    if (!formData.oxygenSaturation || formData.oxygenSaturation <= 0) errors.push('血氧飽和度必須填寫')
    
    if (formData.systolic > 300 || formData.systolic < 50) errors.push('收縮壓數值異常')
    if (formData.diastolic > 200 || formData.diastolic < 30) errors.push('舒張壓數值異常')
    if (formData.heartRate > 200 || formData.heartRate < 30) errors.push('心率數值異常')
    if (formData.temperature > 45 || formData.temperature < 30) errors.push('體溫數值異常')
    if (formData.oxygenSaturation > 100 || formData.oxygenSaturation < 50) errors.push('血氧飽和度數值異常')
    
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

      // 準備API數據
      const measurementData = {
        systolic: parseFloat(formData.systolic),
        diastolic: parseFloat(formData.diastolic),
        heartRate: parseFloat(formData.heartRate),
        temperature: parseFloat(formData.temperature),
        oxygenSaturation: parseFloat(formData.oxygenSaturation),
        notes: formData.notes,
        measurementTime: formData.measurementTime || new Date().toISOString()
      }

      // 調用API提交測量數據
      const response = await apiService.submitMeasurement(measurementData)
      console.log('Measurement submitted:', response)

      // 檢查是否有異常值
      const isAbnormal = checkAbnormalValues(measurementData)
      
      setSuccess('測量記錄已成功保存！')
      if (isAbnormal) {
        setSuccess(prev => prev + ' ⚠️ 檢測到異常值，建議諮詢醫護人員。')
      }
      
      // 重置表單
      setFormData({
        systolic: '',
        diastolic: '',
        heartRate: '',
        temperature: '',
        oxygenSaturation: '',
        notes: '',
        measurementTime: ''
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

  // 檢查異常值的函數
  const checkAbnormalValues = (data) => {
    return (
      data.systolic > 140 || data.systolic < 90 ||
      data.diastolic > 90 || data.diastolic < 60 ||
      data.heartRate > 100 || data.heartRate < 60 ||
      data.temperature > 37.5 || data.temperature < 36.0 ||
      data.oxygenSaturation < 95
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-red-500" />
          <span>生理指標測量</span>
        </CardTitle>
        <CardDescription>
          請輸入您的生理指標測量數據
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
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="systolic" className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>收縮壓 (mmHg)</span>
              </Label>
              <Input
                id="systolic"
                type="number"
                placeholder="120"
                value={formData.systolic}
                onChange={(e) => handleChange('systolic', e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diastolic" className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-blue-500" />
                <span>舒張壓 (mmHg)</span>
              </Label>
              <Input
                id="diastolic"
                type="number"
                placeholder="80"
                value={formData.diastolic}
                onChange={(e) => handleChange('diastolic', e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heartRate" className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span>心率 (次/分)</span>
              </Label>
              <Input
                id="heartRate"
                type="number"
                placeholder="72"
                value={formData.heartRate}
                onChange={(e) => handleChange('heartRate', e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature" className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <span>體溫 (°C)</span>
              </Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="36.5"
                value={formData.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="oxygenSaturation" className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-blue-600" />
                <span>血氧飽和度 (%)</span>
              </Label>
              <Input
                id="oxygenSaturation"
                type="number"
                placeholder="98"
                value={formData.oxygenSaturation}
                onChange={(e) => handleChange('oxygenSaturation', e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="measurementTime">測量時間（可選）</Label>
              <Input
                id="measurementTime"
                type="datetime-local"
                value={formData.measurementTime}
                onChange={(e) => handleChange('measurementTime', e.target.value)}
                disabled={loading}
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

