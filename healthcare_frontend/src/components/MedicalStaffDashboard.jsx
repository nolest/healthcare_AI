import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.jsx'
import { Badge } from './ui/badge.jsx'
import { Alert, AlertDescription } from './ui/alert.jsx'
import { 
  Stethoscope, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  LogOut, 
  User,
  Clock,
  TrendingUp,
  FileText,
  Shield,
  TestTube,
  Activity
} from 'lucide-react'
import PatientList from './PatientList'
import DiagnosisForm from './DiagnosisForm'
import CovidFluAssessment from './CovidFluAssessment'
import TestingIsolationGuidance from './TestingIsolationGuidance'
import PatientCovidAssessments from './PatientCovidAssessments'
import LanguageSwitcher from './LanguageSwitcher'
import mockDataStore from '../utils/mockDataStore'
import i18n from '../utils/i18n'

export default function MedicalStaffDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [pendingPatients, setPendingPatients] = useState([])
  const [recentDiagnoses, setRecentDiagnoses] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientCovidAssessments, setShowPatientCovidAssessments] = useState(false)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())
  const [user, setUser] = useState(null)

  useEffect(() => {
    // 監聽語言變化
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    
    return () => {
      i18n.removeListener(handleLanguageChange)
    }
  }, [])

  useEffect(() => {
    // 获取当前用户信息
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing saved user:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchData()
      
      // 添加mockDataStore監聽器，當數據變化時自動刷新
      const handleDataChange = () => {
        console.log('Data changed, refreshing...')
        fetchData()
      }
      
      mockDataStore.addListener(handleDataChange)
      
      return () => {
        mockDataStore.removeListener(handleDataChange)
      }
    }
  }, [user])

  const fetchData = async () => {
    try {
      // 直接使用mockDataStore獲取數據
      const measurements = mockDataStore.getMeasurements()
      const diagnoses = mockDataStore.getDiagnoses()
      const users = mockDataStore.getUsers()
      
      console.log('Fetched data:', {
        measurements: measurements.length,
        diagnoses: diagnoses.length,
        users: users.length
      })
      
      // 生成待處理患者列表（有異常測量但沒有診斷的患者）
      const pendingList = []
      const measurementsByUser = {}
      
      // 按用戶分組測量記錄
      measurements.forEach(measurement => {
        if (!measurementsByUser[measurement.user_id]) {
          measurementsByUser[measurement.user_id] = []
        }
        measurementsByUser[measurement.user_id].push(measurement)
      })
      
      // 檢查每個用戶是否有待處理的異常測量記錄
      Object.keys(measurementsByUser).forEach(userId => {
        const userMeasurements = measurementsByUser[userId]
        const pendingAbnormalMeasurements = userMeasurements.filter(m => 
          m.is_abnormal && (m.status !== 'processed')
        )
        const hasPendingAbnormal = pendingAbnormalMeasurements.length > 0
        
        console.log(`User ${userId}:`, {
          measurementCount: userMeasurements.length,
          abnormalMeasurements: userMeasurements.filter(m => m.is_abnormal).length,
          pendingAbnormalMeasurements: pendingAbnormalMeasurements.length,
          hasPendingAbnormal
        })
        
        if (hasPendingAbnormal) {
          const user = users.find(u => u.username === userId)
          const latestMeasurement = userMeasurements[userMeasurements.length - 1]
          const pendingPatient = {
            id: userId,
            username: userId,
            name: user ? user.fullName : `Patient ${userId}`,
            fullName: user ? user.fullName : `Patient ${userId}`,
            latest_measurement: latestMeasurement,
            abnormal_count: userMeasurements.filter(m => m.is_abnormal).length,
            pending_abnormal_count: pendingAbnormalMeasurements.length
          }
          pendingList.push(pendingPatient)
          console.log('Added pending patient:', pendingPatient)
        }
      })
      
      console.log('Final pending patients list:', pendingList)
      
      setPendingPatients(pendingList)
      setRecentDiagnoses(diagnoses.slice(-5))
      
      // 計算統計數據
      const statsData = {
        total_diagnoses: diagnoses.length,
        pending_patients: pendingList.length,
        follow_up_required: diagnoses.filter(d => d.follow_up_required).length,
        patients_diagnosed: new Set(diagnoses.map(d => d.patient_id)).size,
        risk_level_distribution: {
          low: diagnoses.filter(d => d.risk_level === 'low').length,
          medium: diagnoses.filter(d => d.risk_level === 'medium').length,
          high: diagnoses.filter(d => d.risk_level === 'high').length,
          critical: diagnoses.filter(d => d.risk_level === 'critical').length
        }
      }
      
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDiagnosisComplete = () => {
    fetchData() // 重新獲取數據
    setSelectedPatient(null)
    setActiveTab('overview')
  }

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient)
    setActiveTab('diagnosis')
  }

  const handleViewPatientCovidAssessments = (patient) => {
    setSelectedPatient(patient)
    setShowPatientCovidAssessments(true)
  }

  const t = (key) => {
    // 通过引用 language 状态确保在语言变化时重新渲染
    language; // 这会让组件依赖于 language 状态
    return i18n.t(key)
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.medical_staff.title')}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{user?.username || 'Loading...'}</span>
              </div>
              <Button variant="outline" onClick={() => {
                localStorage.removeItem('currentUser')
                navigate('/login')
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2">{t('dashboard.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm px-2 py-2">{t('dashboard.tabs.pending')}</TabsTrigger>
            <TabsTrigger value="patients" className="text-xs sm:text-sm px-2 py-2">{t('dashboard.tabs.patient_mgmt')}</TabsTrigger>
            <TabsTrigger value="diagnosis" className="text-xs sm:text-sm px-2 py-2">{t('dashboard.tabs.diagnosis_eval')}</TabsTrigger>
            <TabsTrigger value="covid_flu" className="text-xs sm:text-sm px-2 py-2">COVID/流感</TabsTrigger>
            <TabsTrigger value="guidance" className="text-xs sm:text-sm px-2 py-2">指導建議</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* 調試功能 - 僅開發環境 */}
            {process.env.NODE_ENV === 'development' && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800">調試功能</CardTitle>
                  <CardDescription className="text-yellow-700">
                    開發環境專用功能，用於測試和調試
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        mockDataStore.reinitializeData()
                        alert('數據已重置！\n\n現在系統中有4個患者用戶，但沒有預設的測量數據。\n\n請患者登錄添加測量數據，如果有異常數據，會自動出現在待處理列表中。')
                      }}
                      className="border-yellow-400 text-yellow-700 hover:bg-yellow-100"
                    >
                      重置數據
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const stats = mockDataStore.getStats()
                        alert(`當前數據統計:\n用戶: ${stats.users}\n測量記錄: ${stats.measurements}\n診斷記錄: ${stats.diagnoses}`)
                      }}
                      className="border-blue-400 text-blue-700 hover:bg-blue-100"
                    >
                      查看數據統計
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const users = mockDataStore.getUsers()
                        const measurements = mockDataStore.getMeasurements()
                        const diagnoses = mockDataStore.getDiagnoses()
                        
                        // 查找谭咏麟用户
                        const tanUser = users.find(u => u.fullName.includes('谭') || u.fullName.includes('譚'))
                        
                        if (tanUser) {
                          const tanMeasurements = measurements.filter(m => m.user_id === tanUser.username)
                          const tanDiagnoses = diagnoses.filter(d => d.patient_id === tanUser.username)
                          const hasAbnormal = tanMeasurements.some(m => m.is_abnormal)
                          
                          alert(`谭咏麟数据分析:\n\n用户名: ${tanUser.username}\n姓名: ${tanUser.fullName}\n测量记录: ${tanMeasurements.length} 条\n异常测量: ${tanMeasurements.filter(m => m.is_abnormal).length} 条\n诊断记录: ${tanDiagnoses.length} 条\n\n有异常测量: ${hasAbnormal}\n有诊断记录: ${tanDiagnoses.length > 0}\n应该在待处理: ${hasAbnormal && tanDiagnoses.length === 0}\n\n${hasAbnormal && tanDiagnoses.length > 0 ? '原因: 已有诊断记录，不显示在待处理列表' : hasAbnormal ? '应该显示在待处理列表' : '没有异常测量记录'}`)
                        } else {
                          const patientUsers = users.filter(u => u.role === 'patient')
                          alert(`未找到谭咏麟用户\n\n现有患者用户:\n${patientUsers.map(u => `- ${u.fullName} (${u.username})`).join('\n')}`)
                        }
                      }}
                      className="border-green-400 text-green-700 hover:bg-green-100"
                    >
                                             分析谭咏麟数据
                     </Button>
                     <Button 
                       variant="outline"
                       onClick={() => {
                         const users = mockDataStore.getUsers()
                         const diagnoses = mockDataStore.getDiagnoses()
                         
                         // 查找谭咏麟用户
                         const tanUser = users.find(u => u.fullName.includes('谭') || u.fullName.includes('譚'))
                         
                         if (tanUser) {
                           const tanDiagnoses = diagnoses.filter(d => d.patient_id === tanUser.username)
                           if (tanDiagnoses.length > 0) {
                             if (confirm(`发现谭咏麟有 ${tanDiagnoses.length} 条诊断记录。\n\n是否清除这些诊断记录以便重新显示在待处理列表中？\n\n注意：这将删除所有相关的诊断数据。`)) {
                               // 清除谭咏麟的诊断记录
                               const filteredDiagnoses = diagnoses.filter(d => d.patient_id !== tanUser.username)
                               localStorage.setItem('healthcare_diagnoses', JSON.stringify(filteredDiagnoses))
                               
                               // 重新加载数据
                               fetchData()
                               
                               alert('谭咏麟的诊断记录已清除，现在应该会出现在待处理列表中。')
                             }
                           } else {
                             alert('谭咏麟没有诊断记录。请检查是否有异常测量数据。')
                           }
                         } else {
                           alert('未找到谭咏麟用户')
                         }
                       }}
                       className="border-red-400 text-red-700 hover:bg-red-100"
                     >
                       清除谭咏麟诊断记录
                     </Button>
                     <Button 
                       variant="outline"
                       onClick={() => navigate('/abnormal-settings')}
                       className="border-purple-400 text-purple-700 hover:bg-purple-100"
                     >
                       異常數據設置
                     </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.stats.total_diagnoses')}</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_diagnoses}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.stats.pending_patients')}</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pending_patients}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.stats.follow_up_required')}</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.follow_up_required}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.stats.patients_diagnosed')}</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.patients_diagnosed}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Risk Level Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.risk_distribution')}</CardTitle>
                <CardDescription>{t('dashboard.recent_30_days')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats?.risk_level_distribution.low || 0}</div>
                    <p className="text-sm text-gray-600">{t('dashboard.risk.low')}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats?.risk_level_distribution.medium || 0}</div>
                    <p className="text-sm text-gray-600">{t('dashboard.risk.medium')}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats?.risk_level_distribution.high || 0}</div>
                    <p className="text-sm text-gray-600">{t('dashboard.risk.high')}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats?.risk_level_distribution.critical || 0}</div>
                    <p className="text-sm text-gray-600">{t('dashboard.risk.critical')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Diagnoses */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.recent_diagnoses')}</CardTitle>
                <CardDescription>{recentDiagnoses.length === 0 ? t('dashboard.no_diagnoses') : `${recentDiagnoses.length} recent diagnoses`}</CardDescription>
              </CardHeader>
              <CardContent>
                {recentDiagnoses.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">{t('dashboard.no_diagnoses')}</p>
                ) : (
                  <div className="space-y-2">
                    {recentDiagnoses.map((diagnosis, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{diagnosis.patient_name || diagnosis.patient_id}</span>
                        <Badge variant={diagnosis.risk_level === 'high' || diagnosis.risk_level === 'critical' ? 'destructive' : 'secondary'}>
                          {diagnosis.risk_level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Tab */}
          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  待處理患者
                </CardTitle>
                <CardDescription>
                  {pendingPatients.length > 0 
                    ? `${pendingPatients.length} 位患者有異常測量結果，需要醫護人員診斷`
                    : '目前沒有待處理的患者'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingPatients.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">太好了！</h3>
                    <p className="text-gray-500">目前沒有需要處理的異常測量結果</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingPatients.map((patient) => {
                      const latestMeasurement = patient.latest_measurement;
                      
                      return (
                        <Card key={patient.id} className="border-l-4 border-l-red-500 bg-red-50/30">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <User className="h-5 w-5 text-blue-600" />
                                  {patient.name}
                                  <Badge variant="destructive" className="ml-2">
                                    緊急
                                  </Badge>
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  患者ID: {patient.id} | {patient.abnormal_count} 項異常測量
                                </CardDescription>
                              </div>
                              <Button 
                                onClick={() => navigate(`/diagnosis/${patient.id}`)}
                                size="lg"
                                className="bg-red-600 hover:bg-red-700 text-white px-6"
                              >
                                <Activity className="h-4 w-4 mr-2" />
                                立即診斷
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {latestMeasurement && (
                              <div className="bg-white rounded-lg p-4 border">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                                  最新異常測量結果
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">測量類型:</span>
                                    <p className="font-medium">
                                      {latestMeasurement.measurement_type === 'blood_pressure' && '血壓'}
                                      {latestMeasurement.measurement_type === 'heart_rate' && '心率'}
                                      {latestMeasurement.measurement_type === 'temperature' && '體溫'}
                                      {latestMeasurement.measurement_type === 'oxygen_saturation' && '血氧飽和度'}
                                      {latestMeasurement.measurement_type === 'blood_glucose' && '血糖'}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">測量值:</span>
                                    <p className="font-medium text-red-600">
                                      {latestMeasurement.measurement_type === 'blood_pressure' && 
                                        `${latestMeasurement.values.systolic}/${latestMeasurement.values.diastolic} mmHg`}
                                      {latestMeasurement.measurement_type === 'heart_rate' && 
                                        `${latestMeasurement.values.rate} bpm`}
                                      {latestMeasurement.measurement_type === 'temperature' && 
                                        `${latestMeasurement.values.celsius}°C`}
                                      {latestMeasurement.measurement_type === 'oxygen_saturation' && 
                                        `${latestMeasurement.values.percentage}%`}
                                      {latestMeasurement.measurement_type === 'blood_glucose' && 
                                        `${latestMeasurement.values.mg_dl} mg/dL`}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">測量時間:</span>
                                    <p className="font-medium">
                                      {new Date(latestMeasurement.measured_at).toLocaleString('zh-TW')}
                                    </p>
                                  </div>
                                </div>
                                {latestMeasurement.location && (
                                  <div className="mt-3 pt-3 border-t">
                                    <span className="text-gray-600 text-sm">測量地點: </span>
                                    <span className="font-medium text-sm">{latestMeasurement.location}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patient Management Tab */}
          <TabsContent value="patients">
            {showPatientCovidAssessments && selectedPatient ? (
              <PatientCovidAssessments 
                patient={selectedPatient}
                onClose={() => {
                  setShowPatientCovidAssessments(false)
                  setSelectedPatient(null)
                }}
              />
            ) : (
              <PatientList 
                onViewCovidAssessments={handleViewPatientCovidAssessments}
              />
            )}
          </TabsContent>

          {/* Diagnosis Tab */}
          <TabsContent value="diagnosis">
            {selectedPatient ? (
              <DiagnosisForm 
                patient={selectedPatient} 
                onDiagnosisAdded={handleDiagnosisComplete}
                onCancel={() => {
                  setSelectedPatient(null)
                  setActiveTab('overview')
                }}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">Please select a patient to start diagnosis</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* COVID/流感評估 Tab */}
          <TabsContent value="covid_flu" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  COVID-19 和流感管理
                </CardTitle>
                <CardDescription>
                  查看患者COVID-19和流感評估結果，提供專業診斷和建議
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PatientCovidAssessments 
                  user={user}
                  onPatientSelect={(patient) => {
                    setSelectedPatient(patient)
                    setActiveTab('diagnosis')
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 指導建議 Tab */}
          <TabsContent value="guidance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-green-600" />
                  檢測和隔離指導
                </CardTitle>
                <CardDescription>
                  為醫護人員提供標準化的檢測建議和隔離指導方案
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TestingIsolationGuidance 
                  riskLevel="medium"
                  assessmentResult={null}
                  user={user}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

