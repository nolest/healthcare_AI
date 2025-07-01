import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { 
  FileText, 
  User, 
  Activity, 
  Heart, 
  Thermometer, 
  Droplets,
  Save,
  ArrowLeft,
  AlertTriangle,
  Stethoscope,
  Calendar,
  Clock,
  Image,
  Eye,
  History,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import MedicalHeader from '../components/ui/MedicalHeader.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Button } from '../components/ui/button.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { Textarea } from '../components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { Alert, AlertDescription } from '../components/ui/alert.jsx'
import { Separator } from '../components/ui/separator.jsx'
import ImageViewer from '../components/ImageViewer.jsx'
import apiService from '../services/api.js'

export default function MedicalDiagnosisFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [currentUser, setCurrentUser] = useState(null)
  const [measurementData, setMeasurementData] = useState(null)
  const [patientInfo, setPatientInfo] = useState(null)
  const [patientHistory, setPatientHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // 图片查看器状态
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [currentImages, setCurrentImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentUserId, setCurrentUserId] = useState(null)
  
  // 诊断表单数据
  const [diagnosisForm, setDiagnosisForm] = useState({
    diagnosis: '',
    riskLevel: '',
    recommendations: {
      medications: '',
      lifestyle: '',
      followUp: '',
      nextCheckup: ''
    },
    notes: '',
    treatmentPlan: ''
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

    // 从URL参数获取测量记录ID
    const measurementId = searchParams.get('mid')
    
    if (measurementId) {
      // 通过ID获取测量记录
      loadMeasurementById(measurementId)
    } else if (location.state && location.state.measurementData) {
      // 从state获取传递的测量数据（保持向后兼容）
      setMeasurementData(location.state.measurementData)
      setPatientInfo(location.state.patientInfo)
      
      // 正确处理userId，确保传递字符串ID而不是对象
      const measurementData = location.state.measurementData
      const userId = typeof measurementData.userId === 'string' ? measurementData.userId : measurementData.userId?._id
      setCurrentUserId(userId)
      loadPatientHistory(userId)
    } else {
      // 如果没有传递数据，返回诊断列表
      navigate('/medical/diagnosis')
    }
  }, [navigate, location, searchParams])

  // 通过ID加载测量记录
  const loadMeasurementById = async (measurementId) => {
    setLoading(true)
    try {
      console.log('loadMeasurementById: 正在获取测量记录, measurementId:', measurementId)
      // 获取所有异常测量记录，然后找到指定的记录
      const response = await apiService.getAbnormalMeasurements()
      if (response.success && response.data) {
        const measurement = response.data.find(m => m._id === measurementId)
        if (measurement) {
          console.log('loadMeasurementById: 找到测量记录:', measurement)
          setMeasurementData(measurement)
          
          // 获取患者信息
          const userId = typeof measurement.userId === 'string' ? measurement.userId : measurement.userId._id
          console.log('loadMeasurementById: 提取的userId:', userId, '类型:', typeof userId)
          setCurrentUserId(userId)
          
          // 如果userId是对象，直接使用其中的用户信息
          if (typeof measurement.userId === 'object' && measurement.userId) {
            console.log('loadMeasurementById: userId是对象，直接使用用户信息')
            setPatientInfo(measurement.userId)
          } else {
            // 否则通过API获取用户信息
            console.log('loadMeasurementById: userId是字符串，通过API获取用户信息')
            try {
              const userResponse = await apiService.getUserById(userId)
              if (userResponse.success) {
                setPatientInfo(userResponse.data)
              }
            } catch (error) {
              console.error('获取患者信息失败:', error)
            }
          }
          
          // 加载患者历史记录
          loadPatientHistory(userId)
        } else {
          setMessage('❌ 未找到指定的测量记录')
          setTimeout(() => navigate('/medical/diagnosis'), 2000)
        }
      }
    } catch (error) {
      console.error('加载测量记录失败:', error)
      setMessage('❌ 加载测量记录失败')
      setTimeout(() => navigate('/medical/diagnosis'), 2000)
    } finally {
      setLoading(false)
    }
  }

  // 加载患者历史测量记录
  const loadPatientHistory = async (userId) => {
    // 验证userId是否为有效字符串
    if (!userId || typeof userId !== 'string') {
      console.error('loadPatientHistory: 无效的userId:', userId)
      setHistoryLoading(false)
      return
    }
    
    setHistoryLoading(true)
    try {
      console.log('loadPatientHistory: 正在获取用户历史记录, userId:', userId)
      const response = await apiService.getUserMeasurements(userId)
      if (response.success && response.data) {
        // 按时间倒序排列
        const sortedHistory = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        setPatientHistory(sortedHistory)
        console.log('loadPatientHistory: 成功获取', sortedHistory.length, '条历史记录')
      }
    } catch (error) {
      console.error('加载患者历史记录失败:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  // 打开图片查看器
  const openImageViewer = (images, index = 0, userId) => {
    setCurrentImages(images)
    setCurrentImageIndex(index)
    setCurrentUserId(userId)
    setImageViewerOpen(true)
  }

  // 获取测量记录的趋势图标
  const getTrendIcon = (current, previous) => {
    if (!previous) return <Minus className="h-4 w-4 text-gray-400" />
    
    const currentValue = getMeasurementNumericValue(current)
    const previousValue = getMeasurementNumericValue(previous)
    
    if (currentValue > previousValue) {
      return <TrendingUp className="h-4 w-4 text-red-500" />
    } else if (currentValue < previousValue) {
      return <TrendingDown className="h-4 w-4 text-green-500" />
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  // 获取测量值的数值（用于比较趋势）
  const getMeasurementNumericValue = (measurement) => {
    const type = getMeasurementType(measurement)
    switch (type) {
      case 'blood_pressure':
        return measurement.systolic // 使用收缩压作为主要比较值
      case 'heart_rate':
        return measurement.heartRate
      case 'temperature':
        return parseFloat(measurement.temperature)
      case 'oxygen_saturation':
        return measurement.oxygenSaturation
      default:
        return 0
    }
  }

  // 判断测量值是否异常
  const isAbnormalMeasurement = (measurement) => {
    const type = getMeasurementType(measurement)
    switch (type) {
      case 'blood_pressure':
        return measurement.systolic > 140 || measurement.diastolic > 90 || 
               measurement.systolic < 90 || measurement.diastolic < 60
      case 'heart_rate':
        return measurement.heartRate > 100 || measurement.heartRate < 60
      case 'temperature':
        return measurement.temperature > 37.5 || measurement.temperature < 36
      case 'oxygen_saturation':
        return measurement.oxygenSaturation < 95
      default:
        return false
    }
  }

  // 获取时间差显示
  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now - time
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      return `${diffDays}天前`
    } else if (diffHours > 0) {
      return `${diffHours}小時前`
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes}分鐘前`
    }
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
      blood_pressure: '血壓',
      heart_rate: '心率',
      temperature: '體溫',
      oxygen_saturation: '血氧',
      unknown: '未知'
    }
    return labels[type] || '未知'
  }

  const getMeasurementTypeIcon = (type) => {
    switch (type) {
      case 'blood_pressure':
        return <Activity className="h-5 w-5 text-red-600" />
      case 'heart_rate':
        return <Heart className="h-5 w-5 text-pink-600" />
      case 'temperature':
        return <Thermometer className="h-5 w-5 text-orange-600" />
      case 'oxygen_saturation':
        return <Droplets className="h-5 w-5 text-blue-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
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
        return '未知'
    }
  }

  const getAbnormalReason = (measurement) => {
    const type = getMeasurementType(measurement)
    switch (type) {
      case 'blood_pressure':
        if (measurement.systolic > 140 || measurement.diastolic > 90) {
          return '高血壓'
        } else if (measurement.systolic < 90 || measurement.diastolic < 60) {
          return '低血壓'
        }
        break
      case 'heart_rate':
        if (measurement.heartRate > 100) {
          return '心動過速'
        } else if (measurement.heartRate < 60) {
          return '心動過緩'
        }
        break
      case 'temperature':
        if (measurement.temperature > 37.5) {
          return '發燒'
        } else if (measurement.temperature < 36) {
          return '體溫過低'
        }
        break
      case 'oxygen_saturation':
        if (measurement.oxygenSaturation < 95) {
          return '血氧不足'
        }
        break
    }
    return '異常值'
  }

  const formatDate = (dateString) => {
    if (!dateString) return '未知時間'
    const date = new Date(dateString)
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSubmitDiagnosis = async () => {
    if (!diagnosisForm.diagnosis.trim()) {
      setMessage('請輸入診斷結果')
      return
    }

    if (!diagnosisForm.riskLevel) {
      setMessage('請選擇風險等級')
      return
    }

    setLoading(true)
    try {
      // 准备诊断数据
      const diagnosisData = {
        patientId: measurementData.userId,
        measurementId: measurementData._id,
        diagnosis: diagnosisForm.diagnosis,
        riskLevel: diagnosisForm.riskLevel,
        recommendations: diagnosisForm.recommendations,
        notes: diagnosisForm.notes,
        treatmentPlan: diagnosisForm.treatmentPlan,
        doctorId: currentUser._id,
        doctorName: currentUser.fullName || currentUser.username
      }

      // 提交诊断报告
      const response = await apiService.createDiagnosisReport(diagnosisData)
      
      if (response.success) {
        // 更新测量状态为已处理
        await apiService.updateMeasurementStatus(measurementData._id, 'processed', true)
        
        setMessage('✅ 診斷報告已成功提交！')
        
        // 3秒后返回诊断列表
        setTimeout(() => {
          navigate('/medical/diagnosis')
        }, 3000)
      } else {
        setMessage('❌ 提交診斷報告失敗，請重試')
      }
    } catch (error) {
      console.error('提交诊断失败:', error)
      setMessage('❌ 提交診斷報告失敗，請重試')
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser || !measurementData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  const measurementType = getMeasurementType(measurementData)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <MedicalHeader 
        title="診斷評估"
        subtitle="為患者異常測量數據提供專業診斷"
        icon={Stethoscope}
        showBackButton={true}
        user={currentUser}
        onBack={() => navigate('/medical/diagnosis')}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 relative z-10">
        
        {/* 患者和测量信息 */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-blue-500/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                患者異常測量信息
              </CardTitle>
              <CardDescription className="text-gray-600">
                請基於以下異常測量數據提供專業診斷建議
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 患者信息 */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    患者信息
                  </h4>
                  <div className="bg-blue-50/70 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">姓名:</span>
                      <span className="font-medium">{patientInfo?.fullName || patientInfo?.username || '未知患者'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">患者ID:</span>
                      <span className="font-mono text-sm">{(typeof measurementData.userId === 'string' ? measurementData.userId : measurementData.userId?._id || '').slice(-8)}</span>
                    </div>
                    {patientInfo?.gender && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">性別:</span>
                        <Badge variant="outline">
                          {patientInfo.gender === 'male' ? '男' : patientInfo.gender === 'female' ? '女' : '未知'}
                        </Badge>
                      </div>
                    )}
                    {patientInfo?.age && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">年齡:</span>
                        <Badge variant="outline">{patientInfo.age}歲</Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* 异常测量数据 */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    {getMeasurementTypeIcon(measurementType)}
                    異常測量數據
                  </h4>
                  <div className="bg-red-50/70 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">測量類型:</span>
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        {getMeasurementTypeLabel(measurementType)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">異常值:</span>
                      <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                        {getMeasurementValue(measurementData)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">異常原因:</span>
                      <span className="text-red-600 font-medium">{getAbnormalReason(measurementData)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">測量時間:</span>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(measurementData.timestamp)}
                      </div>
                    </div>
                    {measurementData.notes && (
                      <div className="pt-2 border-t border-red-200">
                        <span className="text-gray-600 text-sm">備註: {measurementData.notes}</span>
                      </div>
                    )}
                    
                    {/* 测量图片 */}
                    {measurementData.images && measurementData.images.length > 0 && (
                      <div className="pt-3 border-t border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Image className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-600 text-sm font-medium">測量圖片 ({measurementData.images.length}張)</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {measurementData.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={apiService.getImageUrl(currentUserId || (typeof measurementData.userId === 'string' ? measurementData.userId : measurementData.userId?._id), image.split('/').pop(), 'measurement')}
                                alt={`測量圖片 ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-lg border-2 border-red-200 cursor-pointer hover:border-red-400 transition-colors"
                                onClick={() => openImageViewer(measurementData.images, index, currentUserId || (typeof measurementData.userId === 'string' ? measurementData.userId : measurementData.userId?._id))}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                                <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 患者历史测量记录时间轴 */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-purple-500/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <History className="h-5 w-5 text-purple-600" />
                患者測量歷史記錄
              </CardTitle>
              <CardDescription className="text-gray-600">
                顯示該患者的歷史測量數據，幫助診斷判斷
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">載入歷史記錄中...</p>
                </div>
              ) : patientHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暫無歷史記錄</h3>
                  <p>該患者暫無其他測量記錄</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {patientHistory.map((record, index) => {
                    const isCurrentRecord = record._id === measurementData._id
                    const isAbnormal = isAbnormalMeasurement(record)
                    const previousRecord = patientHistory[index + 1]
                    
                    return (
                      <div key={record._id} className={`relative flex items-start space-x-4 p-4 rounded-xl transition-all ${
                        isCurrentRecord 
                          ? 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 shadow-lg' 
                          : isAbnormal 
                            ? 'bg-orange-50/70 border border-orange-200' 
                            : 'bg-green-50/70 border border-green-200'
                      }`}>
                        {/* 时间轴线条 */}
                        {index < patientHistory.length - 1 && (
                          <div className="absolute left-6 top-12 w-px h-8 bg-gradient-to-b from-gray-300 to-transparent"></div>
                        )}
                        
                        {/* 时间轴点 */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          isCurrentRecord 
                            ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg' 
                            : isAbnormal 
                              ? 'bg-gradient-to-br from-orange-400 to-red-400 text-white' 
                              : 'bg-gradient-to-br from-green-400 to-emerald-400 text-white'
                        }`}>
                          {getMeasurementTypeIcon(getMeasurementType(record))}
                        </div>
                        
                        {/* 记录内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-semibold ${isCurrentRecord ? 'text-red-700' : 'text-gray-800'}`}>
                                {getMeasurementTypeLabel(getMeasurementType(record))}
                              </h4>
                              {isCurrentRecord && (
                                <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                                  當前異常記錄
                                </Badge>
                              )}
                              {isAbnormal && !isCurrentRecord && (
                                <Badge variant="destructive" className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                                  異常
                                </Badge>
                              )}
                              {getTrendIcon(record, previousRecord)}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getTimeAgo(record.timestamp)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(record.timestamp)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Badge variant={isAbnormal ? "destructive" : "secondary"} className={
                                isAbnormal 
                                  ? "bg-red-100 text-red-700 border-red-200" 
                                  : "bg-green-100 text-green-700 border-green-200"
                              }>
                                {getMeasurementValue(record)}
                              </Badge>
                              
                              {record.notes && (
                                <span className="text-sm text-gray-600 truncate">
                                  📝 {record.notes}
                                </span>
                              )}
                            </div>
                            
                            {/* 图片缩略图 */}
                            {record.images && record.images.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Image className="h-4 w-4 text-gray-500" />
                                <span className="text-xs text-gray-500">{record.images.length}張</span>
                                <div className="flex gap-1 ml-2">
                                  {record.images.slice(0, 3).map((image, imgIndex) => (
                                    <img
                                      key={imgIndex}
                                      src={apiService.getImageUrl(currentUserId || (typeof record.userId === 'string' ? record.userId : record.userId?._id), image.split('/').pop(), 'measurement')}
                                      alt={`縮略圖 ${imgIndex + 1}`}
                                      className="w-8 h-8 object-cover rounded border cursor-pointer hover:border-blue-400 transition-colors"
                                      onClick={() => openImageViewer(record.images, imgIndex, currentUserId || (typeof record.userId === 'string' ? record.userId : record.userId?._id))}
                                    />
                                  ))}
                                  {record.images.length > 3 && (
                                    <div className="w-8 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-600">
                                      +{record.images.length - 3}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 诊断表单 */}
        <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-green-500/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-green-600" />
              診斷評估表單
            </CardTitle>
            <CardDescription className="text-gray-600">
              請提供專業的診斷結果和治療建議
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* 诊断结果 */}
            <div className="space-y-2">
              <Label htmlFor="diagnosis" className="text-sm font-medium text-gray-700">
                診斷結果 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="diagnosis"
                placeholder="請輸入詳細的診斷結果..."
                className="bg-white/70 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                rows={4}
                value={diagnosisForm.diagnosis}
                onChange={(e) => setDiagnosisForm(prev => ({ ...prev, diagnosis: e.target.value }))}
              />
            </div>

            {/* 风险等级 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                風險等級 <span className="text-red-500">*</span>
              </Label>
              <Select value={diagnosisForm.riskLevel} onValueChange={(value) => setDiagnosisForm(prev => ({ ...prev, riskLevel: value }))}>
                <SelectTrigger className="bg-white/70 border-green-200 focus:border-green-400">
                  <SelectValue placeholder="選擇風險等級" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低風險</SelectItem>
                  <SelectItem value="medium">中風險</SelectItem>
                  <SelectItem value="high">高風險</SelectItem>
                  <SelectItem value="critical">緊急</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 治疗建议 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="medications" className="text-sm font-medium text-gray-700">用藥建議</Label>
                <Textarea
                  id="medications"
                  placeholder="請輸入用藥建議..."
                  className="bg-white/70 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                  rows={3}
                  value={diagnosisForm.recommendations.medications}
                  onChange={(e) => setDiagnosisForm(prev => ({ 
                    ...prev, 
                    recommendations: { ...prev.recommendations, medications: e.target.value }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lifestyle" className="text-sm font-medium text-gray-700">生活方式建議</Label>
                <Textarea
                  id="lifestyle"
                  placeholder="請輸入生活方式建議..."
                  className="bg-white/70 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                  rows={3}
                  value={diagnosisForm.recommendations.lifestyle}
                  onChange={(e) => setDiagnosisForm(prev => ({ 
                    ...prev, 
                    recommendations: { ...prev.recommendations, lifestyle: e.target.value }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="followUp" className="text-sm font-medium text-gray-700">隨訪建議</Label>
                <Textarea
                  id="followUp"
                  placeholder="請輸入隨訪建議..."
                  className="bg-white/70 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                  rows={3}
                  value={diagnosisForm.recommendations.followUp}
                  onChange={(e) => setDiagnosisForm(prev => ({ 
                    ...prev, 
                    recommendations: { ...prev.recommendations, followUp: e.target.value }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextCheckup" className="text-sm font-medium text-gray-700">下次檢查時間</Label>
                <Input
                  id="nextCheckup"
                  type="date"
                  className="bg-white/70 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                  value={diagnosisForm.recommendations.nextCheckup}
                  onChange={(e) => setDiagnosisForm(prev => ({ 
                    ...prev, 
                    recommendations: { ...prev.recommendations, nextCheckup: e.target.value }
                  }))}
                />
              </div>
            </div>

            {/* 治疗方案 */}
            <div className="space-y-2">
              <Label htmlFor="treatmentPlan" className="text-sm font-medium text-gray-700">治療方案</Label>
              <Textarea
                id="treatmentPlan"
                placeholder="請輸入詳細的治療方案..."
                className="bg-white/70 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                rows={4}
                value={diagnosisForm.treatmentPlan}
                onChange={(e) => setDiagnosisForm(prev => ({ ...prev, treatmentPlan: e.target.value }))}
              />
            </div>

            {/* 备注 */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">備註</Label>
              <Textarea
                id="notes"
                placeholder="請輸入其他備註信息..."
                className="bg-white/70 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                rows={3}
                value={diagnosisForm.notes}
                onChange={(e) => setDiagnosisForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSubmitDiagnosis}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? '提交中...' : '提交診斷報告'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/medical/diagnosis')}
                className="border-green-200 hover:bg-green-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回列表
              </Button>
            </div>

            {/* 状态消息 */}
            {message && (
              <Alert className={`${
                message.includes('✅') 
                  ? 'bg-gradient-to-br from-green-50/90 to-green-100/70 border-green-200 shadow-green-500/10' 
                  : 'bg-gradient-to-br from-red-50/90 to-red-100/70 border-red-200 shadow-red-500/10'
              } backdrop-blur-lg shadow-lg`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className={message.includes('✅') ? 'text-green-800' : 'text-red-800'}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

          </CardContent>
        </Card>
      </main>
      
      {/* 图片查看器 */}
      <ImageViewer
        images={currentImages}
        userId={currentUserId}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        initialIndex={currentImageIndex}
      />
    </div>
  )
} 