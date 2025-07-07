import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { Button } from '../components/ui/button.jsx'
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  User, 
  Calendar, 
  Thermometer, 
  Heart, 
  Activity, 
  Droplets, 
  Weight, 
  Gauge,
  Stethoscope,
  FileText,
  Clock,
  UserCheck,
  Pill,
  Home,
  TestTube,
  CalendarCheck,
  StickyNote
} from 'lucide-react'
import PatientHeader from '../components/ui/PatientHeader.jsx'
import ImagePreview from '../components/ui/ImagePreview.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n.js'

export default function PatientCovidDiagnosisReportDetailPage() {
  const { reportId } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())
  const [previewImages, setPreviewImages] = useState([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewInitialIndex, setPreviewInitialIndex] = useState(0)

  // 简化的国际化函数
  const t = (key, params = {}) => i18n.t(key, params)

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
      fetchReportDetail()
    } else {
      navigate('/login')
    }
  }, [reportId, navigate])

  const fetchReportDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 获取COVID诊断详情 - 报告ID:', reportId)
      
      // 尝试从covid-diagnoses API获取数据
      try {
        const response = await apiService.getCovidDiagnosisDetail(reportId)
        console.log('✅ 从covid-diagnoses API获取数据成功:', response)
        
        const reportData = response?.data || response
        setReport(reportData)
        
        // 获取用户信息
        if (reportData?.assessmentId?.userId) {
          try {
            const userResponse = await apiService.getUserById(reportData.assessmentId.userId)
            const userData = userResponse?.data || userResponse
            setUser(userData)
          } catch (userError) {
            console.warn('获取用户信息失败:', userError)
          }
        }
        
      } catch (covidError) {
        console.error('❌ 从covid-diagnoses API获取数据失败:', covidError)
        throw new Error(i18n.t('pages.patient_covid_diagnosis_detail.fetch_failed'))
      }
      
    } catch (error) {
      console.error('❌ 获取COVID诊断详情失败:', error)
      setError(error.message || i18n.t('pages.patient_covid_diagnosis_detail.fetch_failed'))
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return t('common.unknown')
    
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRiskLevelText = (riskLevel) => {
    if (typeof riskLevel === 'object' && riskLevel?.label) {
      return riskLevel.label
    }
    
    switch (riskLevel) {
      case 'very_low': return t('pages.patient_covid_diagnosis_detail.risk_level.very_low')
      case 'low': return t('pages.patient_covid_diagnosis_detail.risk_level.low')
      case 'medium': return t('pages.patient_covid_diagnosis_detail.risk_level.medium')
      case 'high': return t('pages.patient_covid_diagnosis_detail.risk_level.high')
      case 'very_high': return t('pages.patient_covid_diagnosis_detail.risk_level.very_high')
      case 'critical': return t('pages.patient_covid_diagnosis_detail.risk_level.critical')
      default: return riskLevel || t('pages.patient_covid_diagnosis_detail.risk_level.unknown')
    }
  }

  const getRiskLevelColor = (riskLevel) => {
    const level = typeof riskLevel === 'string' ? riskLevel : (riskLevel?.label || riskLevel)
    
    switch (level) {
      case 'very_high':
      case 'high':
      case 'critical':
        return 'from-red-500 to-red-600'
      case 'medium':
        return 'from-yellow-500 to-yellow-600'
      case 'low':
      case 'very_low':
        return 'from-green-500 to-green-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const handleBack = () => {
    navigate('/patient/diagnosis-reports')
  }

  const handleImagePreview = (images, initialIndex = 0) => {
    setPreviewImages(images)
    setPreviewInitialIndex(initialIndex)
    setPreviewOpen(true)
  }

  // 从recommendation字段中提取特定类型的建议
  const extractAdviceFromRecommendation = (recommendation, type) => {
    if (!recommendation) return null
    
    switch (type) {
      case 'lifestyle':
        const lifestyleMatch = recommendation.match(/生活方式建議[：:]\s*([^。.]+)/i) || 
                              recommendation.match(/Lifestyle.*?[：:]\s*([^。.]+)/i)
        return lifestyleMatch ? lifestyleMatch[1].trim() : null
        
      case 'isolation':
        const isolationMatch = recommendation.match(/隔離建議[：:]\s*([^。.]+)/i) || 
                              recommendation.match(/Isolation.*?[：:]\s*([^。.]+)/i)
        return isolationMatch ? isolationMatch[1].trim() : null
        
      case 'followup':
        const followUpMatch = recommendation.match(/復查建議[：:]\s*([^。.]+)/i) || 
                             recommendation.match(/Follow.*?[：:]\s*([^。.]+)/i)
        return followUpMatch ? followUpMatch[1].trim() : null
        
      default:
        return null
    }
  }

  const renderAssessmentData = () => {
    const assessmentData = report?.assessmentId
    if (!assessmentData) return null

    return (
      <div className="space-y-4">
        {/* 症状信息 */}
        {assessmentData.symptoms && assessmentData.symptoms.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-25 rounded-lg shadow-sm" style={{ border: 'none' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <h4 className="font-semibold text-gray-800">{t('pages.patient_covid_diagnosis_detail.symptoms')}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {assessmentData.symptoms.map((symptom, index) => (
                <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-200">
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 体温信息 */}
        {assessmentData.temperature && (
          <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-25 rounded-lg shadow-sm" style={{ border: 'none' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
              <h4 className="font-semibold text-gray-800">{t('pages.patient_covid_diagnosis_detail.temperature')}</h4>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-orange-600" />
              <span className="text-lg font-medium text-gray-800">{assessmentData.temperature}°C</span>
            </div>
          </div>
        )}

        {/* 评估图片 */}
        {assessmentData.imagePaths && assessmentData.imagePaths.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-25 rounded-lg shadow-sm" style={{ border: 'none' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
              <h4 className="font-semibold text-gray-800">{t('pages.patient_covid_diagnosis_detail.assessment_images')}</h4>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {assessmentData.imagePaths.slice(0, 16).map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={apiService.getImageUrl(report.assessmentId.userId, image.split('/').pop(), 'covid')}
                    alt={`${t('pages.patient_covid_diagnosis_detail.assessment_image')} ${index + 1}`}
                    className="w-full h-16 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => handleImagePreview(
                      assessmentData.imagePaths.map(img => 
                        apiService.getImageUrl(report.assessmentId.userId, img.split('/').pop(), 'covid')
                      ), 
                      index
                    )}
                  />
                </div>
              ))}
              {assessmentData.imagePaths.length > 16 && (
                <div className="flex items-center justify-center h-16 bg-gray-100 rounded-lg">
                  <span className="text-sm text-gray-500">+{assessmentData.imagePaths.length - 16}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('pages.patient_covid_diagnosis_detail.error_title')}</h2>
          <p className="text-gray-500">{error}</p>
          <Button onClick={handleBack} className="mt-4">
            {t('pages.patient_covid_diagnosis_detail.back')}
          </Button>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('pages.patient_covid_diagnosis_detail.report_not_found')}</h2>
          <p className="text-gray-500">{t('pages.patient_covid_diagnosis_detail.report_not_found_desc')}</p>
          <Button onClick={handleBack} className="mt-4">
            {t('pages.patient_covid_diagnosis_detail.back')}
          </Button>
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
        title={t('pages.patient_covid_diagnosis_detail.title')}
        subtitle={t('pages.patient_covid_diagnosis_detail.subtitle')}
        icon={Shield}
        showBackButton={true}
        user={user}
        onBack={handleBack}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        <div className="space-y-6">
          {/* 患者COVID评估信息 */}
          <Card className="bg-white/95 backdrop-blur-lg shadow-xl" style={{ border: 'none' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                <div>
                  <CardTitle className="text-xl text-gray-800">
                    {t('pages.patient_covid_diagnosis_detail.patient_assessment_info')}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {user?.fullName || user?.username || t('common.unknown')} {t('pages.patient_covid_diagnosis_detail.covid_assessment_data_desc')}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-25 rounded-lg shadow-sm" style={{ border: 'none' }}>
                  <p className="text-sm text-gray-600">{t('pages.patient_covid_diagnosis_detail.patient_name')}</p>
                  <p className="font-medium text-gray-800">{user?.fullName || user?.username || t('common.unknown')}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-50 to-green-25 rounded-lg shadow-sm" style={{ border: 'none' }}>
                  <p className="text-sm text-gray-600">{t('pages.patient_covid_diagnosis_detail.patient_id')}</p>
                  <p className="font-medium text-gray-800">{user?.username || t('common.unknown')}</p>
                </div>
              </div>

              {renderAssessmentData()}
            </CardContent>
          </Card>

          {/* 诊断记录查看 */}
          <Card className="bg-white/95 backdrop-blur-lg shadow-xl" style={{ border: 'none' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                <div>
                  <CardTitle className="text-xl text-gray-800">
                    {t('pages.patient_covid_diagnosis_detail.diagnosis_record_view')}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('pages.patient_covid_diagnosis_detail.diagnosis_record_desc')}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 诊断结果 */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-25 rounded-lg shadow-sm" style={{ border: 'none' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-800">{t('pages.patient_covid_diagnosis_detail.diagnosis_result')}</h3>
                </div>
                <div className="p-3 bg-white/80 rounded-lg">
                  <p className="text-blue-900 font-medium text-base leading-relaxed whitespace-pre-wrap">{report.diagnosis || t('pages.patient_covid_diagnosis_detail.no_diagnosis_result')}</p>
                </div>
              </div>

              {/* 风险等级 */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-25 rounded-lg shadow-sm" style={{ border: 'none' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-800">{t('pages.patient_covid_diagnosis_detail.risk_level')}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <Badge className={`text-white bg-gradient-to-r ${getRiskLevelColor(report.riskLevel)} px-3 py-1 text-sm font-medium`}>
                    {getRiskLevelText(report.riskLevel)}
                  </Badge>
                </div>
              </div>

              {/* 医生建议 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 药物建议 */}
                {(report.medicationAdvice || report.medicationPrescription || report.treatment) && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-25 rounded-lg shadow-sm" style={{ border: 'none' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">{t('pages.patient_covid_diagnosis_detail.medication_advice')}</h3>
                    </div>
                    <div className="p-3 bg-white/80 rounded-lg">
                      <p className="text-green-900 font-medium text-base leading-relaxed whitespace-pre-wrap">
                        {report.medicationAdvice || report.medicationPrescription || report.treatment}
                      </p>
                    </div>
                  </div>
                )}

                {/* 生活方式建议 */}
                {(report.lifestyleAdvice || (report.recommendation && extractAdviceFromRecommendation(report.recommendation, 'lifestyle'))) && (
                  <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-25 rounded-lg shadow-sm" style={{ border: 'none' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">{t('pages.patient_covid_diagnosis_detail.lifestyle_advice')}</h3>
                    </div>
                    <div className="p-3 bg-white/80 rounded-lg">
                      <p className="text-teal-900 font-medium text-base leading-relaxed whitespace-pre-wrap">
                        {report.lifestyleAdvice || extractAdviceFromRecommendation(report.recommendation, 'lifestyle')}
                      </p>
                    </div>
                  </div>
                )}

                {/* 隔离建议 */}
                {(report.isolationAdvice || (report.recommendation && extractAdviceFromRecommendation(report.recommendation, 'isolation'))) && (
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-25 rounded-lg shadow-sm" style={{ border: 'none' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">{t('pages.patient_covid_diagnosis_detail.isolation_advice')}</h3>
                    </div>
                    <div className="p-3 bg-white/80 rounded-lg">
                      <p className="text-amber-900 font-medium text-base leading-relaxed whitespace-pre-wrap">
                        {report.isolationAdvice || extractAdviceFromRecommendation(report.recommendation, 'isolation')}
                      </p>
                    </div>
                  </div>
                )}

                {/* 检测建议 */}
                {report.testingRecommendation && (
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-25 rounded-lg shadow-sm" style={{ border: 'none' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">{t('pages.patient_covid_diagnosis_detail.testing_recommendation')}</h3>
                    </div>
                    <div className="p-3 bg-white/80 rounded-lg">
                      <p className="text-indigo-900 font-medium text-base leading-relaxed whitespace-pre-wrap">{report.testingRecommendation}</p>
                    </div>
                  </div>
                )}

                {/* 复查建议 */}
                {(report.followUp || (report.recommendation && extractAdviceFromRecommendation(report.recommendation, 'followup'))) && (
                  <div className="p-4 bg-gradient-to-r from-violet-50 to-violet-25 rounded-lg shadow-sm" style={{ border: 'none' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-violet-600 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">{t('pages.patient_covid_diagnosis_detail.follow_up_advice')}</h3>
                    </div>
                    <div className="p-3 bg-white/80 rounded-lg">
                      <p className="text-violet-900 font-medium text-base leading-relaxed whitespace-pre-wrap">
                        {report.followUp || extractAdviceFromRecommendation(report.recommendation, 'followup')}
                      </p>
                    </div>
                  </div>
                )}

                {/* 其他备注 */}
                {report.notes && (
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-25 rounded-lg shadow-sm" style={{ border: 'none' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">{t('pages.patient_covid_diagnosis_detail.doctor_notes')}</h3>
                    </div>
                    <div className="p-3 bg-white/80 rounded-lg">
                      <p className="text-gray-900 font-medium text-base leading-relaxed whitespace-pre-wrap">{report.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 诊断信息 */}
              <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-25 rounded-lg shadow-sm" style={{ border: 'none' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-800">{t('pages.patient_covid_diagnosis_detail.diagnosis_info')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">{t('pages.patient_covid_diagnosis_detail.diagnosis_time')}：{formatDate(report.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">{t('pages.patient_covid_diagnosis_detail.diagnosis_doctor')}：{report.doctorId?.fullName || report.doctorId?.username || t('common.unknown')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>{t('pages.patient_covid_diagnosis_detail.diagnosis_completed')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 图片预览组件 */}
      <ImagePreview
        images={previewImages}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        initialIndex={previewInitialIndex}
        showDownload={true}
        showRotate={true}
        showZoom={true}
        showNavigation={true}
      />
    </div>
  )
} 