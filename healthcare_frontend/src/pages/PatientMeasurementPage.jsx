import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { ArrowLeft, Activity, User, LogOut, Plus, History } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher.jsx'
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/patient')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回菜單
              </Button>
              <Activity className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">生命體徵管理</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-700">{user?.username}</span>
              </div>
              <Button variant="outline" onClick={() => {
                apiService.logout()
                window.location.href = '/login'
              }}>
                <LogOut className="h-4 w-4 mr-2" />
                登出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              記錄新的生命體徵測量
            </h2>
            <Button
              variant="outline"
              onClick={() => navigate('/patient/measurement/history')}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              查看歷史
            </Button>
          </div>
          <MeasurementForm />
        </div>
      </main>
    </div>
  )
} 