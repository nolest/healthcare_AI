import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Loader2, Heart, Activity, Thermometer, Droplets, CheckCircle } from 'lucide-react'
import ImageUpload from './ui/ImageUpload.jsx'
import apiService from '../services/api.js'

export default function MeasurementForm({ onMeasurementAdded }) {
  const navigate = useNavigate()
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
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

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

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  // 处理图片变更
  const handleImagesChange = (images, previewUrls) => {
    setSelectedImages(images)
    setImagePreviewUrls(previewUrls)
    setError('') // 清除错误信息
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
    console.log('🚀 开始提交测量记录...')
    setLoading(true)
    setError('')

    try {
      // 表單驗證
      console.log('📋 验证表单数据:', formData)
      const validationErrors = validateForm()
      if (validationErrors.length > 0) {
        console.log('❌ 表单验证失败:', validationErrors)
        setError(validationErrors.join('、'))
        setLoading(false)
        return
      }
      console.log('✅ 表单验证通过')

      // 準備FormData用於文件上传
      console.log('📦 准备FormData...')
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
      console.log(`📷 添加 ${selectedImages.length} 张图片到FormData`)
      selectedImages.forEach((image, index) => {
        console.log(`   图片 ${index + 1}: ${image.name} (${(image.size / 1024 / 1024).toFixed(1)}MB)`)
        formDataToSubmit.append('images', image)
      })

      // 检查用户认证状态
      const isAuthenticated = apiService.isAuthenticated()
      console.log('🔐 用户认证状态:', isAuthenticated)
      if (!isAuthenticated) {
        throw new Error('用户未登录，请重新登录')
      }

      // 設置上傳狀態
      console.log('⏳ 设置上传状态...')
      setIsUploading(true)
      setUploadProgress(0)

      // 調用API提交測量數據，帶進度回調
      console.log('🌐 开始API调用...')
      const response = await apiService.submitMeasurementWithImages(
        formDataToSubmit,
        (progress) => {
          console.log(`📊 上传进度: ${progress}%`)
          setUploadProgress(progress)
        }
      )
      console.log('✅ 测量记录提交成功:', response)

      // 清理图片相关状态
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))
      setSelectedImages([])
      setImagePreviewUrls([])
      
      // 通知父組件
      if (onMeasurementAdded) {
        onMeasurementAdded()
      }

      // 准备结果数据并跳转到结果页面
      const resultData = {
        measurementData: {
          systolic: formData.systolic,
          diastolic: formData.diastolic,
          heartRate: formData.heartRate,
          temperature: formData.temperature,
          oxygenSaturation: formData.oxygenSaturation,
          notes: formData.notes,
          measurementTime: formData.measurementTime
        },
        abnormalResult: response.data.abnormalResult,
        imageCount: selectedImages.length
      }

      // 跳转到结果页面
      navigate('/patient/measurement/result', {
        state: { resultData }
      })

    } catch (error) {
      console.error('Submit error:', error)
      setError(error.message || '保存測量記錄失敗，請檢查網絡連接')
    } finally {
      setLoading(false)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-white/90 via-white/85 to-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-green-500/20 border-0 p-6 relative overflow-hidden">
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-200/20 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-200/20 to-transparent rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              生理指標測量
            </h3>
            <p className="text-gray-700/80 text-sm">
              請輸入您的生理指標測量數據（至少填寫一項）
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-gradient-to-r from-red-50/80 to-red-100/80 border-0 text-red-700 px-4 py-3 rounded-2xl shadow-inner backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mr-3 shadow-sm">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl shadow-sm">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="systolic" className="text-sm font-medium text-gray-700">
                    收縮壓 (mmHg) <span className="text-gray-400 text-xs">可選</span>
                  </Label>
                  <Input
                    id="systolic"
                    type="number"
                    placeholder="120"
                    value={formData.systolic}
                    onChange={(e) => handleChange('systolic', e.target.value)}
                    disabled={loading}
                    className="h-11 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl shadow-sm">
                  <Heart className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="diastolic" className="text-sm font-medium text-gray-700">
                    舒張壓 (mmHg) <span className="text-gray-400 text-xs">可選</span>
                  </Label>
                  <Input
                    id="diastolic"
                    type="number"
                    placeholder="80"
                    value={formData.diastolic}
                    onChange={(e) => handleChange('diastolic', e.target.value)}
                    disabled={loading}
                    className="h-11 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl shadow-sm">
                  <Activity className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="heartRate" className="text-sm font-medium text-gray-700">
                    心率 (次/分) <span className="text-gray-400 text-xs">可選</span>
                  </Label>
                  <Input
                    id="heartRate"
                    type="number"
                    placeholder="72"
                    value={formData.heartRate}
                    onChange={(e) => handleChange('heartRate', e.target.value)}
                    disabled={loading}
                    className="h-11 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl shadow-sm">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="temperature" className="text-sm font-medium text-gray-700">
                    體溫 (°C) <span className="text-gray-400 text-xs">可選</span>
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={formData.temperature}
                    onChange={(e) => handleChange('temperature', e.target.value)}
                    disabled={loading}
                    className="h-11 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl shadow-sm">
                  <Droplets className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="oxygenSaturation" className="text-sm font-medium text-gray-700">
                    血氧飽和度 (%) <span className="text-gray-400 text-xs">可選</span>
                  </Label>
                  <Input
                    id="oxygenSaturation"
                    type="number"
                    placeholder="98"
                    value={formData.oxygenSaturation}
                    onChange={(e) => handleChange('oxygenSaturation', e.target.value)}
                    disabled={loading}
                    className="h-11 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl shadow-sm">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="measurementTime" className="text-sm font-medium text-gray-700">
                    測量時間 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="measurementTime"
                    type="datetime-local"
                    value={formData.measurementTime}
                    onChange={(e) => handleChange('measurementTime', e.target.value)}
                    disabled={loading}
                    required
                    className="h-11 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">備註（可選）</Label>
              <Textarea
                id="notes"
                placeholder="記錄任何相關的症狀或特殊情況..."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={loading}
                rows={3}
                className="bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 resize-none"
              />
            </div>

            {/* 图片上传区域 */}
            <ImageUpload
              selectedImages={selectedImages}
              onImagesChange={handleImagesChange}
              disabled={loading}
              uploading={isUploading}
              uploadProgress={uploadProgress}
              accentColor="green"
            />

            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={loading || isUploading}
                className="w-full h-12 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0"
              >
                <div className="flex items-center justify-center">
                  {loading || isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      {isUploading ? '上傳中...' : '提交中...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      提交測量記錄
                    </>
                  )}
                </div>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

