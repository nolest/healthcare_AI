import { useState } from 'react'
import { Button } from './ui/button.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog.jsx'
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react'
import apiService from '../services/api.js'
import { getDisplayFilenameFromPath } from '../utils/filename.utils.js'

export default function ImageViewer({ images = [], userId, isOpen, onClose, initialIndex = 0, imageUrls = null }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

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
        <DialogContent className="max-w-md">
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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex flex-col">
              <span>患者症狀圖片 ({currentIndex + 1}/{images.length})</span>
              <span className="text-sm text-gray-600 font-normal">{displayName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={rotate}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={downloadImage}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetTransform}>
                重置
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative flex-1 overflow-hidden bg-gray-100">
          <div className="flex items-center justify-center h-[60vh] p-4">
            <img
              src={imageUrl}
              alt={`患者症狀圖片 ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                cursor: zoom > 1 ? 'grab' : 'default'
              }}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3lpLHotKU8L3RleHQ+Cjwvc3ZnPg=='
              }}
            />
          </div>
          
          {/* 导航按钮 */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="lg"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={prevImage}
              >
                ←
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={nextImage}
              >
                →
              </Button>
            </>
          )}
        </div>
        
        {/* 缩略图导航 */}
        {images.length > 1 && (
          <div className="p-4 border-t">
            <div className="flex space-x-2 overflow-x-auto">
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
                    className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden ${
                      index === currentIndex ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    onClick={() => {
                      setCurrentIndex(index)
                      resetTransform()
                    }}
                  >
                    <img
                      src={thumbUrl}
                      alt={`縮圖 ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </button>
                )
              }).filter(Boolean)}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 
 