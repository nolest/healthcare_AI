import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.jsx'
import { 
  User, 
  Activity,
  Heart,
  Thermometer,
  Droplets,
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Stethoscope
} from 'lucide-react'
import MedicalHeader from '../components/ui/MedicalHeader.jsx'
import apiService from '../services/api.js'

export default function PatientDetailPage() {
  const navigate = useNavigate()
  const { patientId } = useParams()
  const [currentUser, setCurrentUser] = useState(null)
  const [patient, setPatient] = useState(null)
  const [measurements, setMeasurements] = useState([])
  const [diagnoses, setDiagnoses] = useState([])
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
    loadPatientData()
  }, [navigate, patientId])

  const loadPatientData = async () => {
    try {
      setLoading(true)
      
      // 获取患者基本信息
      const patientData = await apiService.getUserById(patientId)
      
      // 获取患者的测量记录
      const measurementsData = await apiService.getPatientMeasurements(patientId)
      
      // 获取患者的诊断记录
      let diagnosesData = []
      try {
        diagnosesData = await apiService.getPatientDiagnoses(patientId)
      } catch (error) {
        console.warn('无法获取诊断记录:', error)
      }

      // 计算年龄
      const age = patientData.dateOfBirth 
        ? Math.floor((new Date() - new Date(patientData.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
        : null

      setPatient({ ...patientData, age })
      setMeasurements(measurementsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
      setDiagnoses(diagnosesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))

    } catch (error) {
      console.error('加载患者数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return '未設定'
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getMeasurementStatus = (measurement) => {
    const abnormalConditions = []

    if (measurement.systolic && (measurement.systolic > 140 || measurement.systolic < 90)) {
      abnormalConditions.push('血壓')
    }
    if (measurement.diastolic && (measurement.diastolic > 90 || measurement.diastolic < 60)) {
      abnormalConditions.push('血壓')
    }
    if (measurement.heartRate && (measurement.heartRate > 100 || measurement.heartRate < 60)) {
      abnormalConditions.push('心率')
    }
    if (measurement.temperature && (measurement.temperature > 37.3 || measurement.temperature < 36.0)) {
      abnormalConditions.push('體溫')
    }
    if (measurement.oxygenSaturation && measurement.oxygenSaturation < 95) {
      abnormalConditions.push('血氧')
    }

    return abnormalConditions.length > 0 ? { isAbnormal: true, conditions: abnormalConditions } : { isAbnormal: false, conditions: [] }
  }

  const renderMeasurementCard = (measurement) => {
    const status = getMeasurementStatus(measurement)
    
    return (
      <Card key={measurement._id} className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              生命體徵測量
            </CardTitle>
            {status.isAbnormal ? (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                異常
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-200">
                <CheckCircle className="h-3 w-3" />
                正常
              </Badge>
            )}
          </div>
          <CardDescription className="text-gray-600">
            {formatDateTime(measurement.timestamp)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {measurement.systolic && measurement.diastolic && (
              <div className="text-center p-3 bg-blue-50/70 rounded-xl">
                <Activity className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600">血壓</p>
                <p className="font-semibold text-gray-800">
                  {measurement.systolic}/{measurement.diastolic} mmHg
                </p>
              </div>
            )}
            
            {measurement.heartRate && (
              <div className="text-center p-3 bg-red-50/70 rounded-xl">
                <Heart className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600">心率</p>
                <p className="font-semibold text-gray-800">{measurement.heartRate} bpm</p>
              </div>
            )}
            
            {measurement.temperature && (
              <div className="text-center p-3 bg-orange-50/70 rounded-xl">
                <Thermometer className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600">體溫</p>
                <p className="font-semibold text-gray-800">{measurement.temperature}°C</p>
              </div>
            )}
            
            {measurement.oxygenSaturation && (
              <div className="text-center p-3 bg-cyan-50/70 rounded-xl">
                <Droplets className="h-5 w-5 text-cyan-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600">血氧</p>
                <p className="font-semibold text-gray-800">{measurement.oxygenSaturation}%</p>
              </div>
            )}
          </div>
          
          {measurement.notes && (
            <div className="mt-4 p-3 bg-gray-50/70 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">備註:</p>
              <p className="text-gray-800">{measurement.notes}</p>
            </div>
          )}
          
          {measurement.location && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">測量地點:</span> {measurement.location}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderDiagnosisCard = (diagnosis) => {
    return (
      <Card key={diagnosis._id} className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-green-600" />
            醫護診斷
          </CardTitle>
          <CardDescription className="text-gray-600">
            {formatDateTime(diagnosis.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {diagnosis.diagnosis && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">診斷結果</h4>
                <p className="text-gray-700 bg-blue-50/70 p-3 rounded-xl">{diagnosis.diagnosis}</p>
              </div>
            )}
            
            {diagnosis.recommendations && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">治療建議</h4>
                <div className="space-y-2">
                  {typeof diagnosis.recommendations === 'string' ? (
                    <p className="text-gray-700 bg-green-50/70 p-3 rounded-xl">{diagnosis.recommendations}</p>
                  ) : (
                    <>
                      {diagnosis.recommendations.medications && (
                        <div className="bg-green-50/70 p-3 rounded-xl">
                          <p className="font-medium text-green-800 mb-1">用藥建議:</p>
                          <p className="text-gray-700">{diagnosis.recommendations.medications}</p>
                        </div>
                      )}
                      {diagnosis.recommendations.lifestyle && (
                        <div className="bg-blue-50/70 p-3 rounded-xl">
                          <p className="font-medium text-blue-800 mb-1">生活方式建議:</p>
                          <p className="text-gray-700">{diagnosis.recommendations.lifestyle}</p>
                        </div>
                      )}
                      {diagnosis.recommendations.followUp && (
                        <div className="bg-orange-50/70 p-3 rounded-xl">
                          <p className="font-medium text-orange-800 mb-1">隨訪建議:</p>
                          <p className="text-gray-700">{diagnosis.recommendations.followUp}</p>
                        </div>
                      )}
                      {diagnosis.recommendations.nextCheckup && (
                        <div className="bg-purple-50/70 p-3 rounded-xl">
                          <p className="font-medium text-purple-800 mb-1">下次檢查:</p>
                          <p className="text-gray-700 flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(diagnosis.recommendations.nextCheckup)}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            
            {diagnosis.doctorId && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">診斷醫師:</span> {diagnosis.doctorName || diagnosis.doctorId}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading || !currentUser || !patient) {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <MedicalHeader 
        title="患者詳情"
        subtitle={`${patient.fullName || patient.username} 的醫療記錄`}
        icon={User}
        showBackButton={true}
        user={currentUser}
        onBack={() => navigate('/medical/patients-management')}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        {/* 患者基本信息 */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-green-500/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <User className="h-6 w-6 text-green-600" />
                患者基本信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50/70 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">姓名</p>
                  <p className="font-semibold text-gray-800">{patient.fullName || patient.username}</p>
                </div>
                <div className="text-center p-4 bg-green-50/70 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">年齡</p>
                  <p className="font-semibold text-gray-800">{patient.age ? `${patient.age}歲` : '未知'}</p>
                </div>
                <div className="text-center p-4 bg-purple-50/70 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">注冊時間</p>
                  <p className="font-semibold text-gray-800">{formatDate(patient.createdAt)}</p>
                </div>
                <div className="text-center p-4 bg-orange-50/70 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">記錄統計</p>
                  <div className="flex justify-center gap-4">
                    <span className="text-blue-600 font-semibold">{measurements.length} 測量</span>
                    <span className="text-green-600 font-semibold">{diagnoses.length} 診斷</span>
                  </div>
                </div>
              </div>
              
              {patient.email && (
                <div className="mt-4 p-3 bg-gray-50/70 rounded-xl">
                  <p className="text-sm text-gray-600">聯絡方式: {patient.email}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 医疗记录 */}
        <div>
          <Tabs defaultValue="measurements" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-lg">
              <TabsTrigger value="measurements" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                測量記錄 ({measurements.length})
              </TabsTrigger>
              <TabsTrigger value="diagnoses" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                診斷記錄 ({diagnoses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="measurements" className="space-y-6">
              {measurements.length === 0 ? (
                <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-lg">
                  <CardContent className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">暫無測量記錄</p>
                  </CardContent>
                </Card>
              ) : (
                measurements.map(renderMeasurementCard)
              )}
            </TabsContent>

            <TabsContent value="diagnoses" className="space-y-6">
              {diagnoses.length === 0 ? (
                <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-lg">
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">暫無診斷記錄</p>
                  </CardContent>
                </Card>
              ) : (
                diagnoses.map(renderDiagnosisCard)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
} 