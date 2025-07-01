import { useState } from 'react'
import { Button } from './button.jsx'
import { Label } from './label.jsx'
import { Input } from './input.jsx'
import { Progress } from './progress.jsx'
import { Loader2, Upload, X, Image, CheckCircle } from 'lucide-react'

export default function ImageUpload({
  selectedImages = [],
  onImagesChange,
  maxImages = 5,
  maxSizePerImage = 5, // MB
  label = "症狀圖片",
  description = "支持 JPG、PNG、GIF、WebP 格式",
  disabled = false,
  uploading = false,
  uploadProgress = 0,
  accentColor = 'green' // green, purple, blue
}) {
  const [imagePreviewUrls, setImagePreviewUrls] = useState([])

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
        console.error(`最多只能上传${maxImages}张图片`)
        return
      }

      // 检查文件类型和大小
      const validFiles = []
      const validPreviewUrls = []
      
      for (const file of files) {
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
          console.error('只能上传图片文件')
          return
        }
        
        // 检查文件大小
        if (file.size > maxSizePerImage * 1024 * 1024) {
          console.error(`图片文件大小不能超过${maxSizePerImage}MB`)
          return
        }
        
        validFiles.push(file)
        validPreviewUrls.push(URL.createObjectURL(file))
      }
      
      setImagePreviewUrls(validPreviewUrls)
      onImagesChange(validFiles, validPreviewUrls)
    } catch (error) {
      console.error('处理图片选择时出错:', error)
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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center justify-between text-sm font-medium text-gray-700">
          <div className="flex items-center space-x-2">
            <Image className={`h-4 w-4 ${colorClasses.icon}`} />
            <span>{label}（可選，最多{maxImages}張）</span>
          </div>
          {selectedImages.length > 0 && (
            <span className="text-xs text-gray-500">
              已選擇 {selectedImages.length}/{maxImages} 張
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
                  ? '已達到最大上傳數量' 
                  : '點擊選擇圖片或拖拽圖片到此處'
                }
              </span>
              <p className="text-xs text-gray-500">
                {description}，單個文件不超過{maxSizePerImage}MB
              </p>
              {selectedImages.length > 0 && (
                <p className={`text-xs ${colorClasses.text}`}>
                  💡 提示：可以一次選擇多張圖片進行上傳
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
            <span>已選擇的圖片預覽</span>
            <span className="text-xs text-gray-500">
              總大小: {(selectedImages.reduce((total, img) => total + img.size, 0) / 1024 / 1024).toFixed(1)} MB
            </span>
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="relative">
                  <img
                    src={url}
                    alt={`預覽 ${index + 1}`}
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
                  {(selectedImages[index]?.size / 1024 / 1024).toFixed(1)}MB
                </div>
              </div>
            ))}
          </div>
          
          {!uploading && (
            <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <span>
                📎 {selectedImages.length} 張圖片已準備上傳
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearAllImages}
                disabled={disabled || uploading}
                className="h-6 text-xs px-2"
              >
                清除全部
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
                {uploadProgress < 100 ? '正在上传图片...' : '处理中...'}
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
              正在上传 {selectedImages.length} 张图片
              {uploadProgress === 100 && (
                <span className="ml-2 inline-flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  上传完成，正在保存记录...
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 