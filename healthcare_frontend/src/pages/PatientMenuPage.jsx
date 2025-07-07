import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button.jsx'
import { 
  Heart, 
  Activity, 
  History, 
  FileText, 
  Shield, 
  Plus,
  AlertCircle
} from 'lucide-react'
import PatientHeader from '../components/ui/PatientHeader.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n'

export default function PatientMenuPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [unreadDiagnoses, setUnreadDiagnoses] = useState(0)
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
    
    // 检查用户角色是否为患者
    if (userData.role !== 'patient') {
      navigate('/login')
      return
    }

    setCurrentUser(userData)
    fetchUnreadDiagnoses()
  }, [navigate])

  const fetchUnreadDiagnoses = async () => {
    try {
      const currentUser = apiService.getCurrentUser()
      const currentUserId = currentUser?.id || currentUser?.userId // 兼容两种ID字段
      
      if (currentUserId) {
        // 使用新的measurement-diagnoses API
        const unreadCount = await apiService.getUnreadMeasurementDiagnosesCount(currentUserId)
        setUnreadDiagnoses(unreadCount)
      }
    } catch (error) {
      console.error('Error fetching unread measurement diagnoses:', error)
      setUnreadDiagnoses(0)
    }
  }

  const menuItems = [
    {
      title: i18n.t('menu.new_measurement'),
      description: i18n.t('menu.new_measurement_desc'),
      icon: Plus,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      borderColor: 'border-green-200',
      path: '/patient/measurement'
    },
    {
      title: i18n.t('menu.covid_flu'),
      description: i18n.t('menu.covid_flu_desc'),
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      borderColor: 'border-purple-200',
      path: '/patient/covid-assessment'
    },
    {
      title: i18n.t('menu.diagnosis_reports'),
      description: i18n.t('menu.diagnosis_reports_desc'),
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      borderColor: 'border-orange-200',
      path: '/patient/diagnosis-reports',
      badge: unreadDiagnoses > 0 ? unreadDiagnoses : null
    }
  ]

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{i18n.t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <PatientHeader 
        title={i18n.t('menu.patient_center')}
        subtitle=""
        icon={Heart}
        showBackButton={false}
        user={currentUser}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        {/* 欢迎信息 */}
        <div className="mb-8 text-left">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            {i18n.t('menu.welcome_back', { username: currentUser?.username })}
          </h2>
          <p className="text-gray-700/80 text-lg">
            {i18n.t('menu.select_function')}
          </p>
        </div>

        {/* 功能菜单网格 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon
            // 根据不同按钮设置不同的颜色主题
            const getColorTheme = (title) => {
              const newMeasurementTitle = i18n.t('menu.new_measurement')
              const covidFluTitle = i18n.t('menu.covid_flu')
              const diagnosisReportsTitle = i18n.t('menu.diagnosis_reports')
              
              switch(title) {
                case newMeasurementTitle:
                  return {
                    bg: 'from-green-50/80 to-green-100/60',
                    hoverBg: 'hover:from-green-100/90 hover:to-green-200/70',
                    iconBg: 'from-green-500 to-green-600',
                    iconShadow: 'shadow-green-500/30',
                    textHover: 'group-hover:from-green-700 group-hover:to-green-600',
                    cardShadow: 'shadow-green-500/15 hover:shadow-green-500/25'
                  }
                case covidFluTitle:
                  return {
                    bg: 'from-purple-50/80 to-purple-100/60',
                    hoverBg: 'hover:from-purple-100/90 hover:to-purple-200/70',
                    iconBg: 'from-purple-500 to-purple-600',
                    iconShadow: 'shadow-purple-500/30',
                    textHover: 'group-hover:from-purple-700 group-hover:to-purple-600',
                    cardShadow: 'shadow-purple-500/15 hover:shadow-purple-500/25'
                  }
                case diagnosisReportsTitle:
                  return {
                    bg: 'from-orange-50/80 to-orange-100/60',
                    hoverBg: 'hover:from-orange-100/90 hover:to-orange-200/70',
                    iconBg: 'from-orange-500 to-orange-600',
                    iconShadow: 'shadow-orange-500/30',
                    textHover: 'group-hover:from-orange-700 group-hover:to-orange-600',
                    cardShadow: 'shadow-orange-500/15 hover:shadow-orange-500/25'
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

        {/* Health Reminders - 优化UI，去除黑色边框 */}
        <div className="bg-gradient-to-br from-cyan-50/90 to-blue-50/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl shadow-cyan-500/10 relative overflow-hidden">
          {/* 装饰性背景效果 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-cyan-100/20 opacity-50"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-200/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/30 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-xl shadow-cyan-500/30">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {i18n.t('menu.quick_tips')}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 text-sm leading-relaxed">{i18n.t('menu.tip_1')}</p>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 text-sm leading-relaxed">{i18n.t('menu.tip_2')}</p>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 text-sm leading-relaxed">{i18n.t('menu.tip_3')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 