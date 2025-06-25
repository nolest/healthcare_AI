import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import DiagnosisForm from '../components/DiagnosisForm.jsx'
import { Button } from '../components/ui/button.jsx'
import { ArrowLeft, LogOut } from 'lucide-react'
import apiService from '../services/api.js'
import i18n from '../utils/i18n.js'

export default function DiagnosisPage() {
  const navigate = useNavigate()
  const { patientId } = useParams()
  const [currentUser, setCurrentUser] = useState(null)
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

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

    // 获取患者信息
    if (patientId) {
      fetchPatientData(patientId)
    }

    setLoading(false)
  }, [navigate, patientId])

  const fetchPatientData = async (patientId) => {
    try {
      // 首先尝试直接通过用户API获取患者信息（包含历史测量数据）
      try {
        console.log('Fetching patient data directly from users API:', patientId)
        const patientData = await apiService.getUserById(patientId)
        
        if (patientData && patientData.role === 'patient') {
          console.log('Patient found with history_measurements:', patientData.history_measurements?.length || 0)
          // 确保患者对象有完整的ID字段
          const patientWithId = {
            ...patientData,
            id: patientData._id || patientData.id
          }
          setPatient(patientWithId)
          return
        }
      } catch (directError) {
        console.warn('Direct user API call failed, trying patient list:', directError.message)
      }
      
      // 备用方案：通过患者列表API获取患者信息
      const patients = await apiService.getPatients()
      const patientData = patients.find(p => 
        p._id === patientId || p.id === patientId || p.username === patientId
      )
      
      if (patientData) {
        console.log('Patient found from list:', patientData)
        // 确保患者对象有完整的ID字段
        const patientWithId = {
          ...patientData,
          id: patientData._id || patientData.id
        }
        setPatient(patientWithId)
      } else {
        console.error('Patient not found:', patientId)
        alert(`找不到患者 ID: ${patientId}`)
        navigate('/medical')
      }
    } catch (error) {
      console.error('Error fetching patient data:', error)
      alert('获取患者信息失败')
      navigate('/medical')
    }
  }

  const handleLogout = () => {
    apiService.logout()
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
                  <span className="text-blue-900">{patient._id || patient.id || patient.username || '未知'}</span>
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