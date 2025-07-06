import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button.jsx'
import { 
  Stethoscope, 
  Users, 
  AlertTriangle, 
  FileText,
  Shield,
  Settings,
  Activity,
  LogOut,
  User,
  Plus,
  Clock
} from 'lucide-react'
import MedicalHeader from '../components/ui/MedicalHeader.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n'

export default function MedicalStaffPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

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
    fetchStats()
  }, [navigate])

  const fetchStats = async () => {
    try {
      const [measurementsResponse, diagnoses, covidStats] = await Promise.all([
        apiService.getAbnormalMeasurements(),
        apiService.getAllDiagnoses(),
        apiService.getCovidAssessmentStats()
      ])

      // 解构API响应，获取实际数据
      const measurements = measurementsResponse.data || measurementsResponse

      // 计算待处理患者数量和待处理测量记录数量
      const patientMap = new Map()
      let pendingMeasurements = 0 // 待处理的异常测量记录数量
      
      measurements.forEach(measurement => {
        // 获取患者ID，兼容不同的数据结构
        const patientId = measurement.userId?._id || measurement.userId
        
        if (patientId) {
          if (!patientMap.has(patientId)) {
            patientMap.set(patientId, { pendingCount: 0 })
          }
          
          // 统计待处理的异常测量记录
          if (measurement.isAbnormal && measurement.status === 'pending') {
            patientMap.get(patientId).pendingCount++
            pendingMeasurements++ // 统计待处理的异常测量记录总数
          }
        }
      })
      const pendingPatients = Array.from(patientMap.values()).filter(p => p.pendingCount > 0).length

      // 计算风险分布
      const riskDistribution = { low: 0, medium: 0, high: 0, critical: 0 }
      if (covidStats && covidStats.riskStats) {
        covidStats.riskStats.forEach(stat => {
          if (stat._id === 'low') riskDistribution.low = stat.count
          else if (stat._id === 'medium') riskDistribution.medium = stat.count
          else if (stat._id === 'high') riskDistribution.high = stat.count
          else if (stat._id === 'very_high') riskDistribution.critical = stat.count
        })
      }



      setStats({
        totalDiagnoses: diagnoses.length,
        pendingPatients,
        pendingMeasurements, // 新增待处理测量记录数量
        highRiskPatients: covidStats?.highRiskCount || 0,
        totalAssessments: covidStats?.totalAssessments || 0,
        riskDistribution
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    apiService.logout()
    navigate('/login')
  }

  const menuItems = [
    {
      title: i18n.t('pages.medical_staff.patient_management'),
      description: i18n.t('pages.medical_staff.patient_management_desc'),
      icon: Users,
      color: 'text-blue-600',
      path: '/medical/patients-management',
      badge: stats?.pendingPatients || null
    },
    {
      title: i18n.t('pages.medical_staff.diagnosis_evaluation'),
      description: i18n.t('pages.medical_staff.diagnosis_evaluation_desc'),
      icon: FileText,
      color: 'text-green-600',  
      path: '/medical/diagnosis',
      badge: stats?.pendingMeasurements > 0 ? stats.pendingMeasurements : null
    },
    {
      title: i18n.t('pages.medical_staff.covid_management'),
      description: i18n.t('pages.medical_staff.covid_management_desc'),
      icon: Shield,
      color: 'text-purple-600',
      path: '/medical/covid-management',
      badge: stats?.highRiskPatients || null
    },
    {
      title: i18n.t('pages.medical_staff.abnormal_settings'),
      description: i18n.t('pages.medical_staff.abnormal_settings_desc'),
      icon: Settings,
      color: 'text-orange-600',
      path: '/medical/abnormal-settings'
    },
    {
      title: i18n.t('pages.medical_staff.test_guidance'),
      description: i18n.t('pages.medical_staff.test_guidance_desc'),
      icon: Activity,
      color: 'text-red-600',
      path: '/medical/guidance'
    }
  ]

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{i18n.t('common.loading')}</p>
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-200/20 to-green-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <MedicalHeader 
        title={i18n.t('pages.medical_staff.title')}
        subtitle={i18n.t('pages.medical_staff.subtitle')}
        icon={Stethoscope}
        showBackButton={false}
        user={currentUser}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        {/* 欢迎信息 - 统一样式 */}
        <div className="mb-8 text-left">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
            {i18n.t('pages.medical_staff.welcome_back', { username: currentUser?.username })}
          </h2>
          <p className="text-gray-700/80 text-lg">
            {i18n.t('pages.medical_staff.select_function')}
          </p>
        </div>

        {/* 统计概览 - 小型列表样式 */}
        {stats && (
          <div className="mb-8">
            <h3 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-4">
              {i18n.t('pages.medical_staff.current_status')}
            </h3>
            <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-md shadow-gray-200/60">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalDiagnoses}</div>
                  <div className="text-sm text-gray-600">{i18n.t('pages.medical_staff.total_diagnoses')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.pendingPatients}</div>
                  <div className="text-sm text-gray-600">{i18n.t('pages.medical_staff.pending_patients')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.pendingMeasurements}</div>
                  <div className="text-sm text-gray-600">{i18n.t('pages.medical_staff.pending_measurements')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.highRiskPatients}</div>
                  <div className="text-sm text-gray-600">{i18n.t('pages.medical_staff.high_risk_patients')}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 功能菜单网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon
            // 根据不同按钮设置不同的颜色主题
            const getColorTheme = (title) => {
              const patientManagementTitle = i18n.t('pages.medical_staff.patient_management')
              const diagnosisEvaluationTitle = i18n.t('pages.medical_staff.diagnosis_evaluation')
              const covidManagementTitle = i18n.t('pages.medical_staff.covid_management')
              const abnormalSettingsTitle = i18n.t('pages.medical_staff.abnormal_settings')
              const testGuidanceTitle = i18n.t('pages.medical_staff.test_guidance')
              
              switch(title) {
                case patientManagementTitle:
                  return {
                    bg: 'from-blue-50/80 to-blue-100/60',
                    hoverBg: 'hover:from-blue-100/90 hover:to-blue-200/70',
                    iconBg: 'from-blue-500 to-blue-600',
                    iconShadow: 'shadow-blue-500/30',
                    textHover: 'group-hover:from-blue-700 group-hover:to-blue-600',
                    cardShadow: 'shadow-blue-500/15 hover:shadow-blue-500/25'
                  }
                case diagnosisEvaluationTitle:
                  return {
                    bg: 'from-green-50/80 to-green-100/60',
                    hoverBg: 'hover:from-green-100/90 hover:to-green-200/70',
                    iconBg: 'from-green-500 to-green-600',
                    iconShadow: 'shadow-green-500/30',
                    textHover: 'group-hover:from-green-700 group-hover:to-green-600',
                    cardShadow: 'shadow-green-500/15 hover:shadow-green-500/25'
                  }
                case covidManagementTitle:
                  return {
                    bg: 'from-purple-50/80 to-purple-100/60',
                    hoverBg: 'hover:from-purple-100/90 hover:to-purple-200/70',
                    iconBg: 'from-purple-500 to-purple-600',
                    iconShadow: 'shadow-purple-500/30',
                    textHover: 'group-hover:from-purple-700 group-hover:to-purple-600',
                    cardShadow: 'shadow-purple-500/15 hover:shadow-purple-500/25'
                  }
                case abnormalSettingsTitle:
                  return {
                    bg: 'from-orange-50/80 to-orange-100/60',
                    hoverBg: 'hover:from-orange-100/90 hover:to-orange-200/70',
                    iconBg: 'from-orange-500 to-orange-600',
                    iconShadow: 'shadow-orange-500/30',
                    textHover: 'group-hover:from-orange-700 group-hover:to-orange-600',
                    cardShadow: 'shadow-orange-500/15 hover:shadow-orange-500/25'
                  }
                case testGuidanceTitle:
                  return {
                    bg: 'from-red-50/80 to-red-100/60',
                    hoverBg: 'hover:from-red-100/90 hover:to-red-200/70',
                    iconBg: 'from-red-500 to-red-600',
                    iconShadow: 'shadow-red-500/30',
                    textHover: 'group-hover:from-red-700 group-hover:to-red-600',
                    cardShadow: 'shadow-red-500/15 hover:shadow-red-500/25'
                  }
                default:
                  return {
                    bg: 'from-gray-50/80 to-gray-100/60',
                    hoverBg: 'hover:from-gray-100/90 hover:to-gray-200/70',
                    iconBg: 'from-gray-500 to-gray-600',
                    iconShadow: 'shadow-gray-500/30',
                    textHover: 'group-hover:from-gray-700 group-hover:to-gray-600',
                    cardShadow: 'shadow-gray-500/15 hover:shadow-gray-500/25'
                  }
              }
            }
            const colorTheme = getColorTheme(item.title)
            
            return (
              <div
                key={index}
                className="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group"
                onClick={() => navigate(item.path)}
              >
                <div className={`bg-gradient-to-br ${colorTheme.bg} ${colorTheme.hoverBg} backdrop-blur-md border-0 rounded-3xl p-6 shadow-2xl ${colorTheme.cardShadow} relative overflow-hidden transition-all duration-300`}>
                  {/* 装饰性背景效果 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* 动态背景装饰 */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-white/15 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 bg-gradient-to-br ${colorTheme.iconBg} rounded-2xl shadow-xl ${colorTheme.iconShadow} group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <h3 className={`text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent ${colorTheme.textHover} transition-all duration-300`}>
                          {item.title}
                        </h3>
                      </div>
                      {item.badge && (
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full animate-pulse shadow-lg shadow-red-500/40 border border-red-400/20">
                          {item.badge}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
} 