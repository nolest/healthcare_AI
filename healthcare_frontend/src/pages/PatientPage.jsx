import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PatientDashboard from '../components/PatientDashboard.jsx'
import apiService from '../services/api.js'

export default function PatientPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // 检查用户是否已登录
    const userData = apiService.getCurrentUser()
    if (!userData) {
      navigate('/login')
      return
    }
    
    // 检查用户角色是否为患者
    if (userData.role !== 'patient') {
      navigate('/login')
      return
    }

    setCurrentUser(userData)
  }, [navigate])

  if (!currentUser) {
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
    <div className="min-h-screen bg-gray-50">
      {/* 主要内容 */}
      <main>
        <PatientDashboard />
      </main>
    </div>
  )
} 