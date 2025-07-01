import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Activity, Plus, History } from 'lucide-react'
import PatientHeader from '../components/ui/PatientHeader.jsx'
import MeasurementForm from '../components/MeasurementForm.jsx'
import apiService from '../services/api.js'

export default function PatientMeasurementPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

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
          <p className="mt-4 text-gray-600">載入中...</p>
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
        title="生命體徵管理"
        subtitle="記錄和監測您的健康數據"
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
              記錄新的生命體徵測量
            </h3>
            <Button
              variant="outline"
              onClick={() => navigate('/patient/measurement/history')}
              className="flex items-center gap-2 bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-md border-blue-200 hover:border-blue-300 hover:bg-white/80 text-blue-700 hover:text-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
            >
              <History className="h-4 w-4" />
              查看歷史
            </Button>
          </div>
          <p className="text-gray-600/80 text-sm mb-6">
            記錄您的生命體徵測量數據，追蹤健康狀態變化
          </p>
          <MeasurementForm />
        </div>
      </main>
    </div>
  )
} 