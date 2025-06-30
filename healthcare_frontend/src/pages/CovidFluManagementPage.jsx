import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { Alert, AlertDescription } from '../components/ui/alert.jsx'
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  FileText,
  Settings,
  ArrowLeft,
  Activity,
  BarChart3
} from 'lucide-react'
import CovidFluManagement from '../components/covid-flu/CovidFluManagement.jsx'
import CovidFluStats from '../components/covid-flu/CovidFluStats.jsx'
import CovidFluRecommendations from '../components/covid-flu/CovidFluRecommendations.jsx'
import LanguageSwitcher from '../components/LanguageSwitcher.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n.js'

export default function CovidFluManagementPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    
    // 检查用户权限
    checkUserPermission()
    loadData()
    
    return () => {
      i18n.removeListener(handleLanguageChange)
    }
  }, [])

  const checkUserPermission = async () => {
    try {
      const currentUser = await apiService.getCurrentUser()
      if (currentUser.role !== 'medical_staff') {
        navigate('/patient')
        return
      }
      setUser(currentUser)
    } catch (error) {
      console.error('权限检查失败:', error)
      navigate('/login')
    }
  }

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

  const handleLogout = async () => {
    try {
      await apiService.logout()
      navigate('/login')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  const t = (key) => {
    language; // 确保组件依赖于language状态
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
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/medical')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                返回主面板
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">COVID/流感管理中心</h1>
                  <p className="text-xs text-gray-500">专业疫情监控与管理平台</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{user.fullName || user.username}</span>
                <Badge variant="secondary" className="text-xs">医护人员</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                登出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* 主要功能标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              数据概览
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              患者管理
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              指导建议
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 text-sm">
              <Settings className="h-4 w-4" />
              系统设置
            </TabsTrigger>
          </TabsList>

          {/* 数据概览标签页 */}
          <TabsContent value="overview" className="space-y-4">
            <CovidFluStats stats={stats} onRefresh={loadData} />
          </TabsContent>

          {/* 患者管理标签页 */}
          <TabsContent value="management" className="space-y-4">
            <CovidFluManagement user={user} />
          </TabsContent>

          {/* 指导建议标签页 */}
          <TabsContent value="recommendations" className="space-y-4">
            <CovidFluRecommendations />
          </TabsContent>

          {/* 系统设置标签页 */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">COVID/流感管理设置</CardTitle>
                <CardDescription className="text-sm">
                  配置评估标准、风险阈值和通知设置
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    系统设置功能正在开发中，敬请期待。
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 