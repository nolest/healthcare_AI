import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { ArrowLeft, Activity, User, LogOut } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher.jsx'
import SymptomTracker from '../components/SymptomTracker.jsx'
import apiService from '../services/api.js'

export default function PatientSymptomPage() {
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
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
              <Activity className="h-8 w-8 text-orange-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">症狀追蹤</h1>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <SymptomTracker />
      </main>
    </div>
  )
} 