import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Heart, Activity, Thermometer, Droplets, RefreshCw, Calendar, Stethoscope } from 'lucide-react'
import apiService from '../services/api.js'
import i18n from '../utils/i18n'

export default function MeasurementHistory({ measurements: propMeasurements, onRefresh }) {
  const [measurements, setMeasurements] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    // 监听语言变化
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    
    return () => {
      i18n.removeListener(handleLanguageChange)
    }
  }, [])

  // 如果有传入的measurements属性，使用它；否则从API获取
  useEffect(() => {
    if (propMeasurements) {
      console.log('Using measurements from props:', propMeasurements.length)
      setMeasurements(propMeasurements)
    } else {
      loadMeasurements()
    }
  }, [propMeasurements])

  // 加載測量數據
  const loadMeasurements = async () => {
    if (!apiService.isAuthenticated()) {
      console.log('User not authenticated')
      setMeasurements([])
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await apiService.getMyMeasurements()
      console.log('API response:', response)
      
      // 处理API响应格式：可能是包装对象或直接数组
      let userMeasurements = []
      if (response && response.data && Array.isArray(response.data)) {
        userMeasurements = response.data
      } else if (Array.isArray(response)) {
        userMeasurements = response
      } else {
        console.warn('Unexpected API response format:', response)
        userMeasurements = []
      }
      
      console.log('Loading measurements from API:', userMeasurements.length)
      setMeasurements(userMeasurements)
    } catch (error) {
      console.error('Error loading measurements:', error)
      setError(i18n.t('measurement.load_failed'))
      setMeasurements([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (measurement) => {
    if (measurement.isAbnormal) {
      return <Badge className="bg-red-500 text-white text-xs px-2 py-1 h-5">{i18n.t('measurement.abnormal')}</Badge>
    }
    
    switch (measurement.status) {
      case 'pending':
        return <Badge className="bg-yellow-500 text-white text-xs px-2 py-1 h-5">{i18n.t('measurement.pending')}</Badge>
      case 'processed':
        return <Badge className="bg-green-500 text-white text-xs px-2 py-1 h-5">{i18n.t('measurement.processed')}</Badge>
      case 'reviewed':
        return <Badge className="bg-blue-500 text-white text-xs px-2 py-1 h-5">{i18n.t('measurement.reviewed')}</Badge>
      default:
        return <Badge className="bg-gray-500 text-white text-xs px-2 py-1 h-5">{i18n.t('measurement.unknown')}</Badge>
    }
  }

  const getCardBackgroundColor = (measurement) => {
    if (measurement.isAbnormal) {
      return 'bg-gradient-to-br from-red-50/90 to-red-100/70'
    }
    return 'bg-gradient-to-br from-blue-50/90 to-blue-100/70'
  }

  const getCardBorderColor = (measurement) => {
    if (measurement.isAbnormal) {
      return 'ring-red-200/50'
    }
    return 'ring-blue-200/50'
  }

  const getIconColor = (measurement) => {
    if (measurement.isAbnormal) {
      return 'text-red-600'
    }
    return 'text-blue-600'
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 直接按日期排序显示所有测量记录
  const sortedMeasurements = [...(measurements || [])].sort((a, b) => {
    return new Date(b.createdAt || b.measurementTime) - new Date(a.createdAt || a.measurementTime)
  })

  return (
    <div className="space-y-6">
      <Card className="bg-white/40 backdrop-blur-xl ring-1 ring-white/30 shadow-2xl shadow-blue-500/10">
        <CardHeader>
          <div>
            <CardTitle className="text-xl bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">{i18n.t('measurement.history_title')}</CardTitle>
            <CardDescription className="text-gray-600">{i18n.t('measurement.history_description')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-gradient-to-r from-red-50/90 to-red-100/70 ring-1 ring-red-200/50 text-red-700 px-4 py-3 rounded-xl mb-4 shadow-sm">
              {error}
            </div>
          )}

          {/* 測量記錄列表 */}
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-500">{i18n.t('common.loading')}</p>
            </div>
          ) : sortedMeasurements.length === 0 ? (
            <div className="text-center py-8">
              <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{i18n.t('measurement.no_records')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedMeasurements.map((measurement) => (
                <Card key={measurement._id} className={`${getCardBackgroundColor(measurement)} backdrop-blur-lg ring-1 ${getCardBorderColor(measurement)} shadow-md transition-all duration-300 !py-2 !gap-1.5`}>
                  <CardHeader className="pb-1 px-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Activity className={`h-4 w-4 ${getIconColor(measurement)}`} />
                        <CardTitle className="text-sm text-gray-800">{i18n.t('measurement.vital_signs')}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusBadge(measurement)}
                      </div>
                    </div>
                    <CardDescription className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {formatDateTime(measurement.createdAt || measurement.measurementTime)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 pb-2">
                    <div className="space-y-1.5">
                      {/* 测量数据 */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1 text-xs">{i18n.t('measurement.data')}</h4>
                        <div className="grid grid-cols-2 gap-1">
                          {measurement.systolic && measurement.diastolic && (
                            <div className="text-center p-1 bg-gradient-to-br from-white/90 to-white/70 rounded-md ring-1 ring-red-200/30 shadow-sm">
                              <Heart className="h-3 w-3 text-red-500 mx-auto mb-0.5" />
                              <p className="text-xs text-gray-600">{i18n.t('measurement.blood_pressure')}</p>
                              <p className="font-semibold text-xs text-gray-800">
                                {measurement.systolic}/{measurement.diastolic}
                              </p>
                            </div>
                          )}
                          {measurement.heartRate && (
                            <div className="text-center p-1 bg-gradient-to-br from-white/90 to-white/70 rounded-md ring-1 ring-pink-200/30 shadow-sm">
                              <Activity className="h-3 w-3 text-pink-500 mx-auto mb-0.5" />
                              <p className="text-xs text-gray-600">{i18n.t('measurement.heart_rate')}</p>
                              <p className="font-semibold text-xs text-gray-800">{measurement.heartRate} bpm</p>
                            </div>
                          )}
                          {measurement.temperature && (
                            <div className="text-center p-1 bg-gradient-to-br from-white/90 to-white/70 rounded-md ring-1 ring-orange-200/30 shadow-sm">
                              <Thermometer className="h-3 w-3 text-orange-500 mx-auto mb-0.5" />
                              <p className="text-xs text-gray-600">{i18n.t('measurement.temperature')}</p>
                              <p className="font-semibold text-xs text-gray-800">{measurement.temperature}°C</p>
                            </div>
                          )}
                          {measurement.oxygenSaturation && (
                            <div className="text-center p-1 bg-gradient-to-br from-white/90 to-white/70 rounded-md ring-1 ring-cyan-200/30 shadow-sm">
                              <Droplets className="h-3 w-3 text-cyan-500 mx-auto mb-0.5" />
                              <p className="text-xs text-gray-600">{i18n.t('measurement.oxygen_saturation')}</p>
                              <p className="font-semibold text-xs text-gray-800">{measurement.oxygenSaturation}%</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 备注信息 */}
                      {measurement.notes && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1 text-xs">{i18n.t('measurement.notes')}</h4>
                          <p className="text-xs text-gray-600 bg-gradient-to-br from-white/90 to-white/70 rounded-md p-1 shadow-sm">
                            {measurement.notes}
                          </p>
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
    </div>
  )
}



