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

export default function PatientMenuPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [unreadDiagnoses, setUnreadDiagnoses] = useState(0)

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
      title: '新測量',
      description: '記錄生命體徵與查看歷史',
      icon: Plus,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      borderColor: 'border-green-200',
      path: '/patient/measurement'
    },
    {
      title: 'COVID/流感',
      description: '症狀評估與健康指導',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      borderColor: 'border-purple-200',
      path: '/patient/covid-assessment'
    },
    {
      title: '診斷報告',
      description: '查看醫護人員診斷',
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
          <p className="mt-4 text-gray-600">載入中...</p>
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
        title="患者中心"
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
            歡迎回來，{currentUser?.username}
          </h2>
          <p className="text-gray-700/80 text-lg">
            選擇您需要的功能來管理您的健康狀態
          </p>
        </div>

        {/* 功能菜单网格 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon
            // 根据不同按钮设置不同的颜色主题
            const getColorTheme = (title) => {
              switch(title) {
                case '新測量':
                  return {
                    bg: 'from-green-50/80 to-green-100/60',
                    hoverBg: 'hover:from-green-100/90 hover:to-green-200/70',
                    iconBg: 'from-green-500 to-green-600',
                    iconShadow: 'shadow-green-500/30',
                    textHover: 'group-hover:from-green-700 group-hover:to-green-600',
                    cardShadow: 'shadow-green-500/15 hover:shadow-green-500/25'
                  }
                case 'COVID/流感':
                  return {
                    bg: 'from-purple-50/80 to-purple-100/60',
                    hoverBg: 'hover:from-purple-100/90 hover:to-purple-200/70',
                    iconBg: 'from-purple-500 to-purple-600',
                    iconShadow: 'shadow-purple-500/30',
                    textHover: 'group-hover:from-purple-700 group-hover:to-purple-600',
                    cardShadow: 'shadow-purple-500/15 hover:shadow-purple-500/25'
                  }
                case '診斷報告':
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
                    <p className="text-sm text-gray-700/80 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 健康提醒 */}
        <div className="mt-12">
          <div className="flex items-start">
            <div className="p-3 bg-gradient-to-br from-blue-400/60 via-indigo-400/60 to-purple-400/60 rounded-2xl shadow-lg shadow-blue-500/20 mr-6 mt-1 flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-white/90" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent mb-4">健康提醒</h3>
              <ul className="text-gray-700/90 space-y-3">
                <li className="flex items-center group">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                  <span className="group-hover:text-blue-700 transition-colors duration-200">建議每天定時測量生命體徵</span>
                </li>
                <li className="flex items-center group">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                  <span className="group-hover:text-indigo-700 transition-colors duration-200">如有不適症狀，請及時進行COVID/流感評估</span>
                </li>
                <li className="flex items-center group">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                  <span className="group-hover:text-purple-700 transition-colors duration-200">定期查看診斷報告，遵循醫護人員建議</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 