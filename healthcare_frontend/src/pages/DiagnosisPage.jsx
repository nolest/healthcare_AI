import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import DiagnosisForm from '../components/DiagnosisForm.jsx'
import { Button } from '../components/ui/button.jsx'
import { ArrowLeft, LogOut } from 'lucide-react'
import mockDataStore from '../utils/mockDataStore.js'
import i18n from '../utils/i18n.js'

export default function DiagnosisPage() {
  const navigate = useNavigate()
  const { patientId } = useParams()
  const [currentUser, setCurrentUser] = useState(null)
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

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

    // 获取患者信息
    if (patientId) {
      console.log('Looking for patient with ID:', patientId, typeof patientId)
      const allUsers = mockDataStore.getUsers()
      console.log('All users:', allUsers.map(u => ({ id: u.id, username: u.username, fullName: u.fullName, role: u.role })))
      
      // 尝试匹配ID，支持多种匹配方式
      const patientData = allUsers.find(u => {
        if (u.role !== 'patient') return false
        
        // 尝试多种匹配方式：
        // 1. 直接ID匹配（字符串和数字）
        const idMatch = u.id.toString() === patientId.toString()
        // 2. username匹配
        const usernameMatch = u.username === patientId
        
        const match = idMatch || usernameMatch
        console.log(`Checking user ${u.fullName} (ID: ${u.id}, username: ${u.username}, role: ${u.role}):`, {
          patientIdParam: patientId,
          userIdString: u.id.toString(),
          idMatch, 
          usernameMatch, 
          finalMatch: match
        })
        return match
      })
      
      if (patientData) {
        console.log('Patient found:', patientData)
        setPatient(patientData)
      } else {
        console.error('Patient not found:', patientId)
        console.error('Available patients:', allUsers.filter(u => u.role === 'patient'))
        alert(`找不到患者 ID: ${patientId}。可能的原因：\n1. 患者不存在\n2. ID 不匹配\n3. 用户角色不是患者`)
        navigate('/medical')
        return
      }
    }

    setLoading(false)
  }, [navigate, patientId])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    navigate('/login')
  }

  const handleBackToMedical = () => {
    navigate('/medical')
  }

  const handleDiagnosisComplete = () => {
    // 诊断完成后返回医护人员页面
    navigate('/medical')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  if (!currentUser || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">無法載入頁面，請重新登錄</p>
          <Button onClick={() => navigate('/login')} className="mt-4">
            返回登錄
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBackToMedical}
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>返回</span>
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                🏥 診斷患者 - {patient.fullName}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {currentUser.fullName} 醫師
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                登出
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              患者診斷
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">患者信息</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-700">姓名：</span>
                  <span className="text-blue-900">{patient.fullName}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">用戶名：</span>
                  <span className="text-blue-900">{patient.username}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">患者ID：</span>
                  <span className="text-blue-900">{patient.id}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">角色：</span>
                  <span className="text-blue-900">患者</span>
                </div>
              </div>
            </div>
          </div>

          {/* 调试信息 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-4 bg-gray-100 rounded-lg">
              <h4 className="font-semibold mb-2">调试信息 (开发环境):</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(patient, null, 2)}
              </pre>
            </div>
          )}

          <DiagnosisForm 
            patient={patient} 
            onDiagnosisAdded={handleDiagnosisComplete}
          />
        </div>
      </main>
    </div>
  )
} 