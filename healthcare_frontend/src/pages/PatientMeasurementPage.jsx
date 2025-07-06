import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Activity, Plus, History } from 'lucide-react'
import PatientHeader from '../components/ui/PatientHeader.jsx'
import MeasurementForm from '../components/MeasurementForm.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n'

export default function PatientMeasurementPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    // 监听语言变化
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    
    return () => {
      i18n.removeListener(handleLanguageChange)
    }
  }, [])

  useEffect(() => {
    const currentUser = apiService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    } else {
      navigate('/login')
    }
  }, [navigate])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{i18n.t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-teal-200/20 to-green-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <PatientHeader 
        title={i18n.t('pages.patient_measurement.title')}
        subtitle={i18n.t('pages.patient_measurement.subtitle')}
        icon={Activity}
        showBackButton={true}
        user={user}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        {/* 功能区域 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              {i18n.t('pages.patient_measurement.new_measurement_title')}
            </h3>
            <Button
              variant="outline"
              onClick={() => navigate('/patient/measurement/history')}
              className="flex items-center gap-2 bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-md border-blue-200 hover:border-blue-300 hover:bg-white/80 text-blue-700 hover:text-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
            >
              <History className="h-4 w-4" />
              {i18n.t('pages.patient_measurement.view_history')}
            </Button>
          </div>
          <p className="text-gray-600/80 text-sm mb-6">
            {i18n.t('pages.patient_measurement.description')}
          </p>
          <MeasurementForm />
        </div>
      </main>
    </div>
  )
} 