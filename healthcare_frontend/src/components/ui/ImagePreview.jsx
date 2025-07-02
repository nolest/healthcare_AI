import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog.jsx'
import { Button } from './button.jsx'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  RotateCw, 
  RotateCcw,
  Maximize2,
  Minimize2
} from 'lucide-react'

const ImagePreview = ({ 
  images = [], 
  isOpen = false, 
  onClose = () => {}, 
  initialIndex = 0,
  showDownload = true,
  showRotate = true,
  showZoom = true,
  showNavigation = true,
  maxZoom = 5,
  minZoom = 0.1,
  zoomStep = 0.2
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const imageRef = useRef(null)
  const containerRef = useRef(null)

  // 重置图片状态
  const resetImageState = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setImageLoaded(false)
    setImageError(false)
  }

  // 当图片索引改变时重置状态
  useEffect(() => {
    resetImageState()
  }, [currentIndex])

  // 当组件打开时重置到初始索引
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      resetImageState()
    }
  }, [isOpen, initialIndex])

  // 键盘事件处理
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          if (showNavigation) handlePrevious()
          break
        case 'ArrowRight':
          if (showNavigation) handleNext()
          break
        case '+':
        case '=':
          if (showZoom) handleZoomIn()
          break
        case '-':
          if (showZoom) handleZoomOut()
          break
        case '0':
          resetImageState()
          break
        case 'r':
          if (showRotate) handleRotateRight()
          break
        case 'R':
          if (showRotate) handleRotateLeft()
          break
        case 'f':
          toggleFullscreen()
          break
        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, showNavigation, showZoom, showRotate])

  // 导航函数
  const handlePrevious = () => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const handleNext = () => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }
  }

  // 缩放函数
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + zoomStep, maxZoom))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - zoomStep, minZoom))
  }

  // 旋转函数
  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360)
  }

  // 全屏切换
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // 下载图片
  const handleDownload = async () => {
    if (!images[currentIndex]) return

    try {
      const response = await fetch(images[currentIndex])
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `image_${currentIndex + 1}_${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('下载图片失败:', error)
    }
  }

  // 鼠标拖拽处理
  const handleMouseDown = (e) => {
    if (scale <= 1) return
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 滚轮缩放
  const handleWheel = (e) => {
    if (!showZoom) return
    
    // 检查是否可以阻止默认行为
    if (e.cancelable) {
      e.preventDefault()
    }
    const delta = e.deltaY > 0 ? -zoomStep : zoomStep
    setScale((prev) => Math.max(minZoom, Math.min(maxZoom, prev + delta)))
  }

  // 图片加载处理
  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageLoaded(false)
    setImageError(true)
  }

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`${
          isFullscreen 
            ? 'fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none' 
            : 'w-[80vw] h-[45vw] max-w-[80vw] max-h-[80vh]'
        } p-0 bg-black/95 border-0 overflow-hidden`}
        style={{
          aspectRatio: isFullscreen ? 'auto' : '16/9',
          minWidth: isFullscreen ? 'auto' : '600px',
          minHeight: isFullscreen ? 'auto' : '337px'
        }}
      >
        {/* 顶部工具栏 */}
        <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between text-white">
            <DialogTitle className="text-lg font-medium">
              图片预览 ({currentIndex + 1} / {images.length})
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              {/* 缩放控制 */}
              {showZoom && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={scale <= minZoom}
                    className="text-white hover:bg-white/20"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm min-w-[60px] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={scale >= maxZoom}
                    className="text-white hover:bg-white/20"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* 旋转控制 */}
              {showRotate && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRotateLeft}
                    className="text-white hover:bg-white/20"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRotateRight}
                    className="text-white hover:bg-white/20"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* 全屏切换 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>

              {/* 下载按钮 */}
              {showDownload && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}

              {/* 关闭按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* 图片容器 */}
        <div 
          ref={(el) => {
            containerRef.current = el
            if (el) {
              // 使用非被动监听器来处理滚轮事件
              el.addEventListener('wheel', handleWheel, { passive: false })
              return () => el.removeEventListener('wheel', handleWheel)
            }
          }}
          className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          {/* 导航按钮 - 左 */}
          {showNavigation && images.length > 1 && (
            <Button
              variant="ghost"
              size="lg"
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full w-12 h-12"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {/* 图片 */}
          <div className="relative">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}

            {imageError && (
              <div className="flex items-center justify-center text-white text-center p-8">
                <div>
                  <div className="text-4xl mb-4">🖼️</div>
                  <div>图片加载失败</div>
                  <div className="text-sm text-gray-400 mt-2">请检查图片路径是否正确</div>
                </div>
              </div>
            )}

            <img
              ref={imageRef}
              src={currentImage}
              alt={`图片 ${currentIndex + 1}`}
              className="max-w-none transition-all duration-200 ease-out"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                maxHeight: isFullscreen ? '100vh' : '40vw',
                maxWidth: isFullscreen ? '100vw' : '75vw',
                width: scale === 1 ? (isFullscreen ? '85vw' : '70vw') : 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: imageLoaded ? 'block' : 'none'
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              draggable={false}
            />
          </div>

          {/* 导航按钮 - 右 */}
          {showNavigation && images.length > 1 && (
            <Button
              variant="ghost"
              size="lg"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full w-12 h-12"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}
        </div>

        {/* 底部缩略图导航 */}
        {showNavigation && images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4">
            <div className="flex justify-center gap-2 overflow-x-auto max-w-full">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex 
                      ? 'border-blue-500 ring-2 ring-blue-500/50' 
                      : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <img
                    src={image}
                    alt={`缩略图 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 操作提示 */}
        <div className="absolute bottom-4 left-4 text-white/70 text-xs space-y-1">
          <div>快捷键提示:</div>
          <div>← → 切换图片 | + - 缩放 | R 旋转 | F 全屏 | ESC 关闭</div>
          {scale > 1 && <div>拖拽移动图片 | 滚轮缩放</div>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ImagePreview