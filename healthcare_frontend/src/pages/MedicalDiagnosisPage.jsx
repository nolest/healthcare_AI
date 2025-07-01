import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FileText
} from 'lucide-react'
import MedicalHeader from '../components/ui/MedicalHeader.jsx'
import DiagnosisForm from '../components/DiagnosisForm.jsx'
import apiService from '../services/api.js'

export default function MedicalDiagnosisPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <MedicalHeader 
        title="診斷評估"
        subtitle="進行患者診斷與治療建議"
        icon={FileText}
        showBackButton={true}
        user={currentUser}
        onBack={() => navigate('/medical')}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <DiagnosisForm />
      </main>
    </div>
  )
} 