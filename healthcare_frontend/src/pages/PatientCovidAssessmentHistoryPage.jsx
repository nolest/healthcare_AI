import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { Shield, Clock, Calendar, AlertTriangle, CheckCircle, TrendingUp, Thermometer, User, Eye } from 'lucide-react'
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
      console.error(i18n.t('pages.covid_assessment_history.fetch_error'), error)
      setAssessments([])
    } finally {
      setLoading(false)
    }
  }

  const t = (key, params = {}) => {
    language; // 确保组件依赖于language状态
    return i18n.t(key, params)
  }

  const getRiskLevelColor = (riskLevel) => {
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

  const getCardBackgroundColor = (riskLevel) => {
    switch (riskLevel) {
      case 'very_high':
      case 'high':
        return 'bg-gradient-to-br from-red-50/90 to-red-100/70'
      case 'medium':
        return 'bg-gradient-to-br from-amber-50/90 to-amber-100/70'
      case 'low':
      case 'very_low':
        return 'bg-gradient-to-br from-emerald-50/90 to-emerald-100/70'
      default:
        return 'bg-gradient-to-br from-slate-50/90 to-slate-100/70'
    }
  }

  const getCardBorderColor = (riskLevel) => {
    switch (riskLevel) {
      case 'very_high':
      case 'high':
        return 'ring-red-200/50'
      case 'medium':
        return 'ring-amber-200/50'
      case 'low':
      case 'very_low':
        return 'ring-emerald-200/50'
      default:
        return 'ring-slate-200/50'
    }
  }

  const getIconColor = (riskLevel) => {
    switch (riskLevel) {
      case 'very_high':
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-amber-600'
      case 'low':
      case 'very_low':
        return 'text-emerald-600'
      default:
        return 'text-slate-600'
    }
  }

  const getButtonColor = (riskLevel) => {
    switch (riskLevel) {
      case 'very_high':
      case 'high':
        return 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
      case 'medium':
        return 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white'
      case 'low':
      case 'very_low':
        return 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
      default:
        return 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white'
    }
  }

  const getSymptomBadgeColor = (riskLevel) => {
    switch (riskLevel) {
      case 'very_high':
      case 'high':
        return 'bg-red-100/80 text-red-700 ring-1 ring-red-200/50'
      case 'medium':
        return 'bg-amber-100/80 text-amber-700 ring-1 ring-amber-200/50'
      case 'low':
      case 'very_low':
        return 'bg-emerald-100/80 text-emerald-700 ring-1 ring-emerald-200/50'
      default:
        return 'bg-slate-100/80 text-slate-700 ring-1 ring-slate-200/50'
    }
  }

  const getRiskLevelText = (riskLevel) => {
    return t(`pages.covid_assessment_history.risk_levels.${riskLevel}`)
  }

  const getAssessmentTypeText = (type) => {
    return type === 'covid' ? t('assessment.type.covid_assessment') : t('assessment.type.flu_assessment')
  }

  const formatSymptoms = (symptoms) => {
    if (!symptoms || symptoms.length === 0) return t('pages.covid_assessment_history.no_symptoms')
    return symptoms.join(', ')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(language === 'en' ? 'en-US' : 'zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewAssessment = (assessmentId) => {
    navigate(`/patient/covid-assessment/result?aid=${assessmentId}`)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('pages.covid_assessment_history.loading')}</p>
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
        title={t('pages.covid_assessment_history.title')}
        subtitle={t('pages.covid_assessment_history.subtitle')}
        icon={Shield}
        showBackButton={true}
        user={user}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl shadow-blue-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">{t('assessment.stats.total_assessments')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{assessments.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl shadow-purple-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">{t('assessment.stats.high_risk_assessments')}</CardTitle>
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
              <CardTitle className="text-sm font-medium text-gray-700">{t('assessment.stats.recent_status')}</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {assessments.length > 0 ? getRiskLevelText(assessments[0].riskLevel) : t('assessment.stats.not_assessed')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 历史记录列表 */}
        <Card className="bg-white/40 backdrop-blur-xl ring-1 ring-white/30 shadow-2xl shadow-blue-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              <Shield className="h-6 w-6 text-blue-600" />
              {t('assessment.stats.history_title')}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {t('pages.covid_assessment_history.card_description')}
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
                <p className="text-gray-500 text-lg mb-2">{t('pages.covid_assessment_history.no_assessments')}</p>
                <p className="text-gray-400 mb-6">{t('pages.covid_assessment_history.no_assessments_desc')}</p>
                <Button 
                  onClick={() => navigate('/patient/covid-assessment')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {t('pages.covid_assessment_history.start_assessment')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment, index) => (
                  <Card key={assessment._id || index} className={`${getCardBackgroundColor(assessment.riskLevel)} backdrop-blur-lg ring-1 ${getCardBorderColor(assessment.riskLevel)} shadow-md transition-all duration-300 !py-2 !gap-1.5`}>
                    <CardHeader className="pb-1 px-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Shield className={`h-4 w-4 ${getIconColor(assessment.riskLevel)}`} />
                          <CardTitle className="text-sm text-gray-800">
                            {getAssessmentTypeText(assessment.assessmentType)}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge className={`text-white ${getRiskLevelColor(assessment.riskLevel)} text-xs px-2 py-1 h-5`}>
                            {getRiskLevelText(assessment.riskLevel)}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => handleViewAssessment(assessment._id)}
                            className={`h-6 px-2 text-xs ml-1 ${getButtonColor(assessment.riskLevel)} shadow-sm transition-all duration-200`}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {t('pages.covid_assessment_history.view_details')}
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {formatDate(assessment.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 px-3 pb-2">
                      <div className="space-y-1.5">
                        {/* 症状记录 */}
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1 text-xs">{t('pages.covid_assessment_history.symptoms')}</h4>
                          <div className="p-2 bg-gradient-to-r from-white/90 to-white/70 rounded-md ring-1 ring-purple-200/30 shadow-sm">
                            <p className="text-xs text-gray-800 leading-relaxed">
                              {formatSymptoms(assessment.symptoms)}
                            </p>
                          </div>
                        </div>

                        {/* 症状徽章 */}
                        {assessment.symptoms && assessment.symptoms.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-1 text-xs">{t('pages.covid_assessment_history.symptoms_badge')}</h4>
                            <div className="flex flex-wrap gap-1">
                              {assessment.symptoms.slice(0, 4).map((symptom, idx) => (
                                <Badge key={idx} className={`text-xs px-1.5 py-0.5 ${getSymptomBadgeColor(assessment.riskLevel)} shadow-sm`}>
                                  {symptom}
                                </Badge>
                              ))}
                              {assessment.symptoms.length > 4 && (
                                <Badge className="text-xs px-1.5 py-0.5 bg-gray-100/80 text-gray-600 ring-1 ring-gray-200/50 shadow-sm">
                                  +{assessment.symptoms.length - 4}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 体温记录 */}
                        {assessment.temperature && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-1 text-xs">{t('pages.covid_assessment_history.temperature')}</h4>
                            <div className="flex items-center gap-2 p-1 bg-gradient-to-r from-white/90 to-white/70 rounded-md ring-1 ring-orange-200/30 shadow-sm">
                              <Thermometer className="h-3 w-3 text-orange-500" />
                              <span className="text-xs text-gray-600">{t('pages.covid_assessment_history.temperature_value')}:</span>
                              <span className="font-semibold text-xs text-gray-800">{assessment.temperature}°C</span>
                            </div>
                          </div>
                        )}

                        {/* 风险因素 */}
                        {assessment.riskFactors && assessment.riskFactors.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-1 text-xs">{t('pages.covid_assessment_history.risk_factors')}</h4>
                            <div className="p-2 bg-gradient-to-r from-white/90 to-white/70 rounded-md ring-1 ring-amber-200/30 shadow-sm">
                              <p className="text-xs text-gray-800 leading-relaxed">
                                {assessment.riskFactors.join(', ')}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 健康建议 */}
                        {assessment.recommendations && assessment.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-1 text-xs">{t('pages.covid_assessment_history.health_advice')}</h4>
                            <div className="p-2 bg-gradient-to-r from-white/90 to-white/70 rounded-md ring-1 ring-emerald-200/30 shadow-sm">
                              <ul className="text-xs text-gray-800 leading-relaxed space-y-0.5">
                                {assessment.recommendations.slice(0, 3).map((rec, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-emerald-500 mt-0.5">•</span>
                                    {rec}
                                  </li>
                                ))}
                                {assessment.recommendations.length > 3 && (
                                  <li className="text-gray-500 italic">
                                    ... {t('pages.covid_assessment_history.total_advice', { count: assessment.recommendations.length })}
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>


      </main>
    </div>
  )
} 