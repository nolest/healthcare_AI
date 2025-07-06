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
import i18n from '../utils/i18n.js'

export default function PatientCovidAssessmentResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    
    checkUserPermission()
    loadAssessmentResult()
    
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
    return type === 'covid' ? t('pages.covid_assessment_result.covid_assessment') : t('pages.covid_assessment_result.flu_assessment')
  }

  const getAssessmentTypeIcon = (type) => {
    return type === 'covid' ? Shield : Activity
  }

  const formatSymptoms = (symptoms) => {
    const symptomLabels = {
      'fever': t('pages.covid_assessment_result.symptom_fever'),
      'cough': t('pages.covid_assessment_result.symptom_cough'), 
      'shortness_breath': t('pages.covid_assessment_result.symptom_shortness_breath'),
      'loss_taste_smell': t('pages.covid_assessment_result.symptom_loss_taste_smell'),
      'body_aches': t('pages.covid_assessment_result.symptom_body_aches'),
      'fatigue': t('pages.covid_assessment_result.symptom_fatigue'),
      'headache': t('pages.covid_assessment_result.symptom_headache'),
      'sore_throat': t('pages.covid_assessment_result.symptom_sore_throat'),
      'runny_nose': t('pages.covid_assessment_result.symptom_runny_nose'),
      'chills': t('pages.covid_assessment_result.symptom_chills'),
      'nausea': t('pages.covid_assessment_result.symptom_nausea'),
      'diarrhea': t('pages.covid_assessment_result.symptom_diarrhea')
    }
    
    return symptoms.map(symptom => symptomLabels[symptom] || symptom)
  }

  const t = (key) => {
    language; // 确保组件依赖于language状态
    return i18n.t(key)
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('pages.covid_assessment_result.loading')}</p>
        </div>
      </div>
    )
  }

  if (!assessmentResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{t('pages.covid_assessment_result.no_result')}</p>
          <Button 
            onClick={() => navigate('/patient/covid-assessment')} 
            className="mt-4"
          >
            {t('pages.covid_assessment_result.back_to_assessment')}
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
        title={t('pages.covid_assessment_result.title')}
        subtitle={t('pages.covid_assessment_result.subtitle')}
        icon={CheckCircle}
        showBackButton={true}
        user={user}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        
        {/* 成功提示 */}
        <Alert className="mb-8 border-0 bg-gradient-to-br from-green-50/80 to-emerald-50/80 rounded-2xl shadow-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">
            {t('pages.covid_assessment_result.success_message')}
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
                    {t('pages.covid_assessment_result.assessment_time', { time: new Date(assessmentResult.createdAt).toLocaleString(i18n.getCurrentLanguage() === 'en' ? 'en-US' : 'zh-TW') })}
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
                  <span className="font-medium text-gray-700">{t('pages.covid_assessment_result.risk_score')}</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {assessmentResult.riskScore} {t('pages.covid_assessment_result.points')}
                </div>
              </div>
              
              {assessmentResult.temperature && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-gray-700">{t('pages.covid_assessment_result.temperature')}</span>
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
                  <h3 className="text-lg font-semibold text-gray-800">{t('pages.covid_assessment_result.recorded_symptoms')}</h3>
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
                  <h3 className="text-lg font-semibold text-gray-800">{t('pages.covid_assessment_result.professional_recommendations')}</h3>
                </div>
                
                <div className="grid gap-4">
                  {/* 检测建议 */}
                  {assessmentResult.recommendations.testing && assessmentResult.recommendations.testing.length > 0 && (
                    <div className="p-4 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 rounded-xl">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        {t('pages.covid_assessment_result.testing_recommendations')}
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
                        {t('pages.covid_assessment_result.isolation_recommendations')}
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
                        {t('pages.covid_assessment_result.medical_recommendations')}
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
                        {t('pages.covid_assessment_result.prevention_measures')}
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
                        {t('pages.covid_assessment_result.monitoring_recommendations')}
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
                {t('pages.covid_assessment_result.important_reminder')}
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
            {t('pages.covid_assessment_result.view_history')}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/patient')}
            className="flex-1 h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Home className="w-5 h-5 mr-2" />
            {t('pages.covid_assessment_result.back_to_home')}
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/patient/covid-assessment')}
            className="h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {t('pages.covid_assessment_result.assess_again')}
          </Button>
        </div>

      </main>
    </div>
  )
} 