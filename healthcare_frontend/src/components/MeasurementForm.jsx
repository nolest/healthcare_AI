import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Loader2, Heart, Activity, Thermometer, Droplets, Upload, X, Image } from 'lucide-react'
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

  // 图片上传相关状态
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState([])

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

  // 处理图片选择
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    
    // 检查文件数量限制
    if (files.length > 5) {
      setError('最多只能上传5张图片')
      return
    }

    // 检查文件类型和大小
    const validFiles = []
    const validPreviewUrls = []
    
    for (const file of files) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        setError('只能上传图片文件')
        return
      }
      
      // 检查文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('图片文件大小不能超过5MB')
        return
      }
      
      validFiles.push(file)
      validPreviewUrls.push(URL.createObjectURL(file))
    }
    
    setSelectedImages(validFiles)
    setImagePreviewUrls(validPreviewUrls)
    setError('') // 清除错误信息
  }

  // 移除图片
  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index)
    
    // 释放URL对象
    URL.revokeObjectURL(imagePreviewUrls[index])
    
    setSelectedImages(newImages)
    setImagePreviewUrls(newPreviewUrls)
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

      // 準備FormData用於文件上传
      const formDataToSubmit = new FormData()

      // 添加测量数据
      formDataToSubmit.append('notes', formData.notes)
      formDataToSubmit.append('measurementTime', formData.measurementTime)

      // 只添加有值的测量数据
      if (formData.systolic) formDataToSubmit.append('systolic', formData.systolic)
      if (formData.diastolic) formDataToSubmit.append('diastolic', formData.diastolic)
      if (formData.heartRate) formDataToSubmit.append('heartRate', formData.heartRate)
      if (formData.temperature) formDataToSubmit.append('temperature', formData.temperature)
      if (formData.oxygenSaturation) formDataToSubmit.append('oxygenSaturation', formData.oxygenSaturation)

      // 添加图片文件
      selectedImages.forEach((image) => {
        formDataToSubmit.append('images', image)
      })

      // 調用API提交測量數據
      const response = await apiService.submitMeasurementWithImages(formDataToSubmit)
      console.log('Measurement submitted:', response)

      // 使用后端返回的异常检测结果
      let successMessage = '✅ 測量記錄已成功保存！'
      if (selectedImages.length > 0) {
        successMessage += `\n📷 已上传 ${selectedImages.length} 张图片`
      }
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
      
      // 清理图片相关状态
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))
      setSelectedImages([])
      setImagePreviewUrls([])
      
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

          {/* 图片上传区域 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Image className="h-4 w-4 text-purple-500" />
                <span>症狀圖片（可選，最多5張）</span>
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-sm text-gray-600">
                      點擊選擇圖片或拖拽圖片到此處
                    </span>
                    <Input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={loading}
                      className="hidden"
                    />
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    支持 JPG、PNG、GIF、WebP 格式，單個文件不超過5MB
                  </p>
                </div>
              </div>
            </div>

            {/* 图片预览 */}
            {imagePreviewUrls.length > 0 && (
              <div className="space-y-2">
                <Label>已選擇的圖片預覽</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`預覽 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                        disabled={loading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                        {selectedImages[index]?.name?.substring(0, 10)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

