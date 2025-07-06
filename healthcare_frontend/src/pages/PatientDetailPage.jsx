import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { 
  User, 
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Stethoscope,
  Shield,
  Eye,
  ArrowLeft
} from 'lucide-react'
import MedicalHeader from '../components/ui/MedicalHeader.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n.js'
import AbnormalReasonFormatter from '../utils/abnormalReasonFormatter.js'

export default function PatientDetailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const patientId = searchParams.get('patientId')
  const [currentUser, setCurrentUser] = useState(null)
  const [patient, setPatient] = useState(null)
  const [measurements, setMeasurements] = useState([])
  const [covidAssessments, setCovidAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }

    i18n.addListener(handleLanguageChange)
    return () => i18n.removeListener(handleLanguageChange)
  }, [])

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

    // 检查是否有患者ID参数
    if (!patientId) {
      setError(i18n.t('pages.patient_detail.missing_patient_id'))
      return
    }

    setCurrentUser(userData)
    loadPatientData()
  }, [navigate, patientId])

  const loadPatientData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 获取患者基本信息
      const patientData = await apiService.getUserById(patientId)

      if (!patientData) {
        throw new Error(i18n.t('pages.patient_detail.patient_not_found'))
      }
      
      // 获取患者的测量记录
      let measurementsData = []
      try {
        const measurementsResponse = await apiService.getPatientMeasurements(patientId)
        console.log('📊 測量記錄 API 響應:', measurementsResponse)
        
        // 确保返回的是数组
        if (Array.isArray(measurementsResponse)) {
          measurementsData = measurementsResponse
        } else if (measurementsResponse && measurementsResponse.success && Array.isArray(measurementsResponse.data)) {
          measurementsData = measurementsResponse.data
        } else if (measurementsResponse && Array.isArray(measurementsResponse.data)) {
          measurementsData = measurementsResponse.data
        } else {
          measurementsData = []
        }
        
        console.log('📋 處理後的測量記錄數據:', measurementsData)
        
        // 檢查每條記錄的 severity 和 abnormalReasons
        measurementsData.forEach((measurement, index) => {
          console.log(`${index + 1}. 測量記錄:`, {
            id: measurement._id,
            isAbnormal: measurement.isAbnormal,
            severity: measurement.severity,
            abnormalReasons: measurement.abnormalReasons,
            createdAt: measurement.createdAt
          })
        })
      } catch (error) {
        console.error('❌ 獲取測量記錄失敗:', error)
        measurementsData = []
      }

      // 获取患者的COVID评估记录
      let covidAssessmentsData = []
      try {
        const covidResponse = await apiService.getUserCovidAssessments(patientId)
        
        // 处理不同的响应格式
        if (Array.isArray(covidResponse)) {
          covidAssessmentsData = covidResponse
        } else if (covidResponse && covidResponse.success && Array.isArray(covidResponse.data)) {
          covidAssessmentsData = covidResponse.data
        } else if (covidResponse && Array.isArray(covidResponse.data)) {
          covidAssessmentsData = covidResponse.data
        } else {
          covidAssessmentsData = []
        }
      } catch (error) {
        covidAssessmentsData = []
      }

      // 计算年龄
      const age = patientData.dateOfBirth 
        ? Math.floor((new Date() - new Date(patientData.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
        : null

      setPatient({ ...patientData, age })
      
      // 确保数据是数组后再进行排序
      setMeasurements(Array.isArray(measurementsData) ? 
        measurementsData.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp)) : 
        []
      )
      setCovidAssessments(Array.isArray(covidAssessmentsData) ? 
        covidAssessmentsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : 
        []
      )

    } catch (error) {
      setError(i18n.t('pages.patient_detail.load_failed', { error: error.message }))
      
      // 如果患者基本信息获取失败，设置一个默认患者对象
      if (!patient) {
        setPatient({
          _id: patientId,
          fullName: i18n.t('pages.patient_detail.unknown_patient'),
          username: patientId,
          age: null,
          createdAt: new Date().toISOString()
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return i18n.t('common.not_set')
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getMeasurementStatus = (measurement) => {
    // 使用後端返回的 severity 和 abnormalReasons 字段
    const isAbnormal = measurement.isAbnormal || measurement.severity !== 'normal'
    const abnormalReasons = measurement.abnormalReasons || []
    const severity = measurement.severity || 'normal'
    
    console.log('🔍 測量狀態分析:', {
      measurementId: measurement._id,
      isAbnormal,
      severity,
      abnormalReasons,
      rawMeasurement: {
        isAbnormal: measurement.isAbnormal,
        severity: measurement.severity,
        abnormalReasons: measurement.abnormalReasons
      }
    })
    
    return {
      isAbnormal,
      severity,
      abnormalReasons,
      conditions: AbnormalReasonFormatter.smartFormatMultiple(abnormalReasons)
    }
  }

  const getSeverityText = (severity) => {
    const severityMap = {
      'normal': i18n.t('pages.patient_detail.severity.normal'),
      'low': i18n.t('pages.patient_detail.severity.low'),
      'high': i18n.t('pages.patient_detail.severity.high'),
      'severeLow': i18n.t('pages.patient_detail.severity.severe_low'),
      'severeHigh': i18n.t('pages.patient_detail.severity.severe_high'),
      'critical': i18n.t('pages.patient_detail.severity.critical')
    }
    return severityMap[severity] || i18n.t('pages.patient_detail.severity.normal')
  }

  const getSeverityColor = (severity) => {
    const colorMap = {
      'normal': 'bg-green-100 text-green-800 border-green-200',
      'low': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'severeLow': 'bg-red-100 text-red-800 border-red-200',
      'severeHigh': 'bg-red-100 text-red-800 border-red-200',
      'critical': 'bg-red-500 text-white border-red-500'
    }
    return colorMap[severity] || 'bg-green-100 text-green-800 border-green-200'
  }

  // 处理测量记录查看详情
  const handleViewMeasurementDetails = (measurementId) => {
    // 找到对应的记录，根据状态设置hasread参数
    const measurement = measurements.find(m => m._id === measurementId)
    let hasRead = '0' // 默认为编辑模式
    
    if (measurement && (measurement.status === 'processed' || measurement.status === 'reviewed')) {
      hasRead = '1' // 已处理记录设置为只读模式
    }
    
    // 在新标签页打开详情页面
    const url = `/medical/diagnosis/form?mid=${measurementId}&hasread=${hasRead}`
    window.open(url, '_blank')
  }

  // 处理COVID评估查看详情
  const handleViewCovidDetails = (assessmentId) => {
    // 找到对应的记录，根据状态设置hasread参数
    const assessment = covidAssessments.find(a => a._id === assessmentId)
    let hasRead = '0' // 默认为编辑模式
    
    if (assessment && (assessment.status === 'processed' || assessment.status === 'reviewed')) {
      hasRead = '1' // 已处理记录设置为只读模式
    }
    
    // 在新标签页打开详情页面
    const url = `/medical/covid-management/details?aid=${assessmentId}&hasread=${hasRead}`
    window.open(url, '_blank')
  }

  // 获取风险等级显示文本
  const getRiskLevelText = (riskLevel) => {
    if (!riskLevel) return i18n.t('pages.patient_detail.risk.unknown')
    
    if (typeof riskLevel === 'string') {
      switch (riskLevel) {
        case 'high': return i18n.t('pages.patient_detail.risk.high')
        case 'medium': return i18n.t('pages.patient_detail.risk.medium')
        case 'low': return i18n.t('pages.patient_detail.risk.low')
        default: return riskLevel
      }
    }
    
    return riskLevel.label || i18n.t('pages.patient_detail.risk.unknown')
  }

  // 获取风险等级颜色
  const getRiskLevelColor = (riskLevel) => {
    if (!riskLevel) return 'bg-gray-500'
    
    const level = typeof riskLevel === 'string' ? riskLevel : (riskLevel.label || riskLevel)
    
    switch (level) {
      case i18n.t('pages.patient_detail.risk.high'):
      case 'high':
        return 'bg-red-500'
      case i18n.t('pages.patient_detail.risk.medium'):
      case 'medium':
        return 'bg-yellow-500'
      case i18n.t('pages.patient_detail.risk.low'):
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  // 症狀翻譯函數
  const translateSymptom = (symptom) => {
    const symptomMap = {
      'fever': i18n.t('pages.covid_management.fever'),
      'cough': i18n.t('pages.covid_management.cough'),
      'shortness_of_breath': i18n.t('pages.covid_management.shortness_breath'),
      'fatigue': i18n.t('pages.covid_management.fatigue'),
      'body_aches': i18n.t('pages.covid_management.body_aches'),
      'headache': i18n.t('pages.covid_management.headache'),
      'sore_throat': i18n.t('pages.covid_management.sore_throat'),
      'loss_of_taste': i18n.t('pages.covid_management.loss_taste_smell'),
      'loss_of_smell': i18n.t('pages.covid_management.loss_taste_smell'),
      'nausea': i18n.t('pages.covid_management.nausea'),
      'vomiting': i18n.t('pages.patient_detail.symptoms.vomiting'),
      'diarrhea': i18n.t('pages.covid_management.diarrhea'),
      'congestion': i18n.t('pages.patient_detail.symptoms.congestion'),
      'runny_nose': i18n.t('pages.covid_management.runny_nose'),
      'chills': i18n.t('pages.covid_management.chills'),
      'muscle_pain': i18n.t('pages.patient_detail.symptoms.muscle_pain'),
      'joint_pain': i18n.t('pages.patient_detail.symptoms.joint_pain'),
      'chest_pain': i18n.t('pages.patient_detail.symptoms.chest_pain'),
      'difficulty_breathing': i18n.t('pages.patient_detail.symptoms.difficulty_breathing'),
      'persistent_cough': i18n.t('pages.patient_detail.symptoms.persistent_cough'),
      'high_fever': i18n.t('pages.patient_detail.symptoms.high_fever'),
      'severe_headache': i18n.t('pages.patient_detail.symptoms.severe_headache'),
      'abdominal_pain': i18n.t('pages.patient_detail.symptoms.abdominal_pain'),
      'skin_rash': i18n.t('pages.patient_detail.symptoms.skin_rash'),
      'confusion': i18n.t('pages.patient_detail.symptoms.confusion'),
      'dizziness': i18n.t('pages.patient_detail.symptoms.dizziness'),
      'weakness': i18n.t('pages.patient_detail.symptoms.weakness'),
      'loss_of_appetite': i18n.t('pages.patient_detail.symptoms.loss_of_appetite')
    }
    
    // 如果是英文症狀，翻譯成中文
    if (symptomMap[symptom]) {
      return symptomMap[symptom]
    }
    
    // 如果已經是中文或未知症狀，直接返回
    return symptom
  }

  const renderMeasurementCard = (measurement) => {
    const status = getMeasurementStatus(measurement)
    
    // 根據狀態決定背景色
    const getCardBackgroundClass = () => {
      if (status.isAbnormal) {
        // 異常情況 - 使用紅色系
        switch (status.severity) {
          case 'critical':
            return 'bg-gradient-to-br from-red-100/90 to-red-200/70'
          case 'severeHigh':
          case 'severeLow':
            return 'bg-gradient-to-br from-orange-100/90 to-orange-200/70'
          case 'high':
          case 'low':
            return 'bg-gradient-to-br from-yellow-100/90 to-yellow-200/70'
          default:
            return 'bg-gradient-to-br from-red-50/80 to-red-100/60'
        }
      } else {
        // 正常情況 - 使用綠色系
        return 'bg-gradient-to-br from-green-50/80 to-green-100/60'
      }
    }
    
    return (
      <Card className={`${getCardBackgroundClass()} backdrop-blur-lg ring-1 ring-white/30 shadow-md transition-all duration-300 !py-2 !gap-1.5`}>
        <CardHeader className="pb-1 px-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Activity className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm text-gray-800">{i18n.t('pages.patient_detail.vital_signs')}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              {status.isAbnormal ? (
                <Badge className={`flex items-center gap-0.5 text-xs px-2 py-1 h-5 ${status.severityColor}`}>
                  <AlertTriangle className="h-3 w-3" />
                  {status.severityText}
                </Badge>
              ) : (
                <Badge className="flex items-center gap-0.5 bg-green-100 text-green-700 ring-1 ring-green-200/50 text-xs px-2 py-1 h-5 shadow-sm">
                  <CheckCircle className="h-3 w-3" />
                  {i18n.t('pages.patient_detail.normal')}
                </Badge>
              )}
              <Button
                size="sm"
                onClick={() => handleViewMeasurementDetails(measurement._id)}
                className="h-6 px-2 text-xs ml-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200 ring-1 ring-blue-200/50 shadow-sm transition-all duration-200"
              >
                <Eye className="h-3 w-3 mr-1" />
                {i18n.t('pages.patient_detail.view_details')}
              </Button>
            </div>
          </div>
          <CardDescription className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
            <Calendar className="h-3 w-3" />
            {formatDateTime(measurement.createdAt || measurement.timestamp)}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-2">
          <div className="grid grid-cols-2 gap-1.5">
            {measurement.systolic && measurement.diastolic && (
              <div className="text-center p-2 bg-gradient-to-br from-white/90 to-white/70 rounded-md ring-1 ring-blue-200/30 shadow-sm">
                <Heart className="h-4 w-4 text-red-500 mx-auto mb-1" />
                <p className="text-xs text-gray-600">{i18n.t('measurement.blood_pressure')}</p>
                <p className="font-semibold text-sm text-gray-800">
                  {measurement.systolic}/{measurement.diastolic}
                </p>
              </div>
            )}
            {measurement.heartRate && (
              <div className="text-center p-2 bg-gradient-to-br from-white/90 to-white/70 rounded-md ring-1 ring-pink-200/30 shadow-sm">
                <Activity className="h-4 w-4 text-pink-500 mx-auto mb-1" />
                <p className="text-xs text-gray-600">{i18n.t('measurement.heart_rate')}</p>
                <p className="font-semibold text-sm text-gray-800">{measurement.heartRate} bpm</p>
              </div>
            )}
            {measurement.temperature && (
              <div className="text-center p-2 bg-gradient-to-br from-white/90 to-white/70 rounded-md ring-1 ring-orange-200/30 shadow-sm">
                <Thermometer className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                <p className="text-xs text-gray-600">{i18n.t('measurement.temperature')}</p>
                <p className="font-semibold text-sm text-gray-800">{measurement.temperature}°C</p>
              </div>
            )}
            {measurement.oxygenSaturation && (
              <div className="text-center p-2 bg-gradient-to-br from-white/90 to-white/70 rounded-md ring-1 ring-cyan-200/30 shadow-sm">
                <Droplets className="h-4 w-4 text-cyan-500 mx-auto mb-1" />
                <p className="text-xs text-gray-600">{i18n.t('measurement.oxygen_saturation')}</p>
                <p className="font-semibold text-sm text-gray-800">{measurement.oxygenSaturation}%</p>
              </div>
            )}
          </div>
          {status.isAbnormal && status.conditions.length > 0 && (
            <div className="mt-2 p-2 bg-gradient-to-r from-red-50/80 to-pink-50/80 rounded-md ring-1 ring-red-200/30 shadow-sm">
              <p className="text-xs text-red-600 font-medium">
                <strong>{i18n.t('pages.patient_detail.abnormal_reasons')}:</strong>
              </p>
              <ul className="text-xs text-red-600 mt-1 list-disc list-inside space-y-0.5">
                {status.conditions.map((reason, index) => (
                  <li key={index} className="leading-relaxed">{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderCovidAssessmentCard = (assessment) => {
    const riskLevel = getRiskLevelText(assessment.riskLevel)
    const riskColor = getRiskLevelColor(assessment.riskLevel)
    
    // 根據風險等級決定背景色
    const getCardBackgroundClass = () => {
      const level = typeof assessment.riskLevel === 'string' ? assessment.riskLevel : (assessment.riskLevel?.label || assessment.riskLevel)
      
      switch (level) {
        case '高風險':
        case 'high':
          return 'bg-gradient-to-br from-red-100/90 to-red-200/70'
        case '中等風險':
        case 'medium':
          return 'bg-gradient-to-br from-yellow-100/90 to-yellow-200/70'
        case '低風險':
        case 'low':
          return 'bg-gradient-to-br from-green-100/90 to-green-200/70'
        default:
          return 'bg-gradient-to-br from-gray-50/80 to-gray-100/60'
      }
    }
    
    return (
      <Card className={`${getCardBackgroundClass()} backdrop-blur-lg ring-1 ring-white/30 shadow-md transition-all duration-300 !py-2 !gap-1.5`}>
        <CardHeader className="pb-1 px-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-purple-600" />
              <CardTitle className="text-sm text-gray-800">{i18n.t('pages.patient_detail.covid_assessments')}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Badge className={`text-white ${riskColor} text-xs px-2 py-1 h-5`}>
                {riskLevel}
              </Badge>
              <Button
                size="sm"
                onClick={() => handleViewCovidDetails(assessment._id)}
                className="h-6 px-2 text-xs ml-1 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 hover:from-purple-100 hover:to-purple-200 ring-1 ring-purple-200/50 shadow-sm transition-all duration-200"
              >
                <Eye className="h-3 w-3 mr-1" />
                {i18n.t('pages.patient_detail.view_details')}
              </Button>
            </div>
          </div>
          <CardDescription className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
            <Calendar className="h-3 w-3" />
            {formatDateTime(assessment.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-2">
          <div className="space-y-1.5">
            {assessment.symptoms && assessment.symptoms.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-1 text-xs">{i18n.t('pages.patient_detail.symptoms_label')}</h4>
                <div className="flex flex-wrap gap-1">
                  {assessment.symptoms.map((symptom, index) => (
                    <Badge key={index} className="text-xs px-2 py-1 bg-purple-100/80 text-purple-700 ring-1 ring-purple-200/50 shadow-sm">
                      {translateSymptom(symptom)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {assessment.temperature && (
              <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-white/90 to-white/70 rounded-md ring-1 ring-orange-200/30 shadow-sm">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-gray-600">{i18n.t('pages.patient_detail.temperature_label')}:</span>
                <span className="font-semibold text-sm text-gray-800">{assessment.temperature}°C</span>
              </div>
            )}
            {assessment.contactHistory && (
              <div className="p-2 bg-gradient-to-r from-white/90 to-white/70 rounded-md ring-1 ring-yellow-200/30 shadow-sm">
                <p className="text-xs font-medium text-gray-700 mb-1">{i18n.t('pages.patient_detail.contact_history')}:</p>
                <p className="text-xs text-gray-600 leading-relaxed">{assessment.contactHistory}</p>
              </div>
            )}
            {assessment.travelHistory && (
              <div className="p-2 bg-gradient-to-r from-white/90 to-white/70 rounded-md ring-1 ring-blue-200/30 shadow-sm">
                <p className="text-xs font-medium text-gray-700 mb-1">{i18n.t('pages.patient_detail.travel_history')}:</p>
                <p className="text-xs text-gray-600 leading-relaxed">{assessment.travelHistory}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-lg animate-pulse"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-full shadow-xl">
              <div className="animate-spin rounded-full h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto"></div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <p className="text-gray-700 font-medium">{i18n.t('pages.patient_detail.loading')}</p>
            <p className="text-sm text-gray-500 mt-2">{i18n.t('common.please_wait')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
        </div>
        
        <MedicalHeader 
          title={i18n.t('pages.patient_detail.title')}
          subtitle={i18n.t('pages.patient_detail.subtitle')}
          icon={User}
          showBackButton={true}
          user={currentUser}
          onBack={() => navigate('/medical/patients-management')}
        />
        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 relative z-10">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <Button onClick={() => navigate('/medical/patients-management')} className="mt-4">
              {i18n.t('pages.patient_detail.back_to_list')}
            </Button>
          </div>
        </main>
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
        title={i18n.t('pages.patient_detail.title')}
        subtitle={i18n.t('pages.patient_detail.medical_records', { 
          patientName: patient?.fullName || patient?.username || i18n.t('pages.patient_detail.unknown_patient') 
        })}
        icon={User}
        showBackButton={true}
        user={currentUser}
        onBack={() => navigate('/medical/patients-management')}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 relative z-10">
        
        {/* 患者基本信息 */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg ring-1 ring-white/30 shadow-2xl shadow-green-500/10 hover:shadow-3xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <User className="h-6 w-6 text-green-600" />
                {i18n.t('pages.patient_detail.basic_info')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50/70 rounded-xl ring-1 ring-blue-200/30 shadow-sm hover:shadow-md transition-all duration-200">
                  <p className="text-sm text-gray-600 mb-1">{i18n.t('pages.patient_detail.name')}</p>
                  <p className="font-semibold text-gray-800">{patient?.fullName || patient?.username || i18n.t('common.unknown')}</p>
                </div>
                <div className="text-center p-4 bg-green-50/70 rounded-xl ring-1 ring-green-200/30 shadow-sm hover:shadow-md transition-all duration-200">
                  <p className="text-sm text-gray-600 mb-1">{i18n.t('pages.patient_detail.age')}</p>
                  <p className="font-semibold text-gray-800">{patient?.age ? `${patient.age}${i18n.t('pages.patient_detail.years_old')}` : i18n.t('common.unknown')}</p>
                </div>
                <div className="text-center p-4 bg-purple-50/70 rounded-xl ring-1 ring-purple-200/30 shadow-sm hover:shadow-md transition-all duration-200">
                  <p className="text-sm text-gray-600 mb-1">{i18n.t('pages.patient_detail.registration_date')}</p>
                  <p className="font-semibold text-gray-800">{formatDate(patient?.createdAt)}</p>
                </div>
                <div className="text-center p-4 bg-orange-50/70 rounded-xl ring-1 ring-orange-200/30 shadow-sm hover:shadow-md transition-all duration-200">
                  <p className="text-sm text-gray-600 mb-1">{i18n.t('pages.patient_detail.records_statistics')}</p>
                  <div className="flex justify-center gap-2 text-xs">
                    <span className="text-blue-600 font-semibold">{measurements.length} {i18n.t('pages.patient_detail.measurements')}</span>
                    <span className="text-purple-600 font-semibold">{covidAssessments.length} {i18n.t('pages.patient_detail.assessments')}</span>
                  </div>
                </div>
              </div>
              
              {patient?.email && (
                <div className="mt-4 p-3 bg-gray-50/70 rounded-xl ring-1 ring-gray-200/30 shadow-sm">
                  <p className="text-sm text-gray-600">{i18n.t('pages.patient_detail.contact')}: {patient.email}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 左右两列布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左列：生命体征测量记录 */}
          <div>
            <Card className="bg-gradient-to-br from-white/95 to-blue-50/30 backdrop-blur-lg ring-1 ring-white/30 shadow-2xl shadow-blue-500/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <Activity className="h-6 w-6 text-blue-600" />
                  {i18n.t('pages.patient_detail.vital_signs_records')}
                  <Badge className="ml-2 bg-blue-100 text-blue-700 ring-1 ring-blue-200/50 shadow-sm">
                    {measurements.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {i18n.t('pages.patient_detail.vital_signs_history')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`${measurements.length > 0 ? 'h-[60rem]' : 'h-auto'} overflow-y-auto pr-1`}>
                  {measurements.length > 0 ? (
                    <div className="space-y-0">
                      {measurements.map((measurement) => (
                        <div key={measurement._id} className="py-2">
                          {renderMeasurementCard(measurement)}
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
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">{i18n.t('pages.patient_detail.no_measurements')}</h3>
                            <p className="text-sm text-gray-500 text-center leading-relaxed">
                              {i18n.t('pages.patient_detail.no_measurements_desc')}<br />
                              <span className="text-blue-500 font-medium">{i18n.t('pages.patient_detail.no_measurements_suggestion')}</span>
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

          {/* 右列：COVID/流感评估记录 */}
          <div>
            <Card className="bg-gradient-to-br from-white/95 to-purple-50/30 backdrop-blur-lg ring-1 ring-white/30 shadow-2xl shadow-purple-500/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-purple-600" />
                  {i18n.t('pages.patient_detail.covid_assessments')}
                  <Badge className="ml-2 bg-purple-100 text-purple-700 ring-1 ring-purple-200/50 shadow-sm">
                    {covidAssessments.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {i18n.t('pages.patient_detail.covid_assessments_history')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`${covidAssessments.length > 0 ? 'h-[60rem]' : 'h-auto'} overflow-y-auto pr-1`}>
                  {covidAssessments.length > 0 ? (
                    <div className="space-y-0">
                      {covidAssessments.map((assessment) => (
                        <div key={assessment._id} className="py-2">
                          {renderCovidAssessmentCard(assessment)}
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
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">{i18n.t('pages.patient_detail.no_assessments')}</h3>
                            <p className="text-sm text-gray-500 text-center leading-relaxed">
                              {i18n.t('pages.patient_detail.no_assessments_desc')}<br />
                              <span className="text-purple-500 font-medium">{i18n.t('pages.patient_detail.no_assessments_suggestion')}</span>
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