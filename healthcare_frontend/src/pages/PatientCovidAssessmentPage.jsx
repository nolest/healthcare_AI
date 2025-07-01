import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Shield, History } from 'lucide-react'
import PatientHeader from '../components/ui/PatientHeader.jsx'
import CovidFluAssessmentForm from '../components/covid-flu/CovidFluAssessmentForm.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n.js'

export default function PatientCovidAssessmentPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    
    // 检查用户权限
    checkUserPermission()
    
    return () => {
      i18n.removeListener(handleLanguageChange)
    }
  }, [])

  const checkUserPermission = async () => {
    try {
      const currentUser = await apiService.getCurrentUser()
      if (currentUser.role === 'medical_staff') {
        navigate('/medical-staff')
        return
      }
      setUser(currentUser)
    } catch (error) {
      console.error('权限检查失败:', error)
      navigate('/login')
    }
  }

  const handleAssessmentComplete = (newAssessment) => {
    // 评估完成后跳转到结果页面，传递评估结果数据
    console.log('评估完成:', newAssessment)
    navigate('/patient/covid-assessment/result', {
      state: { assessmentResult: newAssessment }
    })
  }

  const t = (key) => {
    language; // 确保组件依赖于language状态
    return i18n.t(key)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <PatientHeader 
        title="COVID/流感健康評估"
        subtitle="個人健康監測與風險評估"
        icon={Shield}
        showBackButton={true}
        user={user}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        {/* 功能区域 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              進行健康評估
            </h3>
            <Button
              variant="outline"
              onClick={() => navigate('/patient/covid-assessment/history')}
              className="flex items-center gap-2 bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-md border-purple-200 hover:border-purple-300 hover:bg-white/80 text-purple-700 hover:text-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
            >
              <History className="h-4 w-4" />
              查看歷史
            </Button>
          </div>
          <p className="text-gray-600/80 text-sm mb-6">
            基於WHO和CDC指導原則的專業健康風險評估工具
          </p>
          <CovidFluAssessmentForm 
            user={user}
            onAssessmentComplete={handleAssessmentComplete}
          />
        </div>
      </main>
    </div>
  )
} 