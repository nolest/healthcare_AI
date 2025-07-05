import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets, 
  LogOut, 
  User, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Shield,
  TestTube
} from 'lucide-react'
import MeasurementForm from './MeasurementForm'
import MeasurementHistory from './MeasurementHistory'
import CovidFluAssessment from './CovidFluAssessment'
import SymptomTracker from './SymptomTracker'
import TestingIsolationGuidance from './TestingIsolationGuidance'
import LanguageSwitcher from './LanguageSwitcher'
import apiService from '../services/api.js'
import i18n from '../utils/i18n'

export default function PatientDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [measurements, setMeasurements] = useState([])
  const [diagnoses, setDiagnoses] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())
  const [user, setUser] = useState(null)

  useEffect(() => {
    // 监听语言变化
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
    const currentUser = apiService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      console.log('fetchData called, user:', user)
      
      // 使用真实API获取数据
      const [measurements, diagnoses] = await Promise.all([
        apiService.getMyMeasurements(),
        apiService.getMyDiagnoses()
      ])
      
      console.log('User measurements:', measurements.length)
      console.log('User diagnoses:', diagnoses.length)
      
      setMeasurements(measurements)
      setDiagnoses(diagnoses)
      
      // 计算统计数据
      const totalMeasurements = measurements.length
      const abnormalMeasurements = measurements.filter(m => m.isAbnormal).length
      const totalDiagnoses = diagnoses.length
      
      console.log('Statistics:', { totalMeasurements, abnormalMeasurements, totalDiagnoses })
      
      const newStats = {
        totalMeasurements,
        abnormalMeasurements,
        totalDiagnoses,
        healthStatus: abnormalMeasurements === 0 ? '良好' : '需關注'
      }
      
      console.log('Setting stats:', newStats)
      setStats(newStats)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMeasurementAdded = () => {
    console.log('handleMeasurementAdded called')
    fetchData() // 重新获取数据
    // 不要自动切换标签页，让用户决定
    // setActiveTab('history') // 切换到历史记录页面
  }

  const getLatestMeasurement = (type) => {
    return stats?.latestMeasurements?.[type]
  }

  const formatMeasurementValue = (measurement) => {
    if (!measurement) return 'N/A'
    
    switch (measurement.measurement_type) {
      case 'blood_pressure':
        return `${measurement.values.systolic}/${measurement.values.diastolic} mmHg`
      case 'heart_rate':
        return `${measurement.values.rate} bpm`
      case 'temperature':
        return `${measurement.values.celsius}°C`
      case 'oxygen_saturation':
        return `${measurement.values.percentage}%`
      case 'blood_glucose':
        return `${measurement.values.mg_dl} mg/dL`
      default:
        return 'N/A'
    }
  }

  const getMeasurementIcon = (type) => {
    switch (type) {
      case 'blood_pressure':
        return <Heart className="h-6 w-6" />
      case 'heart_rate':
        return <Activity className="h-6 w-6" />
      case 'temperature':
        return <Thermometer className="h-6 w-6" />
      case 'oxygen_saturation':
        return <Droplets className="h-6 w-6" />
      default:
        return <Activity className="h-6 w-6" />
    }
  }

  if (loading || !user) {
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
              <Heart className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">{i18n.t('dashboard.patient.title')}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-700">{user?.username || 'Loading...'}</span>
              </div>
              <Button variant="outline" onClick={() => {
                apiService.logout()
                window.location.href = '/login'
              }}>
                <LogOut className="h-4 w-4 mr-2" />
                {i18n.t('auth.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">{i18n.t('dashboard.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="measure">{i18n.t('dashboard.tabs.new_measurement')}</TabsTrigger>
            <TabsTrigger value="history">{i18n.t('dashboard.tabs.history')}</TabsTrigger>
            <TabsTrigger value="diagnoses">{i18n.t('dashboard.tabs.diagnoses')}</TabsTrigger>
            <TabsTrigger value="covid_flu">COVID/流感</TabsTrigger>
            <TabsTrigger value="tracking">症狀追蹤</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总测量次数</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalMeasurements || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">异常测量</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats?.abnormalMeasurements || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">诊断报告</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalDiagnoses || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">健康状态</CardTitle>
                  <Heart className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.healthStatus || '良好'}</div>
                </CardContent>
              </Card>
            </div>

            {/* 最新测量结果 */}
            <Card>
              <CardHeader>
                <CardTitle>最新测量结果</CardTitle>
                <CardDescription>您最近的生命体征测量数据</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {['blood_pressure', 'heart_rate', 'temperature', 'oxygen_saturation'].map((type) => {
                    const measurement = getLatestMeasurement(type)
                    return (
                      <div key={type} className="flex items-center space-x-3 p-4 border rounded-lg">
                        <div className={`p-2 rounded-full ${measurement?.is_abnormal ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          {getMeasurementIcon(type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {type === 'blood_pressure' && '血压'}
                            {type === 'heart_rate' && '心率'}
                            {type === 'temperature' && '体温'}
                            {type === 'oxygen_saturation' && '血氧'}
                          </p>
                          <p className="text-lg font-bold">
                            {formatMeasurementValue(measurement)}
                          </p>
                          {measurement?.is_abnormal && (
                            <Badge variant="destructive" className="text-xs">异常</Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* COVID/流感评估快速入口 */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Shield className="h-6 w-6" />
                  COVID/流感健康评估
                </CardTitle>
                <CardDescription className="text-blue-600">
                  定期进行症状评估，获得专业的健康指导和风险分析
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-blue-700 font-medium">快速症状评估</p>
                    <p className="text-xs text-blue-600">
                      基于WHO和CDC指导原则的专业评估工具
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate('/patient/covid-assessment')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    開始評估
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 最新诊断 */}
            {diagnoses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>最新诊断报告</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {diagnoses.slice(0, 3).map((diagnosis) => (
                      <div key={diagnosis.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{diagnosis.doctor_name}</p>
                          <Badge variant={
                            diagnosis.risk_level === 'low' ? 'default' :
                            diagnosis.risk_level === 'medium' ? 'secondary' :
                            diagnosis.risk_level === 'high' ? 'destructive' : 'destructive'
                          }>
                            {diagnosis.risk_level === 'low' && '低风险'}
                            {diagnosis.risk_level === 'medium' && '中风险'}
                            {diagnosis.risk_level === 'high' && '高风险'}
                            {diagnosis.risk_level === 'critical' && '紧急'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mt-1">{diagnosis.diagnosis}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(diagnosis.created_at).toLocaleString('zh-TW')}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="measure">
            <MeasurementForm onMeasurementAdded={handleMeasurementAdded} />
          </TabsContent>

          <TabsContent value="history">
            <MeasurementHistory measurements={measurements} onRefresh={fetchData} />
          </TabsContent>

          <TabsContent value="diagnoses">
            <Card>
              <CardHeader>
                <CardTitle>诊断报告</CardTitle>
                <CardDescription>医护人员对您测量结果的专业评估</CardDescription>
              </CardHeader>
              <CardContent>
                {/* 调试信息 */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <h4 className="font-medium text-yellow-800">调试信息:</h4>
                    <p className="text-sm text-yellow-700">
                      当前用户: {user.username} | 诊断数量: {diagnoses.length}
                    </p>
                    {diagnoses.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-yellow-700">查看诊断数据</summary>
                        <pre className="text-xs mt-2 overflow-auto">
                          {JSON.stringify(diagnoses, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
                
                {diagnoses.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg font-medium mb-2">暂无诊断报告</p>
                    <p className="text-gray-400 text-sm">
                      当您的测量数据出现异常时，医护人员会为您提供专业的诊断评估
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {diagnoses.map((diagnosis) => (
                      <Card key={diagnosis.id} className="border-l-4 border-l-blue-500">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center">
                              <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {diagnosis.doctor_name}
                            </CardTitle>
                            <Badge variant={
                              diagnosis.risk_level === 'low' ? 'default' :
                              diagnosis.risk_level === 'medium' ? 'secondary' :
                              diagnosis.risk_level === 'high' ? 'destructive' : 'destructive'
                            }>
                              {diagnosis.risk_level === 'low' && '低风险'}
                              {diagnosis.risk_level === 'medium' && '中风险'}
                              {diagnosis.risk_level === 'high' && '高风险'}
                              {diagnosis.risk_level === 'critical' && '紧急'}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(diagnosis.created_at).toLocaleString('zh-TW')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2 flex items-center">
                                <svg className="h-4 w-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                诊断结论
                              </h4>
                              <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{diagnosis.diagnosis}</p>
                            </div>
                            
                            {diagnosis.recommendations && diagnosis.recommendations.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2 flex items-center">
                                  <svg className="h-4 w-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                  </svg>
                                  建议措施
                                </h4>
                                <ul className="list-disc list-inside space-y-1 bg-blue-50 p-3 rounded-md">
                                  {diagnosis.recommendations.map((rec, index) => (
                                    <li key={index} className="text-gray-700">{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {diagnosis.follow_up_required && (
                              <Alert className="border-orange-200 bg-orange-50">
                                <Calendar className="h-4 w-4 text-orange-600" />
                                <AlertDescription className="text-orange-800">
                                  <strong>需要后续追踪</strong>
                                  {diagnosis.follow_up_date && (
                                    <span className="ml-2">
                                      - 追踪日期：{new Date(diagnosis.follow_up_date).toLocaleDateString('zh-TW')}
                                    </span>
                                  )}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="covid_flu" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  COVID/流感健康评估
                </CardTitle>
                <CardDescription>
                  专业的症状评估和风险分析，提供个人化的健康建议
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-gray-600">
                    点击下方按钮进入专门的COVID/流感评估页面，获得更好的评估体验。
                  </p>
                  <Button 
                    onClick={() => navigate('/patient/covid-assessment')}
                    className="w-full max-w-md"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    开始COVID/流感评估
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <SymptomTracker 
              user={user}
              assessmentHistory={[]} // 可以从localStorage获取历史评估数据
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

