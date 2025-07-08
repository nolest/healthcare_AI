import { useState, useEffect } from 'react'
import { Button } from './button.jsx'
import { Label } from './label.jsx'
import { Input } from './input.jsx'
import { Progress } from './progress.jsx'
import { Loader2, Upload, X, Image, CheckCircle } from 'lucide-react'
import i18n from '../../utils/i18n.js'

export default function ImageUpload({
  selectedImages = [],
  onImagesChange,
  maxImages = 5,
  maxSizePerImage = 5, // MB
  label = null, // 将使用国际化的默认标签
  description = null, // 将使用国际化的默认描述
  disabled = false,
  uploading = false,
  uploadProgress = 0,
  accentColor = 'green' // green, purple, blue
}) {
  const [imagePreviewUrls, setImagePreviewUrls] = useState([])
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

  const t = (key, params = {}) => {
    language; // 确保组件依赖于language状态
    return i18n.t(key, params)
  }

  // 根据accent颜色获取样式类
  const getColorClasses = () => {
    switch (accentColor) {
      case 'purple':
        return {
          border: 'border-purple-300 hover:border-purple-400',
          bg: 'hover:bg-purple-50/50 bg-gradient-to-br from-white/90 to-purple-50/30',
          icon: 'text-purple-500',
          text: 'text-purple-600',
          progress: 'purple'
        }
      case 'blue':
        return {
          border: 'border-blue-300 hover:border-blue-400',
          bg: 'hover:bg-blue-50/50 bg-gradient-to-br from-white/90 to-blue-50/30',
          icon: 'text-blue-500',
          text: 'text-blue-600',
          progress: 'blue'
        }
      default: // green
        return {
          border: 'border-green-300 hover:border-green-400',
          bg: 'hover:bg-green-50/50 bg-gradient-to-br from-white/90 to-green-50/30',
          icon: 'text-green-500',
          text: 'text-green-600',
          progress: 'green'
        }
    }
  }

  const colorClasses = getColorClasses()

  // 处理图片选择
  const handleImageSelect = (e) => {
    try {
      const files = Array.from(e.target.files)
      
      // 检查文件数量限制
      if (files.length > maxImages) {
        console.error(t('image_upload.error_file_count', { count: maxImages }))
        return
      }

      // 检查文件类型和大小
      const validFiles = []
      const validPreviewUrls = []
      
      for (const file of files) {
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
          console.error(t('image_upload.error_file_type'))
          return
        }
        
        // 检查文件大小
        if (file.size > maxSizePerImage * 1024 * 1024) {
          console.error(t('image_upload.error_file_size', { size: maxSizePerImage }))
          return
        }
        
        validFiles.push(file)
        validPreviewUrls.push(URL.createObjectURL(file))
      }
      
      setImagePreviewUrls(validPreviewUrls)
      onImagesChange(validFiles, validPreviewUrls)
    } catch (error) {
      console.error(t('image_upload.error_processing'), error)
    }
  }

  // 移除图片
  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index)
    
    // 释放URL对象
    URL.revokeObjectURL(imagePreviewUrls[index])
    
    setImagePreviewUrls(newPreviewUrls)
    onImagesChange(newImages, newPreviewUrls)
  }

  // 清除所有图片
  const clearAllImages = () => {
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))
    setImagePreviewUrls([])
    onImagesChange([], [])
  }

  // 获取标签文本
  const getLabelText = () => {
    if (label) return label
    return `${t('image_upload.label')}（${t('image_upload.optional')}，${t('image_upload.max_count', { count: maxImages })}）`
  }

  // 获取描述文本
  const getDescriptionText = () => {
    if (description) return description
    return `${t('image_upload.file_format_desc')}，${t('image_upload.max_size_desc', { size: maxSizePerImage })}`
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center justify-between text-sm font-medium text-gray-700">
          <div className="flex items-center space-x-2">
            <Image className={`h-4 w-4 ${colorClasses.icon}`} />
            <span>{getLabelText()}</span>
          </div>
          {selectedImages.length > 0 && (
            <span className="text-xs text-gray-500">
              {t('image_upload.selected_count', { selected: selectedImages.length, max: maxImages })}
            </span>
          )}
        </Label>
        <Label 
          htmlFor="image-upload" 
          className={`block border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
            selectedImages.length >= maxImages || disabled
              ? 'border-gray-200 bg-gray-50/80 cursor-not-allowed' 
              : `${colorClasses.border} ${colorClasses.bg}`
          }`}
        >
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
            <div className="space-y-2">
              <span className={`text-sm ${selectedImages.length >= maxImages || disabled ? 'text-gray-400' : 'text-gray-600 font-medium'}`}>
                {selectedImages.length >= maxImages 
                  ? t('image_upload.max_limit_reached')
                  : t('image_upload.click_to_select')
                }
              </span>
              <p className="text-xs text-gray-500">
                {getDescriptionText()}
              </p>
              {selectedImages.length > 0 && (
                <p className={`text-xs ${colorClasses.text}`}>
                  {t('image_upload.multi_upload_tip')}
                </p>
              )}
            </div>
          </div>
          <Input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            disabled={disabled || uploading || selectedImages.length >= maxImages}
            className="hidden"
          />
        </Label>
      </div>

      {/* 图片预览 */}
      {imagePreviewUrls.length > 0 && (
        <div className="space-y-2">
          <Label className="flex items-center justify-between">
            <span>{t('image_upload.preview_title')}</span>
            <span className="text-xs text-gray-500">
              {t('image_upload.total_size')}: {(selectedImages.reduce((total, img) => total + (img?.size || 0), 0) / 1024 / 1024).toFixed(1)} MB
            </span>
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="relative">
                  <img
                    src={url}
                    alt={t('image_upload.preview_alt', { index: index + 1 })}
                    className={`w-full h-24 object-cover rounded-lg border transition-opacity ${
                      uploading ? 'opacity-75' : ''
                    }`}
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 rounded-full p-1">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                  disabled={disabled || uploading}
                >
                  <X className="h-3 w-3" />
                </Button>
                
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                  {selectedImages[index]?.name?.substring(0, 8)}...
                </div>
                
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                  {selectedImages[index]?.size ? (selectedImages[index].size / 1024 / 1024).toFixed(1) : '0.0'}MB
                </div>
              </div>
            ))}
          </div>
          
          {!uploading && (
            <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <span>
                {t('image_upload.files_ready', { count: selectedImages.length })}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearAllImages}
                disabled={disabled || uploading}
                className="h-6 text-xs px-2"
              >
                {t('image_upload.clear_all')}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 上传进度显示 */}
      {uploading && (
        <div className={`space-y-3 p-4 rounded-lg border ${
          accentColor === 'purple' ? 'bg-purple-50 border-purple-200' :
          accentColor === 'blue' ? 'bg-blue-50 border-blue-200' :
          'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Upload className={`h-4 w-4 ${
                accentColor === 'purple' ? 'text-purple-600' :
                accentColor === 'blue' ? 'text-blue-600' :
                'text-green-600'
              }`} />
              <span className={`text-sm font-medium ${
                accentColor === 'purple' ? 'text-purple-800' :
                accentColor === 'blue' ? 'text-blue-800' :
                'text-green-800'
              }`}>
                {uploadProgress < 100 ? t('image_upload.uploading') : t('image_upload.processing')}
              </span>
            </div>
            <span className={`text-sm font-semibold ${
              accentColor === 'purple' ? 'text-purple-600' :
              accentColor === 'blue' ? 'text-blue-600' :
              'text-green-600'
            }`}>
              {uploadProgress}%
            </span>
          </div>
          
          <Progress value={uploadProgress} className="h-2" />
          
          {selectedImages.length > 0 && (
            <div className={`text-xs ${
              accentColor === 'purple' ? 'text-purple-600' :
              accentColor === 'blue' ? 'text-blue-600' :
              'text-green-600'
            }`}>
              {t('image_upload.uploading_count', { count: selectedImages.length })}
              {uploadProgress === 100 && (
                <span className="ml-2 inline-flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {t('image_upload.upload_complete')}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 