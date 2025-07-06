import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Activity,
  TestTube
} from 'lucide-react'
import MedicalHeader from '../components/ui/MedicalHeader.jsx'
import TestingIsolationGuidance from '../components/TestingIsolationGuidance.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n.js'

export default function MedicalGuidancePage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    // 检查用户是否已登录
    const userData = apiService.getCurrentUser()
    if (!userData) {
      navigate('/login')
      return
    }
    
    // 检查用户角色是否为医护人员
    if (userData.role !== 'medical_staff') {
      navigate('/login')
      return
    }

    setCurrentUser(userData)
  }, [navigate])

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    i18n.addListener(handleLanguageChange)
    return () => i18n.removeListener(handleLanguageChange)
  }, [])

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{i18n.t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <MedicalHeader 
        title={i18n.t('pages.medical_guidance.title')}
        subtitle={i18n.t('pages.medical_guidance.subtitle')}
        icon={Activity}
        showBackButton={true}
        user={currentUser}
        onBack={() => navigate('/medical')}
      />

      {/* Main Content */}
      <main className="pt-24">
        <TestingIsolationGuidance />
      </main>
    </div>
  )
} 