import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { FileText, Activity, Shield, Clock, User, AlertTriangle, Calendar, Pill, Monitor, Heart, Thermometer, Image, Eye, MapPin, Stethoscope, Droplets, Weight, Gauge, TrendingUp, TrendingDown, Info, X, ChevronLeft, ChevronRight, Users, Clipboard } from 'lucide-react'
import PatientHeader from '../components/ui/PatientHeader.jsx'
import ImagePreview from '../components/ui/ImagePreview.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n.js'

export default function PatientDiagnosisReportDetailPage() {
  const navigate = useNavigate()
  const { reportId } = useParams()
  const [user, setUser] = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())
  
  // 简化的国际化函数
  const t = (key, params = {}) => i18n.t(key, params)
  
  // 图片预览状态
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [previewImages, setPreviewImages] = useState([])
  const [previewInitialIndex, setPreviewInitialIndex] = useState(0)

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
  }, [navigate, reportId])

  const fetchReportDetail = async () => {
    try {
      setLoading(true)
      console.log('🔍 获取诊断记录详情 - reportId:', reportId)
      
      // 首先尝试从 measurement-diagnoses 获取数据
      try {
        const measurementDiagnosisData = await apiService.getMeasurementDiagnosisDetail(reportId)
        console.log('✅ 从 measurement-diagnoses 获取数据成功:', measurementDiagnosisData)
        
        if (measurementDiagnosisData && measurementDiagnosisData.data) {
          setReport({
            ...measurementDiagnosisData.data,
            reportType: 'measurement'
          })
          return
        }
      } catch (measurementError) {
        console.log('⚠️ 从 measurement-diagnoses 获取数据失败:', measurementError.message)
      }
      
      // 如果从 measurement-diagnoses 获取失败，尝试从 diagnosis-reports 获取
      try {
        const diagnosisReportData = await apiService.getDiagnosisReportDetail(reportId)
        console.log('✅ 从 diagnosis-reports 获取数据成功:', diagnosisReportData)
        
        if (diagnosisReportData) {
          setReport({
            ...diagnosisReportData,
            reportType: 'general'
          })
          return
        }
      } catch (reportError) {
        console.log('⚠️ 从 diagnosis-reports 获取数据失败:', reportError.message)
      }
      
      // 如果都失败了，抛出错误
      throw new Error(i18n.t('pages.patient_diagnosis_detail.fetch_failed'))
      
    } catch (error) {
      console.error('❌ 获取报告详情失败:', error)
      navigate('/patient/diagnosis-reports')
    } finally {
      setLoading(false)
    }
  }

  const getReportTypeText = (reportType) => {
    switch (reportType) {
      case 'measurement': return i18n.t('pages.patient_diagnosis_detail.vital_signs_measurement')
      case 'covid_flu': return i18n.t('pages.patient_diagnosis_detail.covid_flu_assessment')
      case 'general': return i18n.t('pages.patient_diagnosis_detail.general_diagnosis')
      default: return i18n.t('pages.patient_diagnosis_detail.measurement_diagnosis')
    }
  }

  const getReportTypeIcon = (reportType) => {
    switch (reportType) {
      case 'measurement': return Activity
      case 'covid_flu': return Shield
      case 'general': return FileText
      default: return Activity
    }
  }

  const getReportTypeColor = (reportType) => {
    switch (reportType) {
      case 'measurement': return 'from-green-500 to-emerald-600'
      case 'covid_flu': return 'from-purple-500 to-indigo-600'
      case 'general': return 'from-blue-500 to-blue-600'
      default: return 'from-green-500 to-emerald-600'
    }
  }

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return <Badge className="bg-red-600 text-white">{i18n.t('pages.patient_diagnosis_detail.urgent')}</Badge>
      case 'high':
        return <Badge className="bg-red-500 text-white">{i18n.t('pages.patient_diagnosis_detail.high_priority')}</Badge>
      case 'medium':
        return <Badge className="bg-yellow-500 text-white">{i18n.t('pages.patient_diagnosis_detail.medium_priority')}</Badge>
      case 'low':
        return <Badge className="bg-green-500 text-white">{i18n.t('pages.patient_diagnosis_detail.low_priority')}</Badge>
      default:
        return <Badge variant="outline">{i18n.t('pages.patient_diagnosis_detail.normal')}</Badge>
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(language === 'zh-TW' ? 'zh-TW' : language === 'zh-CN' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 图片预览函数
  const openImagePreview = (images, index = 0) => {
    setPreviewImages(images)
    setPreviewInitialIndex(index)
    setImagePreviewOpen(true)
  }

  const closeImagePreview = () => {
    setImagePreviewOpen(false)
    setPreviewImages([])
    setPreviewInitialIndex(0)
  }

  const renderMeasurementData = (sourceData) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">{i18n.t('pages.patient_diagnosis_detail.vital_signs_data')}</h4>
          {sourceData.bloodPressure && (
            <div className="bg-white/50 rounded-lg p-3">
              <span className="text-sm font-medium">{i18n.t('measurement.blood_pressure')}：</span>
              <span className="text-sm">{sourceData.bloodPressure}</span>
            </div>
          )}
          {sourceData.heartRate && (
            <div className="bg-white/50 rounded-lg p-3">
              <span className="text-sm font-medium">{i18n.t('measurement.heart_rate')}：</span>
              <span className="text-sm">{sourceData.heartRate} bpm</span>
            </div>
          )}
          {sourceData.temperature && (
            <div className="bg-white/50 rounded-lg p-3">
              <span className="text-sm font-medium">{i18n.t('measurement.temperature')}：</span>
              <span className="text-sm">{sourceData.temperature}°C</span>
            </div>
          )}
          {sourceData.oxygenSaturation && (
            <div className="bg-white/50 rounded-lg p-3">
              <span className="text-sm font-medium">{i18n.t('measurement.oxygen_saturation')}：</span>
              <span className="text-sm">{sourceData.oxygenSaturation}%</span>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">{i18n.t('pages.patient_diagnosis_detail.other_info')}</h4>
          {sourceData.weight && (
            <div className="bg-white/50 rounded-lg p-3">
              <span className="text-sm font-medium">{i18n.t('measurement.weight')}：</span>
              <span className="text-sm">{sourceData.weight} kg</span>
            </div>
          )}
          {sourceData.symptoms && (
            <div className="bg-white/50 rounded-lg p-3">
              <span className="text-sm font-medium">{i18n.t('pages.patient_diagnosis_detail.symptoms')}：</span>
              <span className="text-sm">{sourceData.symptoms}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderAbnormalMeasurementData = (sourceData) => {
    // 获取用户ID用于构建图片URL
    const getUserId = () => {
      if (report.measurementId && report.measurementId.userId) {
        return typeof report.measurementId.userId === 'string' 
          ? report.measurementId.userId 
          : report.measurementId.userId._id
      }
      if (sourceData.userId) {
        return typeof sourceData.userId === 'string' 
          ? sourceData.userId 
          : sourceData.userId._id
      }
      return user?._id || user?.id
    }

    const currentUserId = getUserId()

    // 获取所有测量数据项
    const getAllMeasurementItems = (data) => {
      const items = []
      
      if (data.bloodPressure) {
        const [systolic, diastolic] = data.bloodPressure.split('/').map(v => parseInt(v))
        items.push({
          type: 'bloodPressure',
          label: t('measurement.blood_pressure'),
          value: data.bloodPressure,
          unit: 'mmHg',
          icon: <Heart className="h-5 w-5 text-white" />,
          color: 'red',
          isAbnormal: systolic > 140 || diastolic > 90 || systolic < 90 || diastolic < 60,
          details: t('measurement.blood_pressure_details', { systolic, diastolic })
        })
      }
      
      if (data.heartRate) {
        items.push({
          type: 'heartRate',
          label: t('measurement.heart_rate'),
          value: data.heartRate,
          unit: 'bpm',
          icon: <Heart className="h-5 w-5 text-pink-600" />,
          color: 'pink',
          isAbnormal: data.heartRate > 100 || data.heartRate < 60,
          details: t('measurement.heart_rate_details')
        })
      }
      
      if (data.temperature) {
        items.push({
          type: 'temperature',
          label: t('measurement.temperature'),
          value: data.temperature,
          unit: '°C',
          icon: <Thermometer className="h-5 w-5 text-white" />,
          color: 'orange',
          isAbnormal: data.temperature > 37.5 || data.temperature < 36.0,
          details: t('measurement.temperature_details')
        })
      }
      
      if (data.oxygenSaturation) {
        items.push({
          type: 'oxygenSaturation',
          label: t('measurement.oxygen_saturation'),
          value: data.oxygenSaturation,
          unit: '%',
          icon: <Droplets className="h-5 w-5 text-white" />,
          color: 'blue',
          isAbnormal: data.oxygenSaturation < 95,
          details: t('measurement.oxygen_saturation_details')
        })
      }
      
      if (data.weight) {
        items.push({
          type: 'weight',
          label: t('measurement.weight'),
          value: data.weight,
          unit: 'kg',
          icon: <Weight className="h-5 w-5 text-white" />,
          color: 'green',
          isAbnormal: false, // 体重异常需要结合身高计算BMI
          details: t('measurement.weight_details')
        })
      }

      if (data.bloodSugar) {
        items.push({
          type: 'bloodSugar',
          label: t('measurement.blood_sugar'),
          value: data.bloodSugar,
          unit: 'mg/dL',
          icon: <Gauge className="h-5 w-5 text-white" />,
          color: 'purple',
          isAbnormal: data.bloodSugar > 140 || data.bloodSugar < 70,
          details: t('measurement.blood_sugar_details')
        })
      }
      
      return items
    }

    const measurementItems = getAllMeasurementItems(sourceData)
    const abnormalItems = measurementItems.filter(item => item.isAbnormal)
    const primaryAbnormal = abnormalItems[0] || measurementItems[0]

    return (
      <div className="space-y-6">
        {/* 异常测量数据 */}
        <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            {primaryAbnormal?.icon || <Activity className="h-5 w-5 text-red-600" />}
            <div>
              <h3 className="font-semibold text-gray-800">{primaryAbnormal?.label || t('measurement.data')}{t('measurement.abnormal')}</h3>
              <Badge className="bg-red-100 text-red-700 mt-1" style={{ border: 'none' }}>
                {primaryAbnormal?.value} {primaryAbnormal?.unit}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* 显示详细的异常原因列表 */}
            {report.abnormalReasons && report.abnormalReasons.length > 0 && (
              <div className="space-y-2">
                <span className="text-gray-600 text-sm font-medium">{t('measurement.abnormal_reasons')}:</span>
                <div className="flex flex-wrap gap-2">
                  {report.abnormalReasons.map((reason, index) => (
                    <span key={index} className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('measurement.time')}:</span>
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-3 w-3" />
                {formatDate(sourceData.createdAt || sourceData.timestamp)}
              </div>
            </div>
            
            {sourceData.notes && (
              <div className="pt-2 mt-2 bg-gradient-to-r from-red-50/30 to-pink-50/30 rounded-lg p-2">
                <span className="text-gray-600 text-sm">{t('measurement.notes')}: {sourceData.notes}</span>
            </div>
          )}
          </div>
        </div>

                 {/* 详细测量数据 */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {measurementItems.map((item, index) => {
             const getColorClasses = (color) => {
               switch (color) {
                 case 'red':
                   return {
                     cardBg: 'bg-gradient-to-br from-red-50 via-red-25 to-white',
                     cardRing: 'ring-red-200/50',
                     iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
                     titleColor: 'text-red-900',
                     detailColor: 'text-red-600',
                     valueColor: 'text-red-900',
                     unitColor: 'text-red-600'
                   }
                 case 'pink':
                   return {
                     cardBg: 'bg-gradient-to-br from-pink-50 via-pink-25 to-white',
                     cardRing: 'ring-pink-200/50',
                     iconBg: 'bg-gradient-to-br from-pink-500 to-pink-600',
                     titleColor: 'text-pink-900',
                     detailColor: 'text-pink-600',
                     valueColor: 'text-pink-900',
                     unitColor: 'text-pink-600'
                   }
                 case 'orange':
                   return {
                     cardBg: 'bg-gradient-to-br from-orange-50 via-orange-25 to-white',
                     cardRing: 'ring-orange-200/50',
                     iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
                     titleColor: 'text-orange-900',
                     detailColor: 'text-orange-600',
                     valueColor: 'text-orange-900',
                     unitColor: 'text-orange-600'
                   }
                 case 'blue':
                   return {
                     cardBg: 'bg-gradient-to-br from-blue-50 via-blue-25 to-white',
                     cardRing: 'ring-blue-200/50',
                     iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
                     titleColor: 'text-blue-900',
                     detailColor: 'text-blue-600',
                     valueColor: 'text-blue-900',
                     unitColor: 'text-blue-600'
                   }
                 case 'green':
                   return {
                     cardBg: 'bg-gradient-to-br from-green-50 via-green-25 to-white',
                     cardRing: 'ring-green-200/50',
                     iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
                     titleColor: 'text-green-900',
                     detailColor: 'text-green-600',
                     valueColor: 'text-green-900',
                     unitColor: 'text-green-600'
                   }
                 case 'purple':
                   return {
                     cardBg: 'bg-gradient-to-br from-purple-50 via-purple-25 to-white',
                     cardRing: 'ring-purple-200/50',
                     iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
                     titleColor: 'text-purple-900',
                     detailColor: 'text-purple-600',
                     valueColor: 'text-purple-900',
                     unitColor: 'text-purple-600'
                   }
                 default:
                   return {
                     cardBg: 'bg-gradient-to-br from-gray-50 via-gray-25 to-white',
                     cardRing: 'ring-gray-200/50',
                     iconBg: 'bg-gradient-to-br from-gray-500 to-gray-600',
                     titleColor: 'text-gray-900',
                     detailColor: 'text-gray-600',
                     valueColor: 'text-gray-900',
                     unitColor: 'text-gray-600'
                   }
               }
             }
             
             const colorClasses = getColorClasses(item.color)
             
             return (
               <div key={index} className={`p-5 ${colorClasses.cardBg} rounded-2xl shadow-lg ring-1 ${colorClasses.cardRing} transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}>
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                     <div className={`p-2.5 ${colorClasses.iconBg} rounded-xl shadow-md`}>
                       {item.icon}
                     </div>
                     <div>
                       <h4 className={`font-bold ${colorClasses.titleColor}`}>{item.label}</h4>
                       <p className={`${colorClasses.detailColor} text-xs`}>{item.details}</p>
                     </div>
                   </div>
                   {item.isAbnormal && (
                     <div className="flex items-center gap-1">
                       <TrendingUp className="h-4 w-4 text-red-500" />
                       <span className="text-red-600 text-xs font-semibold">{t('measurement.abnormal')}</span>
                     </div>
                   )}
                 </div>
                 
                 <div className="flex items-baseline gap-2 mb-3">
                   <span className={`text-2xl font-bold ${colorClasses.valueColor}`}>{item.value}</span>
                   <span className={`${colorClasses.unitColor} text-sm font-medium`}>{item.unit}</span>
                 </div>
                 
                 {item.isAbnormal && (
                   <div className="p-3 bg-red-50/80 rounded-lg">
                     <div className="flex items-center gap-2">
                       <AlertTriangle className="h-4 w-4 text-red-600" />
                       <span className="text-red-800 text-sm font-medium">
                         {item.type === 'bloodPressure' && t('measurement.blood_pressure_abnormal_advice')}
                         {item.type === 'heartRate' && t('measurement.heart_rate_abnormal_advice')}
                         {item.type === 'temperature' && t('measurement.temperature_abnormal_advice')}
                         {item.type === 'oxygenSaturation' && t('measurement.oxygen_saturation_abnormal_advice')}
                         {item.type === 'bloodSugar' && t('measurement.blood_sugar_abnormal_advice')}
                       </span>
                     </div>
                   </div>
                 )}
               </div>
             )
           })}
         </div>



        {/* 测量图片 */}
        {(sourceData.imagePaths || sourceData.images) && (sourceData.imagePaths || sourceData.images).length > 0 && (
          <div className="pt-3 mt-3 bg-gradient-to-r from-red-50/30 to-pink-50/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Image className="h-4 w-4 text-gray-600" />
              <span className="text-gray-600 text-sm font-medium">{t('measurement.images')} ({(sourceData.imagePaths || sourceData.images).length}{t('measurement.images_count')})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(sourceData.imagePaths || sourceData.images).map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={apiService.getImageUrl(currentUserId, image.split('/').pop(), 'measurement')}
                    alt={`${t('measurement.image')} ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 ring-2 ring-blue-200 hover:ring-blue-400"
                    onClick={() => {
                      const imageUrls = (sourceData.imagePaths || sourceData.images).map(img => 
                        apiService.getImageUrl(currentUserId, img.split('/').pop(), 'measurement')
                      )
                      openImagePreview(imageUrls, index)
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-200 flex items-center justify-center pointer-events-none">
                    <Eye className="h-4 w-4 text-white drop-shadow-lg" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* 查看所有图片按钮 */}
            {(sourceData.imagePaths || sourceData.images).length > 3 && (
              <button
                className="mt-2 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg px-3 py-1.5 inline-flex items-center gap-1"
                style={{ border: 'none' }}
                onClick={() => {
                  const imageUrls = (sourceData.imagePaths || sourceData.images).map(img => 
                    apiService.getImageUrl(currentUserId, img.split('/').pop(), 'measurement')
                  )
                  openImagePreview(imageUrls, 0)
                }}
              >
                <Image className="h-3 w-3" />
                {t('measurement.view_all_images')} ({(sourceData.imagePaths || sourceData.images).length}{t('measurement.images_count')})
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderCovidAssessmentData = (sourceData) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">評估信息</h4>
            <div className="space-y-2">
              <div className="bg-white/50 rounded-lg p-3">
                <span className="text-sm font-medium">評估類型：</span>
                <span className="text-sm">{sourceData.assessmentType === 'covid' ? 'COVID-19' : '流感'}</span>
              </div>
              {sourceData.temperature && (
                <div className="bg-white/50 rounded-lg p-3">
                  <span className="text-sm font-medium">體溫：</span>
                  <span className="text-sm">{sourceData.temperature}°C</span>
                </div>
              )}
              {sourceData.riskLevel && (
                <div className="bg-white/50 rounded-lg p-3">
                  <span className="text-sm font-medium">風險等級：</span>
                  <span className="text-sm">{sourceData.riskLevelLabel || sourceData.riskLevel}</span>
                </div>
              )}
              <div className="bg-white/50 rounded-lg p-3">
                <span className="text-sm font-medium">評估時間：</span>
                <span className="text-sm">{formatDate(sourceData.createdAt)}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">症狀記錄</h4>
            {sourceData.symptoms && sourceData.symptoms.length > 0 ? (
              <div className="bg-white/50 rounded-lg p-3">
                <div className="flex flex-wrap gap-1">
                  {sourceData.symptoms.map((symptom, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/50 rounded-lg p-3">
                <span className="text-sm text-gray-500">無症狀記錄</span>
              </div>
            )}
          </div>
        </div>

        {(sourceData.exposureHistory || sourceData.travelHistory || sourceData.contactHistory) && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">接觸史</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sourceData.exposureHistory && (
                <div className="bg-white/50 rounded-lg p-3">
                  <span className="text-sm font-medium">接觸史：</span>
                  <span className="text-sm">{sourceData.exposureHistory}</span>
                </div>
              )}
              {sourceData.travelHistory && (
                <div className="bg-white/50 rounded-lg p-3">
                  <span className="text-sm font-medium">旅行史：</span>
                  <span className="text-sm">{sourceData.travelHistory}</span>
                </div>
              )}
              {sourceData.contactHistory && (
                <div className="bg-white/50 rounded-lg p-3">
                  <span className="text-sm font-medium">密切接觸史：</span>
                  <span className="text-sm">{sourceData.contactHistory}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{i18n.t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{i18n.t('pages.patient_diagnosis_detail.report_not_found')}</p>
        </div>
      </div>
    )
  }

  const ReportIcon = getReportTypeIcon(report.reportType)

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
        title={i18n.t('pages.patient_diagnosis_detail.title')}
        subtitle={i18n.t('pages.patient_diagnosis_detail.subtitle')}
        icon={FileText}
        showBackButton={true}
        backPath="/patient/diagnosis-reports"
        user={user}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        
        {/* 患者测量信息 */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg shadow-2xl shadow-red-500/10" style={{ border: 'none' }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                {i18n.t('pages.patient_diagnosis_detail.patient_measurement_info')}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {user?.fullName || user?.username || i18n.t('common.unknown')} {i18n.t('pages.patient_diagnosis_detail.health_measurement_data_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 患者基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">{i18n.t('pages.patient_diagnosis_detail.patient_name')}</p>
                      <p className="font-medium text-gray-800">{user?.fullName || user?.username || i18n.t('common.unknown')}</p>
                    </div>
                </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                <div>
                      <p className="text-sm text-gray-600">{i18n.t('pages.patient_diagnosis_detail.patient_id')}</p>
                      <p className="font-medium text-gray-800">{user?.username || i18n.t('common.unknown')}</p>
                    </div>
                  </div>
                </div>

                {/* 根据不同的数据源渲染不同的内容 */}
                {report.measurementId ? (
                  renderAbnormalMeasurementData(report.measurementId)
                ) : report.assessmentId ? (
                  renderCovidAssessmentData(report.assessmentId)
                ) : report.sourceDataSnapshot ? (
                  report.reportType === 'measurement' ? 
                    renderAbnormalMeasurementData(report.sourceDataSnapshot) :
                    renderCovidAssessmentData(report.sourceDataSnapshot)
                ) : (
                  <p className="text-gray-500">{i18n.t('pages.patient_diagnosis_detail.data_snapshot_unavailable')}</p>
                )}
              </div>
            </CardContent>
          </Card>
            </div>

        {/* 诊断记录查看 */}
        <div>
          <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg shadow-2xl shadow-green-500/10" style={{ border: 'none' }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                {i18n.t('pages.patient_diagnosis_detail.diagnosis_record_view')}
                </CardTitle>
              <CardDescription className="text-gray-600">
                {i18n.t('pages.patient_diagnosis_detail.diagnosis_record_desc')}
              </CardDescription>
              </CardHeader>
            <CardContent className="space-y-6">
              {/* 诊断结果 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-800">{i18n.t('pages.patient_diagnosis_detail.diagnosis_result')}</h3>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 via-blue-25 to-white rounded-xl shadow-sm">
                  <p className="text-blue-900 font-medium text-base leading-relaxed whitespace-pre-wrap">{report.diagnosis || i18n.t('pages.patient_diagnosis_detail.no_diagnosis_result')}</p>
                </div>
              </div>

              {/* 风险等级 */}
              {report.riskLevel && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">{i18n.t('pages.patient_diagnosis_detail.risk_level')}</h3>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 via-orange-25 to-white rounded-xl shadow-sm">
                    <Badge 
                      className={`text-sm px-3 py-1.5 font-medium rounded-lg shadow-sm ${
                        report.riskLevel === 'high' || report.riskLevel === 'critical' 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                          : report.riskLevel === 'medium' 
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      }`}
                      style={{ border: 'none' }}
                    >
                      {report.riskLevel === 'low' ? i18n.t('pages.patient_diagnosis_detail.low_risk') : 
                       report.riskLevel === 'medium' ? i18n.t('pages.patient_diagnosis_detail.medium_risk') : 
                       report.riskLevel === 'high' ? i18n.t('pages.patient_diagnosis_detail.high_risk') : 
                       report.riskLevel === 'critical' ? i18n.t('pages.patient_diagnosis_detail.critical_risk') : report.riskLevel}
                    </Badge>
                  </div>
                </div>
              )}

              {/* 医生建议 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">{i18n.t('pages.patient_diagnosis_detail.doctor_recommendation')}</h3>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 via-green-25 to-white rounded-xl shadow-sm min-h-[100px]">
                    <p className="text-green-900 leading-relaxed whitespace-pre-wrap">{report.recommendation || report.suggestions || i18n.t('pages.patient_diagnosis_detail.no_recommendation')}</p>
                  </div>
                </div>

                {report.treatment && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">{i18n.t('pages.patient_diagnosis_detail.treatment_plan')}</h3>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 via-purple-25 to-white rounded-xl shadow-sm min-h-[100px]">
                      <p className="text-purple-900 leading-relaxed whitespace-pre-wrap">{report.treatment}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 生活方式建议和复查建议 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {report.lifestyle && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">{i18n.t('pages.patient_diagnosis_detail.lifestyle_advice')}</h3>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-teal-50 via-teal-25 to-white rounded-xl shadow-sm min-h-[100px]">
                      <p className="text-teal-900 leading-relaxed whitespace-pre-wrap">{report.lifestyle}</p>
                    </div>
                  </div>
                )}

                {report.followUp && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">{i18n.t('pages.patient_diagnosis_detail.follow_up_advice')}</h3>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-amber-50 via-amber-25 to-white rounded-xl shadow-sm min-h-[100px]">
                      <p className="text-amber-900 leading-relaxed whitespace-pre-wrap">{report.followUp}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 异常原因 */}
              {report.abnormalReasons && report.abnormalReasons.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">{i18n.t('pages.patient_diagnosis_detail.abnormal_reasons')}</h3>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-red-50 via-red-25 to-white rounded-xl shadow-sm">
                    <div className="flex flex-wrap gap-2">
                      {report.abnormalReasons.map((reason, index) => (
                        <span key={index} className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm" style={{ border: 'none' }}>
                          <AlertTriangle className="h-3 w-3" />
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            {/* COVID/流感特有信息 */}
            {report.reportType === 'covid_flu' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">{i18n.t('pages.patient_diagnosis_detail.special_guidance')}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.isolationDays && (
                      <div className="p-4 bg-gradient-to-br from-indigo-50 via-indigo-25 to-white rounded-xl shadow-sm">
                        <span className="font-medium text-indigo-800">{i18n.t('pages.patient_diagnosis_detail.isolation_advice')}：</span>
                        <span className="text-indigo-900"> {report.isolationDays} {i18n.t('pages.patient_diagnosis_detail.days')}</span>
                    </div>
                  )}
                  
                  {report.testingRecommendation && (
                      <div className="p-4 bg-gradient-to-br from-indigo-50 via-indigo-25 to-white rounded-xl shadow-sm">
                        <span className="font-medium text-indigo-800">{i18n.t('pages.patient_diagnosis_detail.testing_recommendation')}：</span>
                        <p className="text-indigo-900 mt-1">{report.testingRecommendation}</p>
                    </div>
                  )}

                  {report.medicationPrescription && (
                      <div className="p-4 bg-gradient-to-br from-indigo-50 via-indigo-25 to-white rounded-xl shadow-sm">
                        <span className="font-medium text-indigo-800">{i18n.t('pages.patient_diagnosis_detail.medication_prescription')}：</span>
                        <p className="text-indigo-900 mt-1">{report.medicationPrescription}</p>
                    </div>
                  )}

                  {report.monitoringInstructions && (
                      <div className="p-4 bg-gradient-to-br from-indigo-50 via-indigo-25 to-white rounded-xl shadow-sm">
                        <span className="font-medium text-indigo-800">{i18n.t('pages.patient_diagnosis_detail.monitoring_instructions')}：</span>
                        <p className="text-indigo-900 mt-1">{report.monitoringInstructions}</p>
                    </div>
                  )}

                  {report.returnToWorkDate && (
                      <div className="p-4 bg-gradient-to-br from-indigo-50 via-indigo-25 to-white rounded-xl shadow-sm">
                        <span className="font-medium text-indigo-800">{i18n.t('pages.patient_diagnosis_detail.return_to_work_date')}：</span>
                        <span className="text-indigo-900"> {formatDate(report.returnToWorkDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 其他备注 */}
              {report.notes && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">{i18n.t('pages.patient_diagnosis_detail.doctor_notes')}</h3>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-gray-50 via-gray-25 to-white rounded-xl shadow-sm">
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{report.notes}</p>
                  </div>
                </div>
              )}

              {/* 诊断信息 */}
              <div className="mt-8 p-4 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{i18n.t('pages.patient_diagnosis_detail.diagnosis_time')}：{formatDate(report.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{i18n.t('pages.patient_diagnosis_detail.diagnosis_doctor')}：{report.doctorId?.fullName || report.doctorId?.username || i18n.t('common.unknown')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 bg-white px-2 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>{i18n.t('pages.patient_diagnosis_detail.diagnosis_completed')}</span>
                  </div>
                </div>
                {report.followUpDate && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{i18n.t('pages.patient_diagnosis_detail.follow_up_date')}：{formatDate(report.followUpDate)}</span>
                    </div>
                  )}
              </div>
                </CardContent>
              </Card>
        </div>
      </main>

      {/* 图片预览对话框 */}
      <ImagePreview
        images={previewImages}
        isOpen={imagePreviewOpen}
        onClose={closeImagePreview}
        initialIndex={previewInitialIndex}
      />
    </div>
  )
} 