import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { Shield, Clock, Calendar, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import PatientHeader from '../components/ui/PatientHeader.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n.js'

export default function PatientCovidAssessmentHistoryPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    
    return () => {
      i18n.removeListener(handleLanguageChange)
    }
  }, [])

  useEffect(() => {
    const currentUser = apiService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      fetchAssessmentHistory()
    } else {
      navigate('/login')
    }
  }, [navigate])

  const fetchAssessmentHistory = async () => {
    try {
      setLoading(true)
      const data = await apiService.getMyCovidAssessments()
      setAssessments(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch (error) {
      console.error('获取COVID评估历史失败:', error)
      setAssessments([])
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'very_high':
        return 'bg-red-600 text-white'
      case 'high':
        return 'bg-red-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-white'
      case 'low':
        return 'bg-green-500 text-white'
      case 'very_low':
        return 'bg-green-400 text-white'
      default:
        return 'bg-gray-500 text-white'
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

  const getAssessmentTypeText = (type) => {
    switch (type) {
      case 'covid': return 'COVID-19'
      case 'flu': return '流感'
      case 'both': return 'COVID/流感综合'
      default: return '健康评估'
    }
  }

  const formatSymptoms = (symptoms) => {
    if (!symptoms || symptoms.length === 0) return '无症状'
    return symptoms.join(', ')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <PatientHeader 
        title="COVID/流感評估歷史"
        subtitle="查看您的健康評估記錄和風險分析"
        icon={Shield}
        showBackButton={true}
        backPath="/patient/covid-assessment"
        user={user}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl shadow-blue-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">总评估次数</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{assessments.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl shadow-purple-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">高风险评估</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {assessments.filter(a => ['high', 'very_high'].includes(a.riskLevel)).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl shadow-green-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">近期状态</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {assessments.length > 0 ? getRiskLevelText(assessments[0].riskLevel) : '未评估'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 历史记录列表 */}
        <Card className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl shadow-blue-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              <Shield className="h-6 w-6 text-blue-600" />
              COVID/流感評估歷史記錄
            </CardTitle>
            <CardDescription className="text-gray-600">
              您的健康評估記錄，包括症狀、風險等級和建議措施
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">尚無評估記錄</p>
                <p className="text-gray-400 mb-6">開始您的第一次健康評估</p>
                <Button 
                  onClick={() => navigate('/patient/covid-assessment')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  立即評估
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment, index) => (
                  <div key={assessment._id || index} className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getAssessmentTypeText(assessment.assessmentType)}評估
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {formatDate(assessment.createdAt)}
                          </div>
                        </div>
                      </div>
                      <Badge className={getRiskLevelColor(assessment.riskLevel)}>
                        {getRiskLevelText(assessment.riskLevel)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">症狀記錄</h4>
                        <p className="text-sm text-gray-600 bg-white/50 rounded-lg p-3">
                          {formatSymptoms(assessment.symptoms)}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">風險因素</h4>
                        <p className="text-sm text-gray-600 bg-white/50 rounded-lg p-3">
                          {assessment.riskFactors && assessment.riskFactors.length > 0 
                            ? assessment.riskFactors.join(', ') 
                            : '無特殊風險因素'}
                        </p>
                      </div>
                    </div>

                    {assessment.temperature && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-700 mb-2">體溫記錄</h4>
                        <p className="text-sm text-gray-600 bg-white/50 rounded-lg p-3">
                          {assessment.temperature}°C
                        </p>
                      </div>
                    )}

                    {assessment.recommendations && assessment.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">健康建議</h4>
                        <ul className="text-sm text-gray-600 bg-white/50 rounded-lg p-3 space-y-1">
                          {assessment.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="mt-8 flex justify-center">
          <Button 
            onClick={() => navigate('/patient/covid-assessment')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Shield className="h-4 w-4 mr-2" />
            進行新的評估
          </Button>
        </div>
      </main>
    </div>
  )
} 