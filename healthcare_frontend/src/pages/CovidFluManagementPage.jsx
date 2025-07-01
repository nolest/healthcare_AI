import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { 
  Shield, 
  Users, 
  BarChart3,
  FileText,
  Settings,
  Activity
} from 'lucide-react'
import MedicalHeader from '../components/ui/MedicalHeader.jsx'
import apiService from '../services/api.js'

export default function CovidFluManagementPage() {
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
    loadData()
  }, [navigate])

  const loadData = async () => {
    try {
      const covidStats = await apiService.getCovidAssessmentStats()
      setStats(covidStats)
    } catch (error) {
      console.error('加载统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    {
      title: '數據概覽',
      description: '查看COVID/流感評估統計',
      icon: BarChart3,
      color: 'text-blue-600',
      path: '/medical/covid-management/overview'
    },
    {
      title: '患者管理',
      description: '管理COVID/流感評估患者',
      icon: Users,
      color: 'text-green-600',
      path: '/medical/covid-management/patients'
    },
    {
      title: '指導建議',
      description: '提供檢測與隔離指導',
      icon: FileText,
      color: 'text-purple-600',
      path: '/medical/covid-management/recommendations'
    },
    {
      title: '系統設置',
      description: '配置評估標準和風險閾值',
      icon: Settings,
      color: 'text-orange-600',
      path: '/medical/covid-management/settings'
    }
  ]

  if (loading || !currentUser) {
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
        title="COVID/流感管理"
        subtitle="專業疫情監控與管理平台"
        icon={Shield}
        showBackButton={true}
        user={currentUser}
        onBack={() => navigate('/medical')}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        {/* 统计概览 */}
        {stats && (
          <div className="mb-8">
            <h3 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-4">
              COVID/流感評估統計
            </h3>
            <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalAssessments || 0}</div>
                  <p className="text-sm text-gray-600">總評估數</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 mb-1">{stats.highRiskCount || 0}</div>
                  <p className="text-sm text-gray-600">高風險患者</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">{stats.recentCount || 0}</div>
                  <p className="text-sm text-gray-600">近期評估</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{stats.lowRiskCount || 0}</div>
                  <p className="text-sm text-gray-600">低風險患者</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 功能菜单网格 */}
        <div className="mb-8">
          <h3 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-4">
            管理功能
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon
              const getColorTheme = (title) => {
                switch(title) {
                  case '數據概覽':
                    return {
                      bg: 'from-blue-50/80 to-blue-100/60',
                      hoverBg: 'hover:from-blue-100/90 hover:to-blue-200/70',
                      iconBg: 'from-blue-500 to-blue-600',
                      iconShadow: 'shadow-blue-500/30',
                      textHover: 'group-hover:from-blue-700 group-hover:to-blue-600',
                      cardShadow: 'shadow-blue-500/15 hover:shadow-blue-500/25'
                    }
                  case '患者管理':
                    return {
                      bg: 'from-green-50/80 to-green-100/60',
                      hoverBg: 'hover:from-green-100/90 hover:to-green-200/70',
                      iconBg: 'from-green-500 to-green-600',
                      iconShadow: 'shadow-green-500/30',
                      textHover: 'group-hover:from-green-700 group-hover:to-green-600',
                      cardShadow: 'shadow-green-500/15 hover:shadow-green-500/25'
                    }
                  case '指導建議':
                    return {
                      bg: 'from-purple-50/80 to-purple-100/60',
                      hoverBg: 'hover:from-purple-100/90 hover:to-purple-200/70',
                      iconBg: 'from-purple-500 to-purple-600',
                      iconShadow: 'shadow-purple-500/30',
                      textHover: 'group-hover:from-purple-700 group-hover:to-purple-600',
                      cardShadow: 'shadow-purple-500/15 hover:shadow-purple-500/25'
                    }
                  case '系統設置':
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
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`p-3 bg-gradient-to-br ${colorTheme.iconBg} rounded-2xl shadow-xl ${colorTheme.iconShadow} group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <h3 className={`text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent ${colorTheme.textHover} transition-all duration-300`}>
                          {item.title}
                        </h3>
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
        </div>

        {/* 快速操作提醒 */}
        <div className="mt-12">
          <div className="flex items-start">
            <div className="p-3 bg-gradient-to-br from-purple-400/60 via-blue-400/60 to-indigo-400/60 rounded-2xl shadow-lg shadow-purple-500/20 mr-6 mt-1 flex-shrink-0">
              <Activity className="h-6 w-6 text-white/90" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-4">COVID/流感管理提醒</h3>
              <ul className="text-gray-700/90 space-y-3">
                <li className="flex items-center group">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                  <span className="group-hover:text-purple-700 transition-colors duration-200">定期檢查高風險患者的評估結果</span>
                </li>
                <li className="flex items-center group">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                  <span className="group-hover:text-blue-700 transition-colors duration-200">及時更新檢測和隔離指導建議</span>
                </li>
                <li className="flex items-center group">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                  <span className="group-hover:text-indigo-700 transition-colors duration-200">監控評估數據趨勢變化</span>
                </li>
                <li className="flex items-center group">
                  <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                  <span className="group-hover:text-teal-700 transition-colors duration-200">根據疫情變化調整風險評估標準</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 