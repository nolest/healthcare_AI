import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import MedicalStaffDashboard from '../components/MedicalStaffDashboard.jsx'

export default function MedicalStaffPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // 检查用户是否已登录
    const user = localStorage.getItem('currentUser')
    if (!user) {
      navigate('/login')
      return
    }

    const userData = JSON.parse(user)
    
    // 检查用户角色是否为医护人员
    if (userData.role !== 'medical_staff') {
      navigate('/login')
      return
    }

    setCurrentUser(userData)
  }, [navigate])

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主要内容 */}
      <main>
        <MedicalStaffDashboard />
      </main>
    </div>
  )
} 