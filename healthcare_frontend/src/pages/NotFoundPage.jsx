import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Home, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import i18n from '../utils/i18n.js'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    i18n.addListener(handleLanguageChange)
    return () => i18n.removeListener(handleLanguageChange)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="text-6xl text-blue-600 mb-4">404</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {i18n.t('pages.not_found.title')}
            </h1>
            <p className="text-gray-600">
              {i18n.t('pages.not_found.description')}
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/login')}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              {i18n.t('pages.not_found.back_to_home')}
            </Button>
            
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {i18n.t('pages.not_found.back_to_previous')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 