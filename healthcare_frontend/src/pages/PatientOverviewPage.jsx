import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Shield,
  Plus,
  FileText,
  Stethoscope
} from 'lucide-react'
import PatientHeader from '../components/ui/PatientHeader.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n'

export default function PatientOverviewPage() {
  const navigate = useNavigate()
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
    } else {
      navigate('/login')
    }
  }, [navigate])

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
      <PatientHeader 
        title="健康概覽"
        subtitle="查看您的健康狀態總覽"
        icon={Heart}
        showBackButton={true}
        user={user}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
        <Card className="mb-8">
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
        <Card className="border-blue-200 bg-blue-50 mb-8">
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

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/patient/measurement')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                生命體徵管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">記錄新測量數據或查看歷史記錄</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/patient/diagnoses')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                查看診斷
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">查看醫護人員的專業診斷報告</p>
            </CardContent>
          </Card>
        </div>

        {/* 最新诊断 */}
        {diagnoses.length > 0 && (
          <Card className="mt-8">
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
      </main>
    </div>
  )
} 