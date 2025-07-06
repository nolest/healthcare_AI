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
import i18n from '../utils/i18n'

export default function MeasurementForm({ onMeasurementAdded }) {
  const navigate = useNavigate()
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())
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

  useEffect(() => {
    // 监听语言变化
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    
    return () => {
      i18n.removeListener(handleLanguageChange)
    }
  }, [])

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
      errors.push(i18n.t('measurement.at_least_one_required'))
    }
    
    // 测量时间必填
    if (!formData.measurementTime) {
      errors.push(i18n.t('measurement.time_required'))
    }
    
    // 只检查基本的数据类型和极端值（防止明显错误输入）
    if (formData.systolic && (isNaN(formData.systolic) || formData.systolic <= 0)) {
      errors.push(i18n.t('measurement.systolic_invalid'))
    }
    if (formData.diastolic && (isNaN(formData.diastolic) || formData.diastolic <= 0)) {
      errors.push(i18n.t('measurement.diastolic_invalid'))
    }
    if (formData.heartRate && (isNaN(formData.heartRate) || formData.heartRate <= 0)) {
      errors.push(i18n.t('measurement.heart_rate_invalid'))
    }
    if (formData.temperature && (isNaN(formData.temperature) || formData.temperature <= 0)) {
      errors.push(i18n.t('measurement.temperature_invalid'))
    }
    if (formData.oxygenSaturation && (isNaN(formData.oxygenSaturation) || formData.oxygenSaturation <= 0)) {
      errors.push(i18n.t('measurement.oxygen_saturation_invalid'))
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
        throw new Error(i18n.t('auth.login_required'))
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
      setError(error.message || i18n.t('measurement.save_failed'))
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
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {i18n.t('measurement.new_measurement')}
            </h2>
            <p className="text-gray-600">
              {i18n.t('measurement.form_description')}
            </p>
          </div>

          {error && (
            <Alert className="mb-6 bg-gradient-to-r from-red-50/80 to-red-100/80 border-red-200">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 测量时间 */}
            <div className="space-y-2">
              <Label htmlFor="measurementTime" className="text-sm font-medium text-gray-700">
                {i18n.t('measurement.measured_at')} *
              </Label>
              <Input
                id="measurementTime"
                type="datetime-local"
                value={formData.measurementTime}
                onChange={(e) => handleChange('measurementTime', e.target.value)}
                className="w-full h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                required
              />
            </div>

            {/* 血压测量 */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                {i18n.t('measurement.blood_pressure')} (mmHg)
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="systolic" className="text-xs text-gray-600">{i18n.t('measurement.systolic')}</Label>
                  <Input
                    id="systolic"
                    type="number"
                    placeholder="120"
                    value={formData.systolic}
                    onChange={(e) => handleChange('systolic', e.target.value)}
                    className="h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-red-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                  />
                </div>
                <div>
                  <Label htmlFor="diastolic" className="text-xs text-gray-600">{i18n.t('measurement.diastolic')}</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    placeholder="80"
                    value={formData.diastolic}
                    onChange={(e) => handleChange('diastolic', e.target.value)}
                    className="h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-red-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* 心率 */}
            <div className="space-y-2">
              <Label htmlFor="heartRate" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Activity className="h-4 w-4 text-pink-500" />
                {i18n.t('measurement.heart_rate')} (bpm)
              </Label>
              <Input
                id="heartRate"
                type="number"
                placeholder="72"
                value={formData.heartRate}
                onChange={(e) => handleChange('heartRate', e.target.value)}
                className="h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-pink-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
              />
            </div>

            {/* 体温 */}
            <div className="space-y-2">
              <Label htmlFor="temperature" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                {i18n.t('measurement.temperature')} (°C)
              </Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="36.5"
                value={formData.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
                className="h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-orange-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
              />
            </div>

            {/* 血氧饱和度 */}
            <div className="space-y-2">
              <Label htmlFor="oxygenSaturation" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                {i18n.t('measurement.oxygen_saturation')} (%)
              </Label>
              <Input
                id="oxygenSaturation"
                type="number"
                placeholder="98"
                value={formData.oxygenSaturation}
                onChange={(e) => handleChange('oxygenSaturation', e.target.value)}
                className="h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
              />
            </div>

            {/* 图片上传 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                {i18n.t('measurement.upload_images')}
              </Label>
              <ImageUpload
                onImagesChange={handleImagesChange}
                maxImages={5}
                acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                maxSizePerImage={10 * 1024 * 1024} // 10MB
              />
            </div>

            {/* 备注 */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                {i18n.t('measurement.notes')}
              </Label>
              <Textarea
                id="notes"
                placeholder={i18n.t('measurement.notes_placeholder')}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="min-h-[80px] bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-purple-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 resize-none"
              />
            </div>

            {/* 上传进度 */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{i18n.t('measurement.uploading')}</span>
                  <span className="text-blue-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* 提交按钮 */}
            <Button
              type="submit"
              disabled={loading || isUploading}
              className="w-full h-12 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0"
            >
              {loading || isUploading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-3" />
                  {isUploading ? i18n.t('measurement.uploading') : i18n.t('common.loading')}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {i18n.t('measurement.submit')}
                </div>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

