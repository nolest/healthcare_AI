import { useState, useEffect } from 'react'
import { Button } from './ui/button.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog.jsx'
import { X, ZoomIn, ZoomOut, RotateCw, Download, Image } from 'lucide-react'
import apiService from '../services/api.js'
import { getDisplayFilenameFromPath } from '../utils/filename.utils.js'

export default function ImageViewer({ images = [], userId, isOpen, onClose, initialIndex = 0, imageUrls = null }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  // 定义函数
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    resetTransform()
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    resetTransform()
  }

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3))
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5))
  const rotate = () => setRotation(prev => (prev + 90) % 360)
  
  const resetTransform = () => {
    setZoom(1)
    setRotation(0)
  }

  // 键盘导航支持
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          if (images.length > 1) prevImage()
          break
        case 'ArrowRight':
          event.preventDefault()
          if (images.length > 1) nextImage()
          break
        case 'Escape':
          event.preventDefault()
          onClose()
          break
        case '+':
        case '=':
          event.preventDefault()
          zoomIn()
          break
        case '-':
          event.preventDefault()
          zoomOut()
          break
        case 'r':
        case 'R':
          event.preventDefault()
          rotate()
          break
        case '0':
          event.preventDefault()
          resetTransform()
          break
        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, images.length])

  // 当initialIndex改变时更新currentIndex
  useEffect(() => {
    setCurrentIndex(initialIndex)
    resetTransform()
  }, [initialIndex])

  if (!images || images.length === 0) return null

  const currentImage = images[currentIndex]
  const filename = currentImage.split('/').pop()
  
  // 优先使用完整URL，如果没有则使用API服务生成URL
  const imageUrl = (imageUrls && imageUrls[currentIndex]) || apiService.getImageUrl(userId, filename)
  const displayName = getDisplayFilenameFromPath(currentImage, `图片${currentIndex + 1}`)

  // 如果无法生成有效的图片URL，显示错误信息
  if (!imageUrl) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>图片加载错误</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-red-500">无法加载图片，请检查图片路径是否正确。</p>
            <p className="text-sm text-gray-500 mt-2">
              路径: {currentImage}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const downloadImage = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = displayName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[80vw] !max-w-none max-h-[85vh] p-0 bg-white border-2 border-gray-200 shadow-2xl" style={{ width: '80vw', maxWidth: 'none' }}>
        <DialogHeader className="p-4 pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Image className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <span className="text-base font-semibold text-gray-800">患者症狀圖片</span>
                  <div className="text-sm text-gray-600 font-normal">
                    第 {currentIndex + 1} 張，共 {images.length} 張
                  </div>
                </div>
              </div>
              <div className="mt-1 text-sm text-gray-700 bg-white px-2 py-1 rounded-lg inline-block">
                📋 {displayName}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={zoomOut}
                className="hover:bg-blue-50 hover:border-blue-300"
                title="縮小"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={zoomIn}
                className="hover:bg-blue-50 hover:border-blue-300"
                title="放大"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={rotate}
                className="hover:bg-blue-50 hover:border-blue-300"
                title="旋轉"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadImage}
                className="hover:bg-green-50 hover:border-green-300"
                title="下載"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetTransform}
                className="hover:bg-gray-50 hover:border-gray-300"
                title="重置視圖"
              >
                重置
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
          {/* 背景装饰图案 */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3Ccircle cx='53' cy='53' r='7'/%3E%3Ccircle cx='53' cy='7' r='7'/%3E%3Ccircle cx='7' cy='53' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
                     <div className="flex items-center justify-center h-[50vh] p-4 relative">
            <div className="relative">
              <img
                src={imageUrl}
                alt={`患者症狀圖片 ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain transition-all duration-300 rounded-xl shadow-2xl border-4 border-white"
                                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    cursor: zoom > 1 ? 'grab' : 'default',
                    maxHeight: '45vh',
                    maxWidth: '75vw'
                  }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmOWZhZmIiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZTVlN2ViIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNncmFkKSIgcng9IjEyIi8+CiAgPGNpcmNsZSBjeD0iMjAwIiBjeT0iMTIwIiByPSI0MCIgZmlsbD0iI2Q0ZWRkYSIgc3Ryb2tlPSIjMTBiOTgxIiBzdHJva2Utd2lkdGg9IjMiLz4KICA8cGF0aCBkPSJtMTcwIDE0MCA2MCA2MCA2MCA2MHoiIGZpbGw9IiNkNGVkZGEiIHN0cm9rZT0iIzEwYjk4MSIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPHRleHQgeD0iMjAwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NzM4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+aXoOazleWKoOi9vTwvdGV4dD4KICA8dGV4dCB4PSIyMDAiIHk9IjIzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+6K+35qOA5p+l5Zu+54mH6Lev5b6E5piv5ZCm5q2j56Gu8J+YjDwvdGV4dD4KPC9zdmc+'
                }}
              />
              
              {/* 图片加载指示器 */}
              <div className="absolute -bottom-3 -right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                {currentIndex + 1}/{images.length}
              </div>
            </div>
          </div>
          
          {/* 图片信息叠加层 */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-1">
                <span>🔍</span>
                <span className="font-medium">{Math.round(zoom * 100)}%</span>
              </div>
              {rotation !== 0 && (
                <div className="flex items-center space-x-1">
                  <span>↻</span>
                  <span className="font-medium">{rotation}°</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <span>📐</span>
                <span className="text-xs text-gray-600">點擊拖拽可移動</span>
              </div>
            </div>
          </div>
          
          {/* 导航按钮 */}
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="lg"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white shadow-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 rounded-full w-10 h-10 p-0"
                onClick={prevImage}
                title="上一張圖片 (← 鍵)"
              >
                <span className="text-lg font-bold text-gray-700">←</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white shadow-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 rounded-full w-10 h-10 p-0"
                onClick={nextImage}
                title="下一張圖片 (→ 鍵)"
              >
                <span className="text-lg font-bold text-gray-700">→</span>
              </Button>
            </>
          )}
        </div>
        
        {/* 缩略图导航 */}
        {images.length > 1 && (
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Image className="h-3 w-3 text-blue-600" />
              </div>
              <h3 className="text-xs font-semibold text-gray-700">
                圖片導航 ({images.length} 張)
              </h3>
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {images.map((image, index) => {
                const thumbFilename = image.split('/').pop()
                
                // 优先使用完整URL，如果没有则使用API服务生成URL
                const thumbUrl = (imageUrls && imageUrls[index]) || apiService.getImageUrl(userId, thumbFilename)
                
                // 如果无法生成缩略图URL，跳过此图片
                if (!thumbUrl) {
                  return null;
                }
                
                return (
                  <button
                    key={index}
                    className={`flex-shrink-0 relative group transition-all duration-300 ${
                      index === currentIndex 
                        ? 'transform scale-110' 
                        : 'hover:transform hover:scale-105'
                    }`}
                    onClick={() => {
                      setCurrentIndex(index)
                      resetTransform()
                    }}
                    title={`切換到第 ${index + 1} 張圖片`}
                  >
                    <div className={`w-16 h-16 rounded-lg overflow-hidden border-2 shadow-md transition-all duration-300 ${
                      index === currentIndex 
                        ? 'border-blue-500 shadow-blue-200' 
                        : 'border-white group-hover:border-blue-300 group-hover:shadow-blue-100'
                    }`}>
                      <img
                        src={thumbUrl}
                        alt={`縮圖 ${index + 1}`}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    
                    {/* 当前图片指示器 */}
                    {index === currentIndex && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center shadow-md">
                        ✓
                      </div>
                    )}
                    
                    {/* 图片编号 */}
                    <div className="absolute bottom-0.5 left-0.5 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded-full">
                      {index + 1}
                    </div>
                  </button>
                )
              }).filter(Boolean)}
            </div>
            
            {/* 导航提示 */}
            <div className="mt-2 p-2 bg-white/60 rounded-md border border-gray-200">
              <div className="text-xs text-gray-600 text-center">
                <div className="font-medium text-gray-700 mb-1">🎯 快捷鍵</div>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <div>← → 切換</div>
                  <div>+ - 縮放</div>
                  <div>R 旋轉</div>
                  <div>0 重置</div>
                  <div>Esc 關閉</div>
                  <div>💡 點擊跳轉</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 
 