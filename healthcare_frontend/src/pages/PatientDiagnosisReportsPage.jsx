import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { FileText, Clock, Activity, Shield, AlertTriangle, Eye, User, Calendar, Heart, Thermometer, Droplets, Stethoscope } from 'lucide-react'
import PatientHeader from '../components/ui/PatientHeader.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n.js'

export default function PatientDiagnosisReportsPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [measurementDiagnoses, setMeasurementDiagnoses] = useState([])
  const [covidDiagnoses, setCovidDiagnoses] = useState([])
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
      fetchDiagnosisReports()
    } else {
      navigate('/login')
    }
  }, [navigate])

  const fetchDiagnosisReports = async () => {
    try {
      setLoading(true)
      const currentUser = apiService.getCurrentUser()
      
      // 支持多种用户ID字段格式
      let userId = currentUser?.id || currentUser?.userId || currentUser?._id
      
      console.log('🔍 获取诊断报告 - 用户ID:', userId)
      
      // 如果还是没有ID，尝试获取最新的用户信息
      if (!userId) {
        try {
          const profileResponse = await apiService.getProfile()
          const profileUser = profileResponse?.user || profileResponse
          userId = profileUser?._id || profileUser?.id || profileUser?.userId
          console.log('🔍 从profile获取的用户ID:', userId)
        } catch (error) {
          console.error('获取用户profile失败:', error)
        }
      }
      
      if (!userId) {
        console.error('无法获取用户ID')
        setMeasurementDiagnoses([])
        setCovidDiagnoses([])
        return
      }
      
      // 并行获取两种诊断记录
      const [measurementData, covidData] = await Promise.all([
        apiService.getPatientMeasurementDiagnoses(userId).then(response => {
          // 处理包装格式的响应
          const data = response?.data || response || []
          console.log('✅ 获取普通诊断记录成功:', data.length, '条')
          return Array.isArray(data) ? data : []
        }).catch(err => {
          console.error('❌ 获取普通诊断记录失败:', err.message)
          return []
        }),
        apiService.getPatientCovidDiagnoses(userId).then(response => {
          // 处理包装格式的响应
          const data = response?.data || response || []
          console.log('✅ 获取COVID诊断记录成功:', data.length, '条')
          return Array.isArray(data) ? data : []
        }).catch(err => {
          console.error('❌ 获取COVID诊断记录失败:', err.message)
          return []
        })
      ])
      
      // 按时间排序
      const sortedMeasurementData = measurementData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      const sortedCovidData = covidData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      
      setMeasurementDiagnoses(sortedMeasurementData)
      setCovidDiagnoses(sortedCovidData)
      
    } catch (error) {
      console.error('❌ 获取诊断报告失败:', error)
      setMeasurementDiagnoses([])
      setCovidDiagnoses([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewMeasurementDiagnosis = (diagnosisId) => {
    navigate(`/patient/diagnosis-reports/${diagnosisId}`)
  }

  const handleViewCovidDiagnosis = (diagnosisId) => {
    navigate(`/patient/diagnosis-reports/${diagnosisId}`)
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString(language === 'en' ? 'en-US' : 'zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getRiskLevelText = (riskLevel) => {
    if (typeof riskLevel === 'object' && riskLevel?.label) {
      return riskLevel.label
    }
    
    switch (riskLevel) {
      case 'low': return i18n.t('pages.diagnosis_reports.risk_level.low')
      case 'medium': return i18n.t('pages.diagnosis_reports.risk_level.medium')
      case 'high': return i18n.t('pages.diagnosis_reports.risk_level.high')
      case 'critical': return i18n.t('pages.diagnosis_reports.risk_level.critical')
      case 'very_low': return i18n.t('pages.diagnosis_reports.risk_level.very_low')
      case 'very_high': return i18n.t('pages.diagnosis_reports.risk_level.very_high')
      default: return riskLevel || i18n.t('pages.diagnosis_reports.risk_level.unknown')
    }
  }

  const getRiskLevelColor = (riskLevel) => {
    const level = typeof riskLevel === 'string' ? riskLevel : (riskLevel?.label || riskLevel)
    
    switch (level) {
      case '極高風險':
      case 'very_high':
      case '高風險':
      case 'high':
      case '緊急':
      case 'critical':
        return 'bg-red-500'
      case '中等風險':
      case 'medium':
        return 'bg-yellow-500'
      case '低風險':
      case 'low':
      case '極低風險':
      case 'very_low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  // 获取卡片背景颜色 - 根据风险等级返回优雅清淡的颜色
  const getCardBackgroundColor = (riskLevel) => {
    const level = typeof riskLevel === 'string' ? riskLevel : (riskLevel?.label || riskLevel)
    
    switch (level) {
      case '極高風險':
      case 'very_high':
      case '高風險':
      case 'high':
      case '緊急':
      case 'critical':
        return 'bg-gradient-to-br from-red-50/90 to-red-100/70'
      case '中等風險':
      case 'medium':
        return 'bg-gradient-to-br from-amber-50/90 to-amber-100/70'
      case '低風險':
      case 'low':
      case '極低風險':
      case 'very_low':
        return 'bg-gradient-to-br from-emerald-50/90 to-emerald-100/70'
      default:
        return 'bg-gradient-to-br from-slate-50/90 to-slate-100/70'
    }
  }

  // 获取卡片边框颜色
  const getCardBorderColor = (riskLevel) => {
    const level = typeof riskLevel === 'string' ? riskLevel : (riskLevel?.label || riskLevel)
    
    switch (level) {
      case '極高風險':
      case 'very_high':
      case '高風險':
      case 'high':
      case '緊急':
      case 'critical':
        return 'ring-red-200/50'
      case '中等風險':
      case 'medium':
        return 'ring-amber-200/50'
      case '低風險':
      case 'low':
      case '極低風險':
      case 'very_low':
        return 'ring-emerald-200/50'
      default:
        return 'ring-slate-200/50'
    }
  }

  // 获取按钮颜色
  const getButtonColor = (riskLevel) => {
    const level = typeof riskLevel === 'string' ? riskLevel : (riskLevel?.label || riskLevel)
    
    switch (level) {
      case '極高風險':
      case 'very_high':
      case '高風險':
      case 'high':
      case '緊急':
      case 'critical':
        return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 hover:from-red-100 hover:to-red-200 ring-1 ring-red-200/50'
      case '中等風險':
      case 'medium':
        return 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 hover:from-amber-100 hover:to-amber-200 ring-1 ring-amber-200/50'
      case '低風險':
      case 'low':
      case '極低風險':
      case 'very_low':
        return 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 hover:from-emerald-100 hover:to-emerald-200 ring-1 ring-emerald-200/50'
      default:
        return 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 hover:from-slate-100 hover:to-slate-200 ring-1 ring-slate-200/50'
    }
  }

  // 获取症状徽章颜色
  const getSymptomBadgeColor = (riskLevel) => {
    const level = typeof riskLevel === 'string' ? riskLevel : (riskLevel?.label || riskLevel)
    
    switch (level) {
      case '極高風險':
      case 'very_high':
      case '高風險':
      case 'high':
      case '緊急':
      case 'critical':
        return 'bg-red-100/80 text-red-700 ring-1 ring-red-200/50'
      case '中等風險':
      case 'medium':
        return 'bg-amber-100/80 text-amber-700 ring-1 ring-amber-200/50'
      case '低風險':
      case 'low':
      case '極低風險':
      case 'very_low':
        return 'bg-emerald-100/80 text-emerald-700 ring-1 ring-emerald-200/50'
      default:
        return 'bg-slate-100/80 text-slate-700 ring-1 ring-slate-200/50'
    }
  }

  // 获取图标颜色
  const getIconColor = (riskLevel) => {
    const level = typeof riskLevel === 'string' ? riskLevel : (riskLevel?.label || riskLevel)
    
    switch (level) {
      case '極高風險':
      case 'very_high':
      case '高風險':
      case 'high':
      case '緊急':
      case 'critical':
        return 'text-red-600'
      case '中等風險':
      case 'medium':
        return 'text-amber-600'
      case '低風險':
      case 'low':
      case '極低風險':
      case 'very_low':
        return 'text-emerald-600'
      default:
        return 'text-slate-600'
    }
  }

  const renderMeasurementDiagnosisCard = (diagnosis) => {
    const measurementData = diagnosis.measurementId
    
    return (
      <Card className={`${getCardBackgroundColor(diagnosis.riskLevel)} backdrop-blur-lg ring-1 ${getCardBorderColor(diagnosis.riskLevel)} shadow-md transition-all duration-300 !py-2 !gap-1.5`}>
        <CardHeader className="pb-1 px-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Activity className={`h-4 w-4 ${getIconColor(diagnosis.riskLevel)}`} />
              <CardTitle className="text-sm text-gray-800">{i18n.t('pages.diagnosis_reports.vital_signs_diagnosis')}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Badge className={`text-white ${getRiskLevelColor(diagnosis.riskLevel)} text-xs px-2 py-1 h-5`}>
                {getRiskLevelText(diagnosis.riskLevel)}
              </Badge>
              <Button
                size="sm"
                onClick={() => handleViewMeasurementDiagnosis(diagnosis._id)}
                className={`h-6 px-2 text-xs ml-1 ${getButtonColor(diagnosis.riskLevel)} shadow-sm transition-all duration-200`}
              >
                <Eye className="h-3 w-3 mr-1" />
                {i18n.t('pages.diagnosis_reports.details')}
              </Button>
            </div>
          </div>
          <CardDescription className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
            <Calendar className="h-3 w-3" />
            {formatDateTime(diagnosis.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-2">
          <div className="space-y-1.5">
            {/* 诊断结果 */}
            <div>
              <h4 className="font-medium text-gray-700 mb-1 text-xs">{i18n.t('pages.diagnosis_reports.diagnosis_result')}</h4>
              <div className="p-2 bg-gradient-to-r from-white/90 to-white/70 rounded-md ring-1 ring-blue-200/30 shadow-sm">
                <p className="text-xs text-gray-800 leading-relaxed">{diagnosis.diagnosis || i18n.t('pages.diagnosis_reports.no_diagnosis_result')}</p>
              </div>
            </div>

            {/* 测量数据 */}
            {measurementData && (
              <div>
                <h4 className="font-medium text-gray-700 mb-1 text-xs">{i18n.t('pages.diagnosis_reports.measurement_data')}</h4>
                <div className="space-y-1">
                  {measurementData.bloodPressure && (
                    <div className="flex items-center gap-2 p-1 bg-gradient-to-r from-white/90 to-white/70 rounded-md ring-1 ring-red-200/30 shadow-sm">
                      <Heart className="h-3 w-3 text-red-500" />
                      <span className="text-xs text-gray-600">{i18n.t('pages.diagnosis_reports.blood_pressure')}:</span>
                      <span className="font-semibold text-xs text-gray-800">{measurementData.bloodPressure}</span>
                    </div>
                  )}
                  {measurementData.heartRate && (
                    <div className="flex items-center gap-2 p-1 bg-gradient-to-r from-white/90 to-white/70 rounded-md ring-1 ring-pink-200/30 shadow-sm">
                      <Heart className="h-3 w-3 text-pink-500" />
                      <span className="text-xs text-gray-600">{i18n.t('pages.diagnosis_reports.heart_rate')}:</span>
                      <span className="font-semibold text-xs text-gray-800">{measurementData.heartRate} bpm</span>
                    </div>
                  )}
                  {measurementData.temperature && (
                    <div className="flex items-center gap-2 p-1 bg-gradient-to-r from-white/90 to-white/70 rounded-md ring-1 ring-orange-200/30 shadow-sm">
                      <Thermometer className="h-3 w-3 text-orange-500" />
                      <span className="text-xs text-gray-600">{i18n.t('pages.diagnosis_reports.temperature')}:</span>
                      <span className="font-semibold text-xs text-gray-800">{measurementData.temperature}°C</span>
                    </div>
                  )}
                  {measurementData.oxygenSaturation && (
                    <div className="flex items-center gap-2 p-1 bg-gradient-to-r from-white/90 to-white/70 rounded-md ring-1 ring-blue-200/30 shadow-sm">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      <span className="text-xs text-gray-600">{i18n.t('pages.diagnosis_reports.oxygen_saturation')}:</span>
                      <span className="font-semibold text-xs text-gray-800">{measurementData.oxygenSaturation}%</span>
                    </div>
                  )}
                  {measurementData.weight && (
                    <div className="flex items-center gap-2 p-1 bg-gradient-to-r from-white/90 to-white/70 rounded-md ring-1 ring-green-200/30 shadow-sm">
                      <Stethoscope className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-gray-600">{i18n.t('pages.diagnosis_reports.weight')}:</span>
                      <span className="font-semibold text-xs text-gray-800">{measurementData.weight} kg</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 异常原因 */}
            {diagnosis.abnormalReasons && diagnosis.abnormalReasons.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-1 text-xs">{i18n.t('pages.diagnosis_reports.abnormal_reasons')}</h4>
                <div className="flex flex-wrap gap-1">
                  {diagnosis.abnormalReasons.slice(0, 3).map((reason, index) => (
                    <Badge key={index} className={`text-xs px-1.5 py-0.5 ${getSymptomBadgeColor(diagnosis.riskLevel)} shadow-sm`}>
                      {reason}
                    </Badge>
                  ))}
                  {diagnosis.abnormalReasons.length > 3 && (
                    <Badge className="text-xs px-1.5 py-0.5 bg-gray-100/80 text-gray-600 ring-1 ring-gray-200/50 shadow-sm">
                      +{diagnosis.abnormalReasons.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* 医生信息 */}
            {diagnosis.doctorId && (
              <div className="pt-1 border-t border-gray-200/50">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {i18n.t('pages.diagnosis_reports.diagnosis_doctor')}：{diagnosis.doctorId.fullName || diagnosis.doctorId.username}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderCovidDiagnosisCard = (diagnosis) => {
    const assessmentData = diagnosis.assessmentId
    
    return (
      <Card className={`${getCardBackgroundColor(diagnosis.riskLevel)} backdrop-blur-lg ring-1 ${getCardBorderColor(diagnosis.riskLevel)} shadow-md transition-all duration-300 !py-2 !gap-1.5`}>
        <CardHeader className="pb-1 px-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Shield className={`h-4 w-4 ${getIconColor(diagnosis.riskLevel)}`} />
              <CardTitle className="text-sm text-gray-800">{i18n.t('pages.diagnosis_reports.covid_flu_diagnosis')}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Badge className={`text-white ${getRiskLevelColor(diagnosis.riskLevel)} text-xs px-2 py-1 h-5`}>
                {getRiskLevelText(diagnosis.riskLevel)}
              </Badge>
              <Button
                size="sm"
                onClick={() => handleViewCovidDiagnosis(diagnosis._id)}
                className={`h-6 px-2 text-xs ml-1 ${getButtonColor(diagnosis.riskLevel)} shadow-sm transition-all duration-200`}
              >
                <Eye className="h-3 w-3 mr-1" />
                {i18n.t('pages.diagnosis_reports.details')}
              </Button>
            </div>
          </div>
          <CardDescription className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
            <Calendar className="h-3 w-3" />
            {formatDateTime(diagnosis.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-2">
          <div className="space-y-1.5">
            {/* 诊断结果 */}
            <div>
              <h4 className="font-medium text-gray-700 mb-1 text-xs">{i18n.t('pages.diagnosis_reports.diagnosis_result')}</h4>
              <div className="p-2 bg-gradient-to-r from-white/90 to-white/70 rounded-md ring-1 ring-purple-200/30 shadow-sm">
                <p className="text-xs text-gray-800 leading-relaxed">{diagnosis.diagnosis || i18n.t('pages.diagnosis_reports.no_diagnosis_result')}</p>
              </div>
            </div>

            {/* 评估数据 */}
            {assessmentData && (
              <div>
                <h4 className="font-medium text-gray-700 mb-1 text-xs">{i18n.t('pages.diagnosis_reports.assessment_data')}</h4>
                <div className="space-y-1">
                  {assessmentData.symptoms && assessmentData.symptoms.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">{i18n.t('pages.diagnosis_reports.symptoms')}</p>
                      <div className="flex flex-wrap gap-1">
                        {assessmentData.symptoms.slice(0, 3).map((symptom, index) => (
                          <Badge key={index} className={`text-xs px-1.5 py-0.5 ${getSymptomBadgeColor(diagnosis.riskLevel)} shadow-sm`}>
                            {symptom}
                          </Badge>
                        ))}
                        {assessmentData.symptoms.length > 3 && (
                          <Badge className="text-xs px-1.5 py-0.5 bg-gray-100/80 text-gray-600 ring-1 ring-gray-200/50 shadow-sm">
                            +{assessmentData.symptoms.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {assessmentData.temperature && (
                    <div className="flex items-center gap-2 p-1 bg-gradient-to-r from-white/90 to-white/70 rounded-md ring-1 ring-orange-200/30 shadow-sm">
                      <Thermometer className="h-3 w-3 text-orange-500" />
                      <span className="text-xs text-gray-600">{i18n.t('pages.diagnosis_reports.temperature')}:</span>
                      <span className="font-semibold text-xs text-gray-800">{assessmentData.temperature}°C</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 医生信息 */}
            {diagnosis.doctorId && (
              <div className="pt-1 border-t border-gray-200/50">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {i18n.t('pages.diagnosis_reports.diagnosis_doctor')}：{diagnosis.doctorId.fullName || diagnosis.doctorId.username}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{i18n.t('pages.diagnosis_reports.loading')}</p>
        </div>
      </div>
    )
  }

  const totalDiagnoses = measurementDiagnoses.length + covidDiagnoses.length

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
        title={i18n.t('pages.diagnosis_reports.title')}
        subtitle={i18n.t('pages.diagnosis_reports.subtitle')}
        icon={FileText}
        showBackButton={true}
        user={user}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl shadow-blue-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">{i18n.t('pages.diagnosis_reports.total_diagnoses')}</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{totalDiagnoses}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl shadow-green-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">{i18n.t('pages.diagnosis_reports.vital_signs_diagnoses')}</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{measurementDiagnoses.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl shadow-purple-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">{i18n.t('pages.diagnosis_reports.covid_flu_diagnoses')}</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{covidDiagnoses.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* 左右两列布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左列：生命体征诊断记录 */}
          <div>
            <Card className="bg-gradient-to-br from-white/95 to-blue-50/30 backdrop-blur-lg ring-1 ring-white/30 shadow-2xl shadow-blue-500/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <Activity className="h-6 w-6 text-blue-600" />
                  {i18n.t('pages.diagnosis_reports.vital_signs_records')}
                  <Badge className="ml-2 bg-blue-100 text-blue-700 ring-1 ring-blue-200/50 shadow-sm">
                    {measurementDiagnoses.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {i18n.t('pages.diagnosis_reports.vital_signs_description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`${measurementDiagnoses.length > 0 ? 'h-[60rem]' : 'h-auto'} overflow-y-auto pr-1`}>
                  {measurementDiagnoses.length > 0 ? (
                    <div className="space-y-0">
                      {measurementDiagnoses.map((diagnosis) => (
                        <div key={diagnosis._id} className="py-2">
                          {renderMeasurementDiagnosisCard(diagnosis)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl blur-sm"></div>
                        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                          <div className="flex flex-col items-center">
                            <div className="relative mb-6">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-lg"></div>
                              <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-full">
                                <Activity className="h-8 w-8 text-blue-500" />
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">{i18n.t('pages.diagnosis_reports.no_vital_signs_records')}</h3>
                            <p className="text-sm text-gray-500 text-center leading-relaxed">
                              {i18n.t('pages.diagnosis_reports.no_vital_signs_description')}<br />
                              <span className="text-blue-500 font-medium">{i18n.t('pages.diagnosis_reports.no_vital_signs_action')}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右列：COVID/流感诊断记录 */}
          <div>
            <Card className="bg-gradient-to-br from-white/95 to-purple-50/30 backdrop-blur-lg ring-1 ring-white/30 shadow-2xl shadow-purple-500/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-purple-600" />
                  {i18n.t('pages.diagnosis_reports.covid_flu_records')}
                  <Badge className="ml-2 bg-purple-100 text-purple-700 ring-1 ring-purple-200/50 shadow-sm">
                    {covidDiagnoses.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {i18n.t('pages.diagnosis_reports.covid_flu_description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`${covidDiagnoses.length > 0 ? 'h-[60rem]' : 'h-auto'} overflow-y-auto pr-1`}>
                  {covidDiagnoses.length > 0 ? (
                    <div className="space-y-0">
                      {covidDiagnoses.map((diagnosis) => (
                        <div key={diagnosis._id} className="py-2">
                          {renderCovidDiagnosisCard(diagnosis)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-2xl blur-sm"></div>
                        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                          <div className="flex flex-col items-center">
                            <div className="relative mb-6">
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-lg"></div>
                              <div className="relative bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-full">
                                <Shield className="h-8 w-8 text-purple-500" />
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">{i18n.t('pages.diagnosis_reports.no_covid_records')}</h3>
                            <p className="text-sm text-gray-500 text-center leading-relaxed">
                              {i18n.t('pages.diagnosis_reports.no_covid_description')}<br />
                              <span className="text-purple-500 font-medium">{i18n.t('pages.diagnosis_reports.no_covid_action')}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 