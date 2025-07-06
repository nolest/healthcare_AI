import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Badge } from '../components/ui/badge.jsx'
import PatientHeader from '../components/ui/PatientHeader.jsx'
import { 
  CheckCircle, 
  AlertTriangle, 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets, 
  ArrowLeft,
  Clock,
  Stethoscope,
  ClipboardCheck
} from 'lucide-react'
import i18n from '../utils/i18n.js'

export default function PatientMeasurementResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [resultData, setResultData] = useState(null)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    // 页面加载时滚动到顶部
    window.scrollTo(0, 0)
    
    // 从路由状态获取结果数据
    if (location.state && location.state.resultData) {
      setResultData(location.state.resultData)
    } else {
      // 如果没有结果数据，重定向到测量页面
      navigate('/patient/measurement')
    }
    
    return () => {
      i18n.removeListener(handleLanguageChange)
    }
  }, [location.state, navigate])

  const handleBackToPatient = () => {
    navigate('/patient')
  }

  const getMeasurementIcon = (type) => {
    switch (type) {
      case 'blood_pressure':
        return <Heart className="h-5 w-5 text-red-500" />
      case 'heart_rate':
        return <Activity className="h-5 w-5 text-pink-500" />
      case 'temperature':
        return <Thermometer className="h-5 w-5 text-orange-500" />
      case 'oxygen_saturation':
        return <Droplets className="h-5 w-5 text-blue-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getMeasurementLabel = (type) => {
    const labels = {
      blood_pressure: t('pages.measurement_result.blood_pressure'),
      heart_rate: t('pages.measurement_result.heart_rate'),
      temperature: t('pages.measurement_result.temperature'),
      oxygen_saturation: t('pages.measurement_result.oxygen_saturation')
    }
    return labels[type] || t('common.unknown')
  }

  const t = (key) => {
    language; // 确保组件依赖于language状态
    return i18n.t(key)
  }

  if (!resultData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <PatientHeader 
          title={t('pages.measurement_result.title')}
          subtitle={t('pages.measurement_result.loading_subtitle')}
          icon={ClipboardCheck}
          showBackButton={false}
        />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  const isAbnormal = resultData.abnormalResult && resultData.abnormalResult.isAbnormal
  const abnormalReasons = resultData.abnormalResult?.reasons || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <PatientHeader 
        title={t('pages.measurement_result.title')}
        subtitle={isAbnormal ? t('pages.measurement_result.abnormal_detected') : t('pages.measurement_result.success_submitted')}
        icon={ClipboardCheck}
        showBackButton={true}
        backPath="/patient/measurement"
      />
      
      <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* 结果状态卡片 */}
          <Card className={`mb-6 bg-gradient-to-br backdrop-blur-lg border-0 shadow-2xl ${
            isAbnormal 
              ? 'from-orange-50/95 to-red-50/95 shadow-orange-500/20' 
              : 'from-green-50/95 to-emerald-50/95 shadow-green-500/20'
          }`}>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                {isAbnormal ? (
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-lg">
                    <AlertTriangle className="h-12 w-12 text-white" />
                  </div>
                ) : (
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full shadow-lg">
                    <CheckCircle className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
              <CardTitle className={`text-2xl font-bold ${
                isAbnormal ? 'text-orange-800' : 'text-green-800'
              }`}>
                {isAbnormal ? t('pages.measurement_result.record_submitted') : t('pages.measurement_result.record_success')}
              </CardTitle>
              <p className={`text-sm mt-2 ${
                isAbnormal ? 'text-orange-700' : 'text-green-700'
              }`}>
                {isAbnormal 
                  ? t('pages.measurement_result.abnormal_notified')
                  : t('pages.measurement_result.all_normal')
                }
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* 测量数据显示 */}
              {resultData.measurementData && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    {t('pages.measurement_result.measurement_data')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {resultData.measurementData.systolic && resultData.measurementData.diastolic && (
                      <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                        {getMeasurementIcon('blood_pressure')}
                        <div>
                          <div className="font-medium text-gray-800">{t('pages.measurement_result.blood_pressure')}</div>
                          <div className="text-sm text-gray-600">
                            {resultData.measurementData.systolic}/{resultData.measurementData.diastolic} mmHg
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {resultData.measurementData.heartRate && (
                      <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                        {getMeasurementIcon('heart_rate')}
                        <div>
                          <div className="font-medium text-gray-800">{t('pages.measurement_result.heart_rate')}</div>
                          <div className="text-sm text-gray-600">
                            {resultData.measurementData.heartRate} bpm
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {resultData.measurementData.temperature && (
                      <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                        {getMeasurementIcon('temperature')}
                        <div>
                          <div className="font-medium text-gray-800">{t('pages.measurement_result.temperature')}</div>
                          <div className="text-sm text-gray-600">
                            {resultData.measurementData.temperature}°C
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {resultData.measurementData.oxygenSaturation && (
                      <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                        {getMeasurementIcon('oxygen_saturation')}
                        <div>
                          <div className="font-medium text-gray-800">{t('pages.measurement_result.oxygen_saturation')}</div>
                          <div className="text-sm text-gray-600">
                            {resultData.measurementData.oxygenSaturation}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 异常信息显示 */}
              {isAbnormal && abnormalReasons.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {t('pages.measurement_result.abnormal_detection_results')}
                  </h4>
                  <div className="space-y-2">
                    {abnormalReasons.map((reason, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-orange-50/80 rounded-xl border border-orange-200/50">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-orange-800 text-sm">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 图片上传信息 */}
              {resultData.imageCount > 0 && (
                <div className="flex items-center gap-2 p-3 bg-blue-50/60 rounded-xl">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800 text-sm">
                    {t('pages.measurement_result.images_uploaded', { count: resultData.imageCount })}
                  </span>
                </div>
              )}

              {/* 后续操作提示 */}
              {isAbnormal ? (
                <div className="bg-gradient-to-r from-orange-50/80 to-red-50/80 border border-orange-200/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Stethoscope className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h5 className="font-semibold text-orange-800">{t('pages.measurement_result.follow_up_processing')}</h5>
                      <p className="text-orange-700 text-sm">
                        {t('pages.measurement_result.abnormal_notification_desc')}
                      </p>
                      <div className="flex items-center gap-2 text-orange-600 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>{t('pages.measurement_result.check_diagnosis_later')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-200/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-green-800">{t('pages.measurement_result.health_status_good')}</h5>
                      <p className="text-green-700 text-sm mt-1">
                        {t('pages.measurement_result.all_normal_advice')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 返回按钮 */}
          <div className="text-center pt-8 pb-16">
            <Button
              onClick={handleBackToPatient}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t('pages.measurement_result.back_to_patient_home')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
} 