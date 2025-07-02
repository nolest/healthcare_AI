import React, { useState } from 'react'
import { Button } from './ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx'
import { Image, Eye } from 'lucide-react'
import ImagePreview from './ui/ImagePreview.jsx'

/**
 * 图片预览组件使用示例
 * 演示如何在项目中使用 ImagePreview 组件
 */
const ImagePreviewExample = () => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewImages, setPreviewImages] = useState([])
  const [initialIndex, setInitialIndex] = useState(0)

  // 示例图片数据
  const sampleImages = [
    'https://picsum.photos/800/600?random=1',
    'https://picsum.photos/800/600?random=2',
    'https://picsum.photos/800/600?random=3',
    'https://picsum.photos/800/600?random=4',
    'https://picsum.photos/800/600?random=5'
  ]

  // 打开图片预览
  const openPreview = (images, index = 0) => {
    setPreviewImages(images)
    setInitialIndex(index)
    setIsPreviewOpen(true)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            图片预览组件使用示例
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* 单张图片预览 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">单张图片预览</h3>
            <div className="flex items-center gap-4">
              <img
                src={sampleImages[0]}
                alt="示例图片"
                className="w-32 h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => openPreview([sampleImages[0]], 0)}
              />
              <div>
                <p className="text-sm text-gray-600 mb-2">点击图片查看大图</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openPreview([sampleImages[0]], 0)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  预览图片
                </Button>
              </div>
            </div>
          </div>

          {/* 多张图片预览 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">多张图片预览</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-3">
                {sampleImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`示例图片 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openPreview(sampleImages, index)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                      <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => openPreview(sampleImages, 0)}
                >
                  <Image className="h-4 w-4 mr-2" />
                  查看所有图片 ({sampleImages.length}张)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openPreview(sampleImages, 2)}
                >
                  从第3张开始预览
                </Button>
              </div>
            </div>
          </div>

          {/* 使用说明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">组件功能特性</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 支持多图浏览，左右箭头或键盘方向键切换</li>
              <li>• 支持图片缩放，可使用 +/- 键或鼠标滚轮</li>
              <li>• 支持图片旋转，使用 R 键或工具栏按钮</li>
              <li>• 支持图片下载功能</li>
              <li>• 支持全屏模式，使用 F 键切换</li>
              <li>• 支持拖拽移动（缩放后）</li>
              <li>• 底部缩略图快速跳转</li>
              <li>• 完整的键盘快捷键支持</li>
            </ul>
          </div>

          {/* 代码示例 */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">使用代码示例</h4>
            <pre className="text-sm text-gray-800 overflow-x-auto">
{`import ImagePreview from './ui/ImagePreview.jsx'

// 在组件中使用
const [isPreviewOpen, setIsPreviewOpen] = useState(false)
const [previewImages, setPreviewImages] = useState([])
const [initialIndex, setInitialIndex] = useState(0)

// 打开预览
const openPreview = (images, index = 0) => {
  setPreviewImages(images)
  setInitialIndex(index)
  setIsPreviewOpen(true)
}

// 在JSX中渲染
<ImagePreview
  images={previewImages}
  isOpen={isPreviewOpen}
  onClose={() => setIsPreviewOpen(false)}
  initialIndex={initialIndex}
  showDownload={true}
  showRotate={true}
  showZoom={true}
  showNavigation={true}
  maxZoom={5}
  minZoom={0.1}
  zoomStep={0.2}
/>`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* 图片预览组件 */}
      <ImagePreview
        images={previewImages}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        initialIndex={initialIndex}
        showDownload={true}
        showRotate={true}
        showZoom={true}
        showNavigation={true}
        maxZoom={5}
        minZoom={0.1}
        zoomStep={0.2}
      />
    </div>
  )
}

export default ImagePreviewExample