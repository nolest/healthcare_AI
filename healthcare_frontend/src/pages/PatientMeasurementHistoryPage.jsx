import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { ArrowLeft, History, User, LogOut } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher.jsx'
import MeasurementHistory from '../components/MeasurementHistory.jsx'
import apiService from '../services/api.js'

export default function PatientMeasurementHistoryPage() {
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
                onClick={() => navigate('/patient/measurement')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回測量
              </Button>
              <History className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">測量歷史記錄</h1>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-purple-600" />
            您的生命體徵測量歷史
          </h2>
          <p className="text-gray-600 mb-6">
            查看您過往的所有生命體徵測量記錄，包括血壓、心率、體溫、血氧飽和度等數據。
          </p>
          <MeasurementHistory />
        </div>
      </main>
    </div>
  )
} 