import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { Alert, AlertDescription } from '../components/ui/alert.jsx'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Clock, 
  Users, 
  FileText,
  Home,
  History,
  Thermometer,
  Heart,
  Stethoscope,
  Pill,
  ArrowRight
} from 'lucide-react'
import PatientHeader from '../components/ui/PatientHeader.jsx'
import apiService from '../services/api.js'

export default function PatientCovidAssessmentResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserPermission()
    loadAssessmentResult()
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

  const loadAssessmentResult = () => {
    try {
      // 从路由state中获取评估结果
      const result = location.state?.assessmentResult
      if (result) {
        setAssessmentResult(result)
      } else {
        // 如果没有结果数据，跳转回评估页面
        navigate('/patient/covid-assessment')
        return
      }
    } catch (error) {
      console.error('加载评估结果失败:', error)
      navigate('/patient/covid-assessment')
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevelBadge = (riskLevel, riskLevelLabel) => {
    const variants = {
      'very_high': 'destructive',
      'high': 'destructive', 
      'medium': 'default',
      'low': 'secondary',
      'very_low': 'secondary'
    }
    
    const colors = {
      'very_high': 'bg-red-600',
      'high': 'bg-red-500',
      'medium': 'bg-yellow-500', 
      'low': 'bg-green-500',
      'very_low': 'bg-green-400'
    }

    return (
      <Badge 
        variant={variants[riskLevel] || 'default'} 
        className={`${colors[riskLevel]} text-white px-4 py-2 text-sm font-semibold`}
      >
        {riskLevelLabel || riskLevel}
      </Badge>
    )
  }

  const getAssessmentTypeLabel = (type) => {
    return type === 'covid' ? 'COVID-19評估' : '流感評估'
  }

  const getAssessmentTypeIcon = (type) => {
    return type === 'covid' ? Shield : Activity
  }

  const formatSymptoms = (symptoms) => {
    const symptomLabels = {
      'fever': '發燒',
      'cough': '咳嗽', 
      'shortness_breath': '呼吸困難',
      'loss_taste_smell': '味嗅覺喪失',
      'body_aches': '肌肉疼痛',
      'fatigue': '疲勞',
      'headache': '頭痛',
      'sore_throat': '喉嚨痛',
      'runny_nose': '流鼻涕',
      'chills': '寒顫',
      'nausea': '噁心',
      'diarrhea': '腹瀉'
    }
    
    return symptoms.map(symptom => symptomLabels[symptom] || symptom)
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入評估結果中...</p>
        </div>
      </div>
    )
  }

  if (!assessmentResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">無法加載評估結果</p>
          <Button 
            onClick={() => navigate('/patient/covid-assessment')} 
            className="mt-4"
          >
            返回評估頁面
          </Button>
        </div>
      </div>
    )
  }

  const AssessmentIcon = getAssessmentTypeIcon(assessmentResult.assessmentType)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-teal-200/20 to-green-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <PatientHeader 
        title="評估結果"
        subtitle="您的健康風險評估報告"
        icon={CheckCircle}
        showBackButton={true}
        user={user}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* 成功提示 */}
        <Alert className="mb-8 border-0 bg-gradient-to-br from-green-50/80 to-emerald-50/80 rounded-2xl shadow-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">
            🎉 評估已成功完成！您的健康數據已安全保存，醫護人員將根據結果提供專業建議。
          </AlertDescription>
        </Alert>

        {/* 评估结果卡片 */}
        <Card className="overflow-hidden bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl">
                  <AssessmentIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                    {getAssessmentTypeLabel(assessmentResult.assessmentType)}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    評估時間：{new Date(assessmentResult.createdAt).toLocaleString('zh-TW')}
                  </CardDescription>
                </div>
              </div>
              {getRiskLevelBadge(assessmentResult.riskLevel, assessmentResult.riskLevelLabel)}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-700">風險評分</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {assessmentResult.riskScore} 分
                </div>
              </div>
              
              {assessmentResult.temperature && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-gray-700">體溫</span>
                  </div>
                  <div className="text-2xl font-bold text-red-500">
                    {assessmentResult.temperature}°C
                  </div>
                </div>
              )}
            </div>

            {/* 症状列表 */}
            {assessmentResult.symptoms && assessmentResult.symptoms.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">已記錄症狀</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formatSymptoms(assessmentResult.symptoms).map((symptom, index) => (
                    <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 建议和措施 */}
            {assessmentResult.recommendations && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">專業建議</h3>
                </div>
                
                <div className="grid gap-4">
                  {/* 检测建议 */}
                  {assessmentResult.recommendations.testing && assessmentResult.recommendations.testing.length > 0 && (
                    <div className="p-4 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 rounded-xl">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        檢測建議
                      </h4>
                      <ul className="space-y-1 text-sm text-blue-700">
                        {assessmentResult.recommendations.testing.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <ArrowRight className="h-3 w-3 mt-1 mr-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 隔离建议 */}
                  {assessmentResult.recommendations.isolation && assessmentResult.recommendations.isolation.length > 0 && (
                    <div className="p-4 bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-xl">
                      <h4 className="font-medium text-amber-800 mb-2 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        隔離建議
                      </h4>
                      <ul className="space-y-1 text-sm text-amber-700">
                        {assessmentResult.recommendations.isolation.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <ArrowRight className="h-3 w-3 mt-1 mr-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 医疗建议 */}
                  {assessmentResult.recommendations.medical && assessmentResult.recommendations.medical.length > 0 && (
                    <div className="p-4 bg-gradient-to-br from-red-50/80 to-pink-50/80 rounded-xl">
                      <h4 className="font-medium text-red-800 mb-2 flex items-center">
                        <Pill className="h-4 w-4 mr-2" />
                        醫療建議
                      </h4>
                      <ul className="space-y-1 text-sm text-red-700">
                        {assessmentResult.recommendations.medical.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <ArrowRight className="h-3 w-3 mt-1 mr-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 预防建议 */}
                  {assessmentResult.recommendations.prevention && assessmentResult.recommendations.prevention.length > 0 && (
                    <div className="p-4 bg-gradient-to-br from-green-50/80 to-emerald-50/80 rounded-xl">
                      <h4 className="font-medium text-green-800 mb-2 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        預防措施
                      </h4>
                      <ul className="space-y-1 text-sm text-green-700">
                        {assessmentResult.recommendations.prevention.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <ArrowRight className="h-3 w-3 mt-1 mr-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 监测建议 */}
                  {assessmentResult.recommendations.monitoring && assessmentResult.recommendations.monitoring.length > 0 && (
                    <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 rounded-xl">
                      <h4 className="font-medium text-indigo-800 mb-2 flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        監測建議
                      </h4>
                      <ul className="space-y-1 text-sm text-indigo-700">
                        {assessmentResult.recommendations.monitoring.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <ArrowRight className="h-3 w-3 mt-1 mr-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 重要提醒 */}
            <Alert className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-r-2xl">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>重要提醒：</strong>此評估結果僅供參考，不能替代專業醫療診斷。如有嚴重症狀或疑慮，請立即就醫。
              </AlertDescription>
            </Alert>

          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate('/patient/covid-assessment/history')}
            className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
          >
            <History className="w-5 h-5 mr-2" />
            查看評估歷史
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/patient')}
            className="flex-1 h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Home className="w-5 h-5 mr-2" />
            返回主頁
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/patient/covid-assessment')}
            className="h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            再次評估
          </Button>
        </div>

      </main>
    </div>
  )
} 