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

export default function PatientMeasurementResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [resultData, setResultData] = useState(null)

  useEffect(() => {
    // 从路由状态获取结果数据
    if (location.state && location.state.resultData) {
      setResultData(location.state.resultData)
    } else {
      // 如果没有结果数据，重定向到测量页面
      navigate('/patient/measurement')
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
      blood_pressure: '血壓',
      heart_rate: '心率',
      temperature: '體溫',
      oxygen_saturation: '血氧飽和度'
    }
    return labels[type] || '未知'
  }

  if (!resultData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <PatientHeader 
          title="測量結果"
          subtitle="正在載入結果..."
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
        title="測量結果"
        subtitle={isAbnormal ? "檢測到異常數值" : "測量記錄提交成功"}
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
                {isAbnormal ? '測量記錄已提交' : '測量記錄提交成功'}
              </CardTitle>
              <p className={`text-sm mt-2 ${
                isAbnormal ? 'text-orange-700' : 'text-green-700'
              }`}>
                {isAbnormal 
                  ? '檢測到異常數值，已通知醫護人員'
                  : '所有測量值均在正常範圍內'
                }
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* 测量数据显示 */}
              {resultData.measurementData && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    測量數據
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {resultData.measurementData.systolic && resultData.measurementData.diastolic && (
                      <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                        {getMeasurementIcon('blood_pressure')}
                        <div>
                          <div className="font-medium text-gray-800">血壓</div>
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
                          <div className="font-medium text-gray-800">心率</div>
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
                          <div className="font-medium text-gray-800">體溫</div>
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
                          <div className="font-medium text-gray-800">血氧飽和度</div>
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
                    異常檢測結果
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
                    已成功上傳 {resultData.imageCount} 張圖片
                  </span>
                </div>
              )}

              {/* 后续操作提示 */}
              {isAbnormal ? (
                <div className="bg-gradient-to-r from-orange-50/80 to-red-50/80 border border-orange-200/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Stethoscope className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h5 className="font-semibold text-orange-800">後續處理</h5>
                      <p className="text-orange-700 text-sm">
                        您的異常測量數據已自動通知醫護人員進行診斷。醫護人員會盡快為您提供專業的診斷建議。
                      </p>
                      <div className="flex items-center gap-2 text-orange-600 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>請稍後查看診斷結果</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-200/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-green-800">健康狀態良好</h5>
                      <p className="text-green-700 text-sm mt-1">
                        您的所有測量值都在正常範圍內，請繼續保持良好的生活習慣。
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 返回按钮 */}
          <div className="text-center">
            <Button
              onClick={handleBackToPatient}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              返回患者首頁
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
} 