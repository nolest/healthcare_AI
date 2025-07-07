import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, 
  Filter, 
  Search, 
  AlertTriangle, 
  User, 
  Calendar, 
  Activity, 
  Heart, 
  Thermometer, 
  Droplets,
  Eye,
  Stethoscope,
  UserCheck
} from 'lucide-react'
import MedicalHeader from '../components/ui/MedicalHeader.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Button } from '../components/ui/button.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n.js'
import AbnormalReasonFormatter from '../utils/abnormalReasonFormatter.js'

export default function MedicalDiagnosisPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [abnormalMeasurements, setAbnormalMeasurements] = useState([])
  const [filteredMeasurements, setFilteredMeasurements] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())
  
  // 筛选状态
  const [filters, setFilters] = useState({
    patientId: '',
    patientName: '',
    measurementType: 'all',
    dateRange: 'all'
  })

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

    setCurrentUser(userData)
    loadAbnormalMeasurements()
  }, [navigate])

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    i18n.addListener(handleLanguageChange)
    return () => i18n.removeListener(handleLanguageChange)
  }, [])

  const loadAbnormalMeasurements = async () => {
    setLoading(true)
    try {
      const response = await apiService.getAbnormalMeasurements()
      console.log('异常测量数据:', response)
      
      if (response.success && response.data) {
        // 确保数据格式正确，添加用户信息
        const measurementsWithUserInfo = response.data.map((measurement) => {
          // 检查 userId 是否已经被 populate 了
          const userInfo = measurement.userId && typeof measurement.userId === 'object' 
            ? measurement.userId 
            : null

          return {
            ...measurement,
            patientInfo: userInfo || {
              fullName: i18n.t('pages.medical_diagnosis.unknown_patient'),
              username: typeof measurement.userId === 'string' ? measurement.userId : measurement.userId?._id || i18n.t('common.unknown'),
              age: null,
              gender: i18n.t('common.unknown')
            }
          }
        })
        
        setAbnormalMeasurements(measurementsWithUserInfo)
        setFilteredMeasurements(measurementsWithUserInfo)
        
        // 计算统计数据
        calculateStats(measurementsWithUserInfo)
      } else {
        setAbnormalMeasurements([])
        setFilteredMeasurements([])
      }
    } catch (error) {
      console.error('获取异常测量数据失败:', error)
      setAbnormalMeasurements([])
      setFilteredMeasurements([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (measurements) => {
    const stats = {
      total: measurements.length,
      pending: measurements.filter(m => m.status === 'pending').length,
      processed: measurements.filter(m => m.status === 'processed' || m.status === 'reviewed').length,
      byType: {}
    }
    
    // 按测量类型统计
    measurements.forEach(measurement => {
      const type = getMeasurementType(measurement)
      stats.byType[type] = (stats.byType[type] || 0) + 1
    })
    
    setStats(stats)
  }

  const getMeasurementType = (measurement) => {
    if (measurement.systolic && measurement.diastolic) return 'blood_pressure'
    if (measurement.heartRate) return 'heart_rate'
    if (measurement.temperature) return 'temperature'
    if (measurement.oxygenSaturation) return 'oxygen_saturation'
    return 'unknown'
  }

  const getMeasurementTypeLabel = (type) => {
    const labels = {
      blood_pressure: i18n.t('measurement.blood_pressure'),
      heart_rate: i18n.t('measurement.heart_rate'),
      temperature: i18n.t('measurement.temperature'),
      oxygen_saturation: i18n.t('measurement.oxygen_saturation'),
      unknown: i18n.t('common.unknown')
    }
    return labels[type] || i18n.t('common.unknown')
  }

  // 基於 abnormalReasons 獲取異常類型顯示
  const getAbnormalTypeDisplay = (measurement) => {
    // 檢查是否有 abnormalReasons 字段
    if (measurement.abnormalReasons && Array.isArray(measurement.abnormalReasons) && measurement.abnormalReasons.length > 0) {
      const reasonCount = measurement.abnormalReasons.length
      
      if (reasonCount === 1) {
        // 只有一個異常，顯示具體異常類型
        const reason = measurement.abnormalReasons[0]
        if (AbnormalReasonFormatter.isStructuredData(reason)) {
          // 使用結構化數據的類型信息
          const typeMapping = {
            'systolic_pressure': i18n.t('measurement.blood_pressure'),
            'diastolic_pressure': i18n.t('measurement.blood_pressure'),
            'heart_rate': i18n.t('measurement.heart_rate'),
            'temperature': i18n.t('measurement.temperature'),
            'oxygen_saturation': i18n.t('measurement.oxygen_saturation')
          }
          return typeMapping[reason.type] || i18n.t('pages.medical_diagnosis.single_abnormal')
        } else {
          // 非結構化數據，顯示 "1個異常"
          return i18n.t('pages.medical_diagnosis.single_abnormal')
        }
      } else {
        // 多個異常，顯示 "x個異常"
        return i18n.t('pages.medical_diagnosis.multiple_abnormal', { count: reasonCount })
      }
    }
    
    // 如果沒有 abnormalReasons，回退到原有邏輯
    return getMeasurementTypeLabel(getMeasurementType(measurement))
  }

  const getMeasurementTypeIcon = (type) => {
    switch (type) {
      case 'blood_pressure':
        return <Activity className="h-4 w-4 text-red-600" />
      case 'heart_rate':
        return <Heart className="h-4 w-4 text-pink-600" />
      case 'temperature':
        return <Thermometer className="h-4 w-4 text-orange-600" />
      case 'oxygen_saturation':
        return <Droplets className="h-4 w-4 text-blue-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  // 獲取異常類型圖標，根據不同類型返回不同圖標
  const getAbnormalTypeIcon = (measurement) => {
    // 檢查是否有 abnormalReasons 字段
    if (measurement.abnormalReasons && Array.isArray(measurement.abnormalReasons) && measurement.abnormalReasons.length > 0) {
      const reasonCount = measurement.abnormalReasons.length
      
      if (reasonCount > 1) {
        // 多個異常，使用警告圖標
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      } else {
        // 單個異常，根據具體類型返回圖標
        const reason = measurement.abnormalReasons[0]
        
        if (AbnormalReasonFormatter.isStructuredData(reason)) {
          // 根據結構化數據的類型返回對應圖標
          const typeMapping = {
            'systolic_pressure': 'blood_pressure',
            'diastolic_pressure': 'blood_pressure',
            'heart_rate': 'heart_rate',
            'temperature': 'temperature',
            'oxygen_saturation': 'oxygen_saturation'
          }
          const iconType = typeMapping[reason.type] || 'default'
          return getMeasurementTypeIcon(iconType)
        } else {
          // 非結構化數據，使用默認圖標
          return <Activity className="h-4 w-4 text-orange-600" />
        }
      }
    }
    
    // 沒有 abnormalReasons，回退到原有邏輯
    const type = getMeasurementType(measurement)
    return getMeasurementTypeIcon(type)
  }

  // 獲取異常數量標籤
  const getAbnormalCountBadge = (measurement) => {
    // 檢查是否有 abnormalReasons 字段
    if (measurement.abnormalReasons && Array.isArray(measurement.abnormalReasons) && measurement.abnormalReasons.length > 0) {
      const reasonCount = measurement.abnormalReasons.length
      
      if (reasonCount > 1) {
        // 多個異常，顯示帶底色的數量標籤
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {i18n.t('pages.medical_diagnosis.abnormal_count', { count: reasonCount })}
          </span>
        )
      } else {
        // 單個異常，顯示單個類型標籤
        const reason = measurement.abnormalReasons[0]
        
        if (AbnormalReasonFormatter.isStructuredData(reason)) {
          // 使用結構化數據的類型信息
          const typeMapping = {
            'systolic_pressure': i18n.t('measurement.blood_pressure'),
            'diastolic_pressure': i18n.t('measurement.blood_pressure'),
            'heart_rate': i18n.t('measurement.heart_rate'),
            'temperature': i18n.t('measurement.temperature'),
            'oxygen_saturation': i18n.t('measurement.oxygen_saturation')
          }
          const typeLabel = typeMapping[reason.type] || i18n.t('pages.medical_diagnosis.single_abnormal')
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {typeLabel}
            </span>
          )
        } else {
          // 非結構化數據，顯示通用標籤
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              1
            </span>
          )
        }
      }
    }
    
    // 沒有 abnormalReasons，回退到原有邏輯
    const type = getMeasurementType(measurement)
    const typeLabel = getMeasurementTypeLabel(type)
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {typeLabel}
      </span>
    )
  }

  const getMeasurementValue = (measurement) => {
    const type = getMeasurementType(measurement)
    switch (type) {
      case 'blood_pressure':
        return `${measurement.systolic}/${measurement.diastolic} mmHg`
      case 'heart_rate':
        return `${measurement.heartRate} bpm`
      case 'temperature':
        return `${measurement.temperature}°C`
      case 'oxygen_saturation':
        return `${measurement.oxygenSaturation}%`
      default:
        // 如果沒有識別的類型，嘗試顯示任何可用的數值
        if (measurement.systolic || measurement.diastolic) {
          return `${measurement.systolic || '--'}/${measurement.diastolic || '--'} mmHg`
        }
        if (measurement.heartRate) {
          return `${measurement.heartRate} bpm`
        }
        if (measurement.temperature) {
          return `${measurement.temperature}°C`
        }
        if (measurement.oxygenSaturation) {
          return `${measurement.oxygenSaturation}%`
        }
        return i18n.t('pages.medical_diagnosis.no_data_available')
    }
  }

  // 格式化異常原因，支持長度限制和省略號
  const getFormattedAbnormalReason = (measurement, maxLength = 20) => {
    let reasons = []
    
    // 如果測量記錄有abnormalReasons字段，使用格式化工具處理
    if (measurement.abnormalReasons && measurement.abnormalReasons.length > 0) {
      const formatted = AbnormalReasonFormatter.smartFormatMultiple(measurement.abnormalReasons)
      reasons = formatted.filter(reason => reason && reason.trim() !== '')
    }
    
    // 如果沒有結構化異常原因，回退到原有邏輯
    if (reasons.length === 0) {
      const fallbackReason = getAbnormalReason(measurement)
      if (fallbackReason && fallbackReason !== i18n.t('pages.medical_diagnosis.abnormal_value')) {
        reasons = [fallbackReason]
      }
    }
    
    // 如果還是沒有原因，返回通用異常提示
    if (reasons.length === 0) {
      return i18n.t('pages.medical_diagnosis.abnormal_value_detected')
    }
    
    // 處理單個症狀的顯示
    if (reasons.length === 1) {
      const singleReason = reasons[0]
      if (singleReason.length <= maxLength) {
        return singleReason
      }
      return singleReason.substring(0, maxLength - 3) + '...'
    }
    
    // 多個症狀的智能顯示
    let displayText = ''
    let displayedCount = 0
    
    for (let i = 0; i < reasons.length; i++) {
      const reason = reasons[i]
      const separator = i === 0 ? '' : '、'  // 使用頓號節省空間
      const testText = displayText + separator + reason
      
      if (testText.length <= maxLength - 8) { // 預留空間給省略號和數量
        displayText = testText
        displayedCount++
      } else {
        break
      }
    }
    
    const remainingCount = reasons.length - displayedCount
    if (remainingCount > 0) {
      const countText = i18n.t('pages.medical_diagnosis.and_more_symptoms', { count: remainingCount })
      displayText += countText
    }
    
    return displayText || reasons[0].substring(0, maxLength - 3) + '...'
  }

  const getAbnormalReason = (measurement) => {
    // 如果测量记录有abnormalReasons字段，使用格式化工具处理
    if (measurement.abnormalReasons && measurement.abnormalReasons.length > 0) {
      const formatted = AbnormalReasonFormatter.smartFormatMultiple(measurement.abnormalReasons)
      return formatted.join(', ')
    }
    
    // 如果没有abnormalReasons，回退到原有逻辑
    const type = getMeasurementType(measurement)
    switch (type) {
      case 'blood_pressure':
        if (measurement.systolic > 140 || measurement.diastolic > 90) {
          return i18n.t('pages.medical_diagnosis.high_blood_pressure')
        } else if (measurement.systolic < 90 || measurement.diastolic < 60) {
          return i18n.t('pages.medical_diagnosis.low_blood_pressure')
        }
        break
      case 'heart_rate':
        if (measurement.heartRate > 100) {
          return i18n.t('pages.medical_diagnosis.tachycardia')
        } else if (measurement.heartRate < 60) {
          return i18n.t('pages.medical_diagnosis.bradycardia')
        }
        break
      case 'temperature':
        if (measurement.temperature > 37.5) {
          return i18n.t('pages.medical_diagnosis.fever')
        } else if (measurement.temperature < 36) {
          return i18n.t('pages.medical_diagnosis.hypothermia')
        }
        break
      case 'oxygen_saturation':
        if (measurement.oxygenSaturation < 95) {
          return i18n.t('pages.medical_diagnosis.hypoxemia')
        }
        break
    }
    return i18n.t('pages.medical_diagnosis.abnormal_value')
  }

  const formatDate = (dateString) => {
    if (!dateString) return i18n.t('pages.medical_diagnosis_form.unknown_time')
    const date = new Date(dateString)
    const locale = language === 'en' ? 'en-US' : language === 'zh-CN' ? 'zh-CN' : 'zh-TW'
    return date.toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const applyFilters = () => {
    let filtered = abnormalMeasurements

    // 患者ID筛选
    if (filters.patientId.trim()) {
      filtered = filtered.filter(measurement => {
        const userId = typeof measurement.userId === 'string' 
          ? measurement.userId 
          : measurement.userId?._id || ''
        return userId.toLowerCase().includes(filters.patientId.toLowerCase())
      })
    }

    // 患者姓名筛选
    if (filters.patientName.trim()) {
      filtered = filtered.filter(measurement => {
        const patientName = measurement.patientInfo?.fullName || measurement.patientInfo?.username || ''
        return patientName.toLowerCase().includes(filters.patientName.toLowerCase())
      })
    }

    // 异常类型筛选
    if (filters.measurementType && filters.measurementType !== 'all') {
      filtered = filtered.filter(measurement => {
        const type = getMeasurementType(measurement)
        return type === filters.measurementType
      })
    }

    // 时间范围筛选
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(measurement => {
        const measurementDate = new Date(measurement.createdAt || measurement.timestamp)
        
        switch (filters.dateRange) {
          case 'today':
            return measurementDate >= today
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return measurementDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            return measurementDate >= monthAgo
          default:
            return true
        }
      })
    }

    setFilteredMeasurements(filtered)
  }

  const resetFilters = () => {
    setFilters({
      patientId: '',
      patientName: '',
      measurementType: 'all',
      dateRange: 'all'
    })
    setFilteredMeasurements(abnormalMeasurements)
  }

  const handleDiagnose = (measurement) => {
    // 在新标签页打开诊断页面，使用URL参数传递测量记录ID
    // 如果记录已处理，添加hasread=1参数进入只读模式
    const hasRead = (measurement.status === 'processed' || measurement.status === 'reviewed') ? '1' : '0'
    const url = `/medical/diagnosis/form?mid=${measurement._id}&hasread=${hasRead}`
    window.open(url, '_blank')
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{i18n.t('common.loading')}</p>
        </div>
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
        title={i18n.t('pages.medical_diagnosis.title')}
        subtitle={i18n.t('pages.medical_diagnosis.subtitle')}
        icon={FileText}
        showBackButton={true}
        user={currentUser}
        onBack={() => navigate('/medical')}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 relative z-10">
        
        {/* 统计概览 */}
        {stats && (
          <div className="mb-8">
            <h3 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-4">
              {i18n.t('pages.medical_diagnosis.abnormal_measurement_statistics')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50/80 to-blue-100/60 backdrop-blur-md border-0 shadow-2xl shadow-blue-500/15">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600">{i18n.t('pages.medical_diagnosis.total_abnormal')}</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                  <p className="text-xs text-blue-600/70">{i18n.t('pages.medical_diagnosis.abnormal_measurements_need_diagnosis')}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50/80 to-orange-100/60 backdrop-blur-md border-0 shadow-2xl shadow-orange-500/15">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-600">{i18n.t('pages.medical_diagnosis.pending')}</CardTitle>
                  <FileText className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-700">{stats.pending}</div>
                  <p className="text-xs text-orange-600/70">{i18n.t('pages.medical_diagnosis.waiting_for_diagnosis')}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50/80 to-green-100/60 backdrop-blur-md border-0 shadow-2xl shadow-green-500/15">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">{i18n.t('pages.medical_diagnosis.processed')}</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{stats.processed}</div>
                  <p className="text-xs text-green-600/70">{i18n.t('pages.medical_diagnosis.diagnosis_completed')}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50/80 to-purple-100/60 backdrop-blur-md border-0 shadow-2xl shadow-purple-500/15">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-600">{i18n.t('pages.medical_diagnosis.processing_rate')}</CardTitle>
                  <Activity className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">
                    {stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0}%
                  </div>
                  <p className="text-xs text-purple-600/70">{i18n.t('pages.medical_diagnosis.diagnosis_completion_rate')}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 筛选功能 */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-green-500/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <Filter className="h-5 w-5 text-green-600" />
                {i18n.t('pages.medical_diagnosis.filter_abnormal_measurements')}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {i18n.t('pages.medical_diagnosis.filter_description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="patientId" className="text-sm font-medium text-gray-700">{i18n.t('pages.medical_diagnosis.patient_id')}</Label>
                  <Input
                    id="patientId"
                    placeholder={i18n.t('pages.medical_diagnosis.patient_id_placeholder')}
                    className="mt-1 bg-white/70 border-green-200 focus:border-green-400"
                    value={filters.patientId}
                    onChange={(e) => setFilters(prev => ({ ...prev, patientId: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="patientName" className="text-sm font-medium text-gray-700">{i18n.t('pages.medical_diagnosis.patient_name')}</Label>
                  <Input
                    id="patientName"
                    placeholder={i18n.t('pages.medical_diagnosis.patient_name_placeholder')}
                    className="mt-1 bg-white/70 border-green-200 focus:border-green-400"
                    value={filters.patientName}
                    onChange={(e) => setFilters(prev => ({ ...prev, patientName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">{i18n.t('pages.medical_diagnosis.abnormal_type')}</Label>
                  <Select value={filters.measurementType} onValueChange={(value) => setFilters(prev => ({ ...prev, measurementType: value }))}>
                    <SelectTrigger className="mt-1 bg-white/70 border-green-200 focus:border-green-400">
                      <SelectValue placeholder={i18n.t('pages.medical_diagnosis.select_abnormal_type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{i18n.t('pages.medical_diagnosis.all_types')}</SelectItem>
                      <SelectItem value="blood_pressure">{i18n.t('pages.medical_diagnosis.blood_pressure_abnormal')}</SelectItem>
                      <SelectItem value="heart_rate">{i18n.t('pages.medical_diagnosis.heart_rate_abnormal')}</SelectItem>
                      <SelectItem value="temperature">{i18n.t('pages.medical_diagnosis.temperature_abnormal')}</SelectItem>
                      <SelectItem value="oxygen_saturation">{i18n.t('pages.medical_diagnosis.oxygen_saturation_abnormal')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">{i18n.t('pages.medical_diagnosis.time_range')}</Label>
                  <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                    <SelectTrigger className="mt-1 bg-white/70 border-green-200 focus:border-green-400">
                      <SelectValue placeholder={i18n.t('pages.medical_diagnosis.select_time_range')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{i18n.t('pages.medical_diagnosis.all_time')}</SelectItem>
                      <SelectItem value="today">{i18n.t('pages.medical_diagnosis.today')}</SelectItem>
                      <SelectItem value="week">{i18n.t('pages.medical_diagnosis.recent_week')}</SelectItem>
                      <SelectItem value="month">{i18n.t('pages.medical_diagnosis.recent_month')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={applyFilters}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {i18n.t('pages.medical_diagnosis.apply_filter')}
                </Button>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="border-green-200 hover:bg-green-50"
                >
                  {i18n.t('pages.medical_diagnosis.reset_filter')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 异常测量列表 */}
        <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-green-500/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              {i18n.t('pages.medical_diagnosis.abnormal_measurement_list')} ({filteredMeasurements.length})
            </CardTitle>
            <CardDescription className="text-gray-600">
              {i18n.t('pages.medical_diagnosis.click_view_details')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">{i18n.t('pages.medical_diagnosis.loading_abnormal_data')}</p>
              </div>
            ) : filteredMeasurements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{i18n.t('pages.medical_diagnosis.no_abnormal_data')}</h3>
                <p>{i18n.t('pages.medical_diagnosis.no_abnormal_data_desc')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">{i18n.t('pages.medical_diagnosis.patient_info')}</TableHead>
                      <TableHead className="w-1/8">{i18n.t('pages.medical_diagnosis.abnormal_type_col')}</TableHead>
                      <TableHead className="w-1/8">{i18n.t('pages.medical_diagnosis.abnormal_value_col')}</TableHead>
                      <TableHead className="flex-1">{i18n.t('pages.medical_diagnosis.abnormal_reason')}</TableHead>
                      <TableHead className="w-1/6">{i18n.t('pages.medical_diagnosis.measurement_time')}</TableHead>
                      <TableHead className="w-1/12">{i18n.t('pages.medical_diagnosis.status')}</TableHead>
                      <TableHead className="w-1/12">{i18n.t('pages.medical_diagnosis.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMeasurements.map((measurement) => {
                      const measurementType = getMeasurementType(measurement)
                      return (
                        <TableRow key={measurement._id} className="hover:bg-green-50/50 transition-colors">
                          <TableCell className="w-1/4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate">
                                  {measurement.patientInfo?.fullName || measurement.patientInfo?.username || i18n.t('pages.medical_diagnosis.unknown_patient')}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span className="truncate">ID: {(typeof measurement.userId === 'string' ? measurement.userId : measurement.userId?._id || '').slice(-8)}</span>
                                  {measurement.patientInfo?.gender && (
                                    <Badge variant="outline" className="text-xs">
                                      {measurement.patientInfo.gender === 'male' ? i18n.t('pages.medical_diagnosis.male') : 
                                       measurement.patientInfo.gender === 'female' ? i18n.t('pages.medical_diagnosis.female') : i18n.t('common.unknown')}
                                    </Badge>
                                  )}
                                  {measurement.patientInfo?.age && (
                                    <Badge variant="outline" className="text-xs">
                                      {measurement.patientInfo.age}{i18n.t('pages.medical_diagnosis.years_old')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="w-1/8">
                            <div className="flex items-center gap-2">
                              {getAbnormalTypeIcon(measurement)}
                              {getAbnormalCountBadge(measurement)}
                            </div>
                          </TableCell>
                          <TableCell className="w-1/8">
                            <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 text-xs">
                              {getMeasurementValue(measurement)}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex-1 min-w-0">
                            <div className="text-red-600 font-medium text-sm truncate" title={getFormattedAbnormalReason(measurement, 100)}>
                              {getFormattedAbnormalReason(measurement, 15)}
                            </div>
                          </TableCell>
                          <TableCell className="w-1/6">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-3 w-3" />
                              <span className="truncate">{formatDate(measurement.createdAt || measurement.timestamp)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="w-1/12">
                            <Badge 
                              variant={measurement.status === 'pending' ? 'destructive' : 'default'}
                              className={`text-xs ${
                                measurement.status === 'pending' 
                                  ? 'bg-orange-100 text-orange-700 border-orange-200'
                                  : 'bg-green-100 text-green-700 border-green-200'
                              }`}
                            >
                              {measurement.status === 'pending' ? i18n.t('pages.medical_diagnosis.pending_status') : 
                               measurement.status === 'processed' ? i18n.t('pages.medical_diagnosis.processed_status') :
                               measurement.status === 'reviewed' ? i18n.t('pages.medical_diagnosis.reviewed_status') : i18n.t('pages.medical_diagnosis.processed_status')}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-1/12">
                            <Button
                              size="sm"
                              onClick={() => handleDiagnose(measurement)}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs px-2 py-1"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {i18n.t('pages.medical_diagnosis.view_details')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 