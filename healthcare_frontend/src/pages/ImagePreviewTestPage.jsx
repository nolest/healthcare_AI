import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/button.jsx'
import { useNavigate } from 'react-router-dom'
import ImagePreviewExample from '../components/ImagePreviewExample.jsx'

const ImagePreviewTestPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                图片预览组件测试
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-8">
        <ImagePreviewExample />
      </main>
    </div>
  )
}

export default ImagePreviewTestPage