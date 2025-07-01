import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { 
  TrendingUp, 
  Users, 
  FileText,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import MedicalHeader from '../components/ui/MedicalHeader.jsx'
import apiService from '../services/api.js'

export default function MedicalStatisticsPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [stats, setStats] = useState(null)
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
    fetchDetailedStats()
  }, [navigate])

  const fetchDetailedStats = async () => {
    try {
      const [measurements, diagnoses, covidStats, measurementStats, diagnosisStats] = await Promise.all([
        apiService.getAbnormalMeasurements(),
        apiService.getAllDiagnoses(),
        apiService.getCovidAssessmentStats(),
        apiService.getMeasurementStats(),
        apiService.getDiagnosisStats()
      ])

      // 计算详细统计
      const patientMap = new Map()
      measurements.forEach(measurement => {
        const patientId = measurement.userId._id
        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, { 
            id: patientId,
            totalMeasurements: 0,
            abnormalMeasurements: 0,
            pendingMeasurements: 0
          })
        }
        const patient = patientMap.get(patientId)
        patient.totalMeasurements++
        if (measurement.isAbnormal) {
          patient.abnormalMeasurements++
          if (measurement.status === 'pending') {
            patient.pendingMeasurements++
          }
        }
      })

      // 风险分布
      const riskDistribution = { low: 0, medium: 0, high: 0, critical: 0 }
      if (covidStats && covidStats.riskStats) {
        covidStats.riskStats.forEach(stat => {
          if (stat._id === 'low') riskDistribution.low = stat.count
          else if (stat._id === 'medium') riskDistribution.medium = stat.count
          else if (stat._id === 'high') riskDistribution.high = stat.count
          else if (stat._id === 'very_high') riskDistribution.critical = stat.count
        })
      }

      // 诊断状态分布
      const diagnosisStatusDistribution = diagnoses.reduce((acc, diagnosis) => {
        acc[diagnosis.status] = (acc[diagnosis.status] || 0) + 1
        return acc
      }, {})

      setStats({
        // 基础统计
        totalPatients: patientMap.size,
        totalMeasurements: measurements.length,
        totalDiagnoses: diagnoses.length,
        totalCovidAssessments: covidStats?.totalAssessments || 0,
        
        // 异常数据统计
        abnormalMeasurements: measurements.filter(m => m.isAbnormal).length,
        pendingMeasurements: measurements.filter(m => m.isAbnormal && m.status === 'pending').length,
        
        // COVID风险统计
        highRiskPatients: covidStats?.highRiskCount || 0,
        riskDistribution,
        
        // 诊断统计
        diagnosisStatusDistribution,
        patientsWithDiagnoses: new Set(diagnoses.map(d => d.patientId)).size,
        
        // 时间趋势（最近7天）
        recentTrend: covidStats?.recentTrend || [],
        
        // 患者详情
        patientDetails: Array.from(patientMap.values())
      })
    } catch (error) {
      console.error('Error fetching detailed stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入統計數據中...</p>
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
        title="數據統計"
        subtitle="整體健康數據統計與分析"
        icon={TrendingUp}
        showBackButton={true}
        user={currentUser}
        onBack={() => navigate('/medical')}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        
        {/* 总体统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50/80 to-blue-100/60 backdrop-blur-md border-0 shadow-2xl shadow-blue-500/15">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">總患者數</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats?.totalPatients || 0}</div>
              <p className="text-xs text-blue-600/70">活躍患者總數</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50/80 to-green-100/60 backdrop-blur-md border-0 shadow-2xl shadow-green-500/15">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-600">總測量數</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats?.totalMeasurements || 0}</div>
              <p className="text-xs text-green-600/70">生命體徵測量總數</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50/80 to-purple-100/60 backdrop-blur-md border-0 shadow-2xl shadow-purple-500/15">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">總診斷數</CardTitle>
              <FileText className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{stats?.totalDiagnoses || 0}</div>
              <p className="text-xs text-purple-600/70">完成診斷總數</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50/80 to-orange-100/60 backdrop-blur-md border-0 shadow-2xl shadow-orange-500/15">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">COVID評估數</CardTitle>
              <Shield className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{stats?.totalCovidAssessments || 0}</div>
              <p className="text-xs text-orange-600/70">COVID/流感評估總數</p>
            </CardContent>
          </Card>
        </div>

        {/* 详细统计 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* 异常数据统计 */}
          <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                異常數據統計
              </CardTitle>
              <CardDescription>測量數據異常情況分析</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl">
                  <div className="text-2xl font-bold text-red-600">{stats?.abnormalMeasurements || 0}</div>
                  <p className="text-sm text-red-600/80">異常測量</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl">
                  <div className="text-2xl font-bold text-yellow-600">{stats?.pendingMeasurements || 0}</div>
                  <p className="text-sm text-yellow-600/80">待處理</p>
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                <div className="text-2xl font-bold text-green-600">
                  {((stats?.totalMeasurements - stats?.abnormalMeasurements) / stats?.totalMeasurements * 100 || 0).toFixed(1)}%
                </div>
                <p className="text-sm text-green-600/80">正常率</p>
              </div>
            </CardContent>
          </Card>

          {/* COVID风险分布 */}
          <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Shield className="h-5 w-5 text-purple-500" />
                COVID風險分布
              </CardTitle>
              <CardDescription>患者風險等級分布情況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                  <div className="text-2xl font-bold text-green-600">{stats?.riskDistribution.low || 0}</div>
                  <p className="text-sm text-green-600/80">低風險</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl">
                  <div className="text-2xl font-bold text-yellow-600">{stats?.riskDistribution.medium || 0}</div>
                  <p className="text-sm text-yellow-600/80">中風險</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
                  <div className="text-2xl font-bold text-orange-600">{stats?.riskDistribution.high || 0}</div>
                  <p className="text-sm text-orange-600/80">高風險</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl">
                  <div className="text-2xl font-bold text-red-600">{stats?.riskDistribution.critical || 0}</div>
                  <p className="text-sm text-red-600/80">極高風險</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 诊断状态统计 */}
        <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              診斷狀態統計
            </CardTitle>
            <CardDescription>診斷流程完成情況分析</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                <div className="text-2xl font-bold text-blue-600">{stats?.diagnosisStatusDistribution.active || 0}</div>
                <p className="text-sm text-blue-600/80">進行中</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                <div className="text-2xl font-bold text-green-600">{stats?.diagnosisStatusDistribution.completed || 0}</div>
                <p className="text-sm text-green-600/80">已完成</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <div className="text-2xl font-bold text-gray-600">{stats?.diagnosisStatusDistribution.cancelled || 0}</div>
                <p className="text-sm text-gray-600/80">已取消</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                <div className="text-2xl font-bold text-purple-600">{stats?.patientsWithDiagnoses || 0}</div>
                <p className="text-sm text-purple-600/80">已診斷患者</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 最近趋势 */}
        {stats?.recentTrend && stats.recentTrend.length > 0 && (
          <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Clock className="h-5 w-5 text-indigo-500" />
                最近趨勢
              </CardTitle>
              <CardDescription>最近7天COVID評估趨勢</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {stats.recentTrend.map((day, index) => (
                  <div key={index} className="text-center p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl">
                    <div className="text-lg font-bold text-indigo-600">{day.count}</div>
                    <p className="text-xs text-indigo-600/80">{day._id}</p>
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