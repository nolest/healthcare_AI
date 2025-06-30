import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { Alert, AlertDescription } from '../components/ui/alert.jsx'
import { 
  Shield, 
  User, 
  ArrowLeft,
  Activity,
  Clock,
  FileText,
  AlertTriangle
} from 'lucide-react'
import CovidFluAssessmentForm from '../components/covid-flu/CovidFluAssessmentForm.jsx'
import CovidFluHistory from '../components/covid-flu/CovidFluHistory.jsx'
import LanguageSwitcher from '../components/LanguageSwitcher.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n.js'

export default function PatientCovidAssessmentPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('assessment')
  const [assessmentHistory, setAssessmentHistory] = useState([])
  const [latestAssessment, setLatestAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    
    // 检查用户权限
    checkUserPermission()
    loadAssessmentHistory()
    
    return () => {
      i18n.removeListener(handleLanguageChange)
    }
  }, [])

  const checkUserPermission = async () => {
    try {
      const currentUser = await apiService.getCurrentUser()
      if (currentUser.role === 'medical_staff') {
        navigate('/medical-staff')
        return
      }
      setUser(currentUser)
    } catch (error) {
      console.error('权限检查失败:', error)
      navigate('/login')
    }
  }

  const loadAssessmentHistory = async () => {
    try {
      const assessments = await apiService.getMyCovidAssessments()
      setAssessmentHistory(assessments)
      
      // 设置最新的评估结果
      if (assessments.length > 0) {
        const latest = assessments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
        setLatestAssessment(latest)
      }
    } catch (error) {
      console.error('加载评估历史失败:', error)
      setAssessmentHistory([])
    } finally {
      setLoading(false)
    }
  }

  const handleAssessmentComplete = (newAssessment) => {
    setLatestAssessment(newAssessment)
    setAssessmentHistory([newAssessment, ...assessmentHistory])
    setActiveTab('result')
  }

  const handleLogout = async () => {
    try {
      await apiService.logout()
      navigate('/login')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  const getRiskLevelColor = (riskLevel) => {
    if (!riskLevel) return 'bg-gray-500'
    
    switch (riskLevel) {
      case 'very_high':
        return 'bg-red-600'
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      case 'very_low':
        return 'bg-green-400'
      default:
        return 'bg-gray-500'
    }
  }

  const getRiskLevelText = (riskLevel) => {
    switch (riskLevel) {
      case 'very_high': return '极高风险'
      case 'high': return '高风险'
      case 'medium': return '中等风险'
      case 'low': return '低风险'
      case 'very_low': return '极低风险'
      default: return '未知风险'
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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/patient')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                返回主面板
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">COVID/流感健康评估</h1>
                  <p className="text-sm text-gray-500">个人健康监测与风险评估</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.fullName || user.username}</span>
                <Badge variant="secondary">患者</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                登出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 最新评估状态概览 */}
        {latestAssessment && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                最新健康状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`inline-flex items-center px-3 py-2 rounded-full text-white text-sm font-medium ${getRiskLevelColor(latestAssessment.riskLevel)}`}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {getRiskLevelText(latestAssessment.riskLevel)}
                  </div>
                  <div className="text-sm text-gray-600">
                    评估时间: {new Date(latestAssessment.createdAt).toLocaleString()}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('result')}
                >
                  查看详情
                </Button>
              </div>
              
              {latestAssessment.riskLevel === 'high' || latestAssessment.riskLevel === 'very_high' ? (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>重要提醒：</strong>
                    您的评估结果显示较高风险，建议立即联系医疗机构或拨打健康咨询热线。
                  </AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* 功能标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assessment" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              症状评估
            </TabsTrigger>
            <TabsTrigger value="result" className="flex items-center gap-2" disabled={!latestAssessment}>
              <FileText className="h-4 w-4" />
              评估结果
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              历史记录
            </TabsTrigger>
          </TabsList>

          {/* 症状评估标签页 */}
          <TabsContent value="assessment" className="space-y-6">
            <CovidFluAssessmentForm 
              user={user}
              onAssessmentComplete={handleAssessmentComplete}
            />
          </TabsContent>

          {/* 评估结果标签页 */}
          <TabsContent value="result" className="space-y-6">
            {latestAssessment ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    最新评估结果
                  </CardTitle>
                  <CardDescription>
                    评估时间: {new Date(latestAssessment.createdAt).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 风险等级 */}
                  <div className="text-center">
                    <div className={`inline-flex items-center px-6 py-3 rounded-full text-white text-lg font-bold ${getRiskLevelColor(latestAssessment.riskLevel)}`}>
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      {getRiskLevelText(latestAssessment.riskLevel)}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      风险评分: {latestAssessment.riskScore || 0} 分
                    </p>
                  </div>

                  {/* 症状摘要 */}
                  {latestAssessment.symptoms && latestAssessment.symptoms.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">报告症状</h4>
                      <div className="flex flex-wrap gap-2">
                        {latestAssessment.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="outline">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 建议措施 */}
                  {latestAssessment.recommendations && (
                    <div>
                      <h4 className="font-medium mb-2">健康建议</h4>
                      <div className="space-y-2">
                        {Object.entries(latestAssessment.recommendations).map(([category, items]) => (
                          items.length > 0 && (
                            <div key={category}>
                              <h5 className="text-sm font-medium text-gray-700 capitalize">{category}</h5>
                              <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                                {items.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">暂无评估结果</p>
                  <p className="text-sm text-gray-400 mt-2">完成症状评估后，结果将显示在这里</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 历史记录标签页 */}
          <TabsContent value="history" className="space-y-6">
            <CovidFluHistory 
              assessments={assessmentHistory}
              onViewAssessment={(assessment) => {
                setLatestAssessment(assessment)
                setActiveTab('result')
              }}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 