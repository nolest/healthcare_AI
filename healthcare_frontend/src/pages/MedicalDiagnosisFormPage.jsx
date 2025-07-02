import { useState, useEffect, useRef } from 'react'
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog.jsx'
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
  
  // 确认弹窗状态
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState(null)
  
  // 诊断表单数据
  const [diagnosis, setDiagnosis] = useState('')
  const [riskLevel, setRiskLevel] = useState('')
  const [medications, setMedications] = useState('')
  const [lifestyle, setLifestyle] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [notes, setNotes] = useState('')
  const [treatmentPlan, setTreatmentPlan] = useState('')

  // 用于动态高度调整的refs
  const diagnosisFormRef = useRef(null)
  const historyCardRef = useRef(null)

  // 动态调整高度的useEffect
  useEffect(() => {
    const adjustHeight = () => {
      if (diagnosisFormRef.current && historyCardRef.current) {
        const rect = diagnosisFormRef.current.getBoundingClientRect()
        const height = rect.height
        historyCardRef.current.style.height = `${height}px`
      }
    }

    // 延迟执行以确保DOM完全渲染
    const timer = setTimeout(adjustHeight, 100)

    // 监听窗口大小变化
    window.addEventListener('resize', adjustHeight)
    
    // 使用MutationObserver监听DOM变化
    const observer = new MutationObserver(() => {
      setTimeout(adjustHeight, 50)
    })
    
    if (diagnosisFormRef.current) {
      observer.observe(diagnosisFormRef.current, {
        childList: true,
        subtree: true,
        attributes: true
      })
    }

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', adjustHeight)
      observer.disconnect()
    }
  }, [measurementData, patientInfo, diagnosis, riskLevel, medications, lifestyle, followUp, notes, message])

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

  // 检查表单是否有数据
  const hasFormData = () => {
    return diagnosis.trim() || riskLevel || medications.trim() || lifestyle.trim() || followUp.trim() || notes.trim()
  }

  // 处理查看详情
  const handleViewDetails = (recordId) => {
    // 检查是否有表单数据
    if (hasFormData()) {
      // 有数据，显示确认弹窗
      setPendingNavigation(recordId)
      setConfirmDialogOpen(true)
    } else {
      // 没有数据，直接导航
      navigateToDetails(recordId)
    }
  }

  // 导航到详情页面
  const navigateToDetails = (recordId) => {
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // 导航到详情页面
    navigate(`/medical/diagnosis/form?mid=${recordId}`)
  }

  // 确认导航
  const confirmNavigation = () => {
    if (pendingNavigation) {
      // 清空表单数据
      setDiagnosis('')
      setRiskLevel('')
      setMedications('')
      setLifestyle('')
      setFollowUp('')
      setNotes('')
      setTreatmentPlan('')
      setMessage('')
      
      // 导航到详情页面
      navigateToDetails(pendingNavigation)
    }
    setConfirmDialogOpen(false)
    setPendingNavigation(null)
  }

  // 取消导航
  const cancelNavigation = () => {
    setConfirmDialogOpen(false)
    setPendingNavigation(null)
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
    if (!timestamp) return '未知时间'
    
    try {
      const now = new Date()
      const time = new Date(timestamp)
      
      // 检查时间是否有效
      if (isNaN(time.getTime())) {
        return '未知时间'
      }
      
      const diffMs = now - time
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffDays > 0) {
        return `${diffDays}天前`
      } else if (diffHours > 0) {
        return `${diffHours}小時前`
      } else if (diffMinutes > 0) {
        return `${diffMinutes}分鐘前`
      } else {
        return '剛剛'
      }
    } catch (error) {
      console.error('時間計算錯誤:', error, 'timestamp:', timestamp)
      return '未知時間'
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
        return <Activity className="h-4 w-4 text-white" />
      case 'heart_rate':
        return <Heart className="h-4 w-4 text-white" />
      case 'temperature':
        return <Thermometer className="h-4 w-4 text-white" />
      case 'oxygen_saturation':
        return <Droplets className="h-4 w-4 text-white" />
      default:
        return <Activity className="h-4 w-4 text-white" />
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
    
    try {
      const date = new Date(dateString)
      
      // 检查时间是否有效
      if (isNaN(date.getTime())) {
        return '未知時間'
      }
      
      // 格式化为 HH:MM:SS MM/DD/YYYY
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const year = date.getFullYear()
      
      return `${hours}:${minutes}:${seconds} ${month}/${day}/${year}`
    } catch (error) {
      console.error('日期格式化錯誤:', error, 'dateString:', dateString)
      return '未知時間'
    }
  }

  const handleSubmitDiagnosis = async () => {
    if (!diagnosis.trim()) {
      setMessage('請輸入診斷結果')
      return
    }

    if (!riskLevel) {
      setMessage('請選擇風險等級')
      return
    }

    setLoading(true)
    try {
      // 准备诊断数据
      const diagnosisData = {
        patientId: measurementData.userId,
        measurementId: measurementData._id,
        diagnosis: diagnosis,
        riskLevel: riskLevel,
        recommendations: {
          medications: medications,
          lifestyle: lifestyle,
          followUp: followUp,
          nextCheckup: ''
        },
        notes: notes,
        treatmentPlan: treatmentPlan,
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
        
        {/* 患者异常测量信息 */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-red-500/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                患者異常測量信息
              </CardTitle>
              <CardDescription className="text-gray-600">
                {patientInfo?.fullName || patientInfo?.username || '未知患者'} - {getMeasurementTypeLabel(measurementType)}異常
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 患者基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">患者姓名</p>
                      <p className="font-medium text-gray-800">{patientInfo?.fullName || patientInfo?.username || '未知患者'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">患者ID</p>
                      <p className="font-medium text-gray-800">{patientInfo?.username || '未知'}</p>
                    </div>
                  </div>
                </div>

                {/* 异常测量数据 */}
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    {getMeasurementTypeIcon(measurementType)}
                    <div>
                      <h3 className="font-semibold text-gray-800">{getMeasurementTypeLabel(measurementType)}異常</h3>
                      <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                        {getMeasurementValue(measurementData)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* 显示详细的异常原因列表 */}
                    {measurementData.abnormalReasons && measurementData.abnormalReasons.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-gray-600 text-sm font-medium">異常原因:</span>
                        <div className="space-y-2">
                          {measurementData.abnormalReasons.map((reason, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg shadow-sm">
                              <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-red-700 text-sm font-medium">{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">測量時間:</span>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(measurementData.createdAt || measurementData.timestamp)}
                      </div>
                    </div>
                    {measurementData.notes && (
                      <div className="pt-2 border-t border-red-200/50">
                        <span className="text-gray-600 text-sm">備註: {measurementData.notes}</span>
                      </div>
                    )}
                    
                    {/* 测量图片 */}
                    {measurementData.images && measurementData.images.length > 0 && (
                      <div className="pt-3 border-t border-red-200/50">
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

        {/* 左右分栏布局：患者历史记录 + 诊断表单 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {/* 患者历史测量记录 - 左侧 */}
          <div>
            <Card 
              ref={historyCardRef}
              className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-purple-500/10 flex flex-col"
            >
              <CardHeader className="pb-4 flex-shrink-0">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-600" />
                  患者測量歷史記錄
                  {patientHistory.length > 0 && (
                    <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
                      共 {patientHistory.length} 條記錄
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  顯示該患者的歷史測量數據，幫助診斷判斷
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
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
                  <div className="space-y-3 overflow-y-auto pr-2 pl-1 flex-1">
                    {patientHistory.map((record, index) => {
                      const isCurrentRecord = record._id === measurementData._id
                      const isAbnormal = isAbnormalMeasurement(record)
                      
                      return (
                        <div key={record._id} className={`p-3 rounded-lg transition-all ${
                          isCurrentRecord 
                            ? 'bg-gradient-to-r from-red-50 to-pink-50 shadow-md' 
                            : isAbnormal 
                              ? 'bg-gradient-to-r from-orange-50 to-red-50 shadow-sm' 
                              : 'bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm'
                        }`} style={{ border: 'none' }}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isCurrentRecord 
                                  ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-sm' 
                                  : isAbnormal 
                                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm' 
                                    : 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-sm'
                              }`}>
                                {getMeasurementTypeIcon(getMeasurementType(record))}
                              </div>
                              <div>
                                <h4 className={`font-medium text-sm ${isCurrentRecord ? 'text-red-700' : 'text-gray-800'}`}>
                                  {getMeasurementTypeLabel(getMeasurementType(record))}
                                </h4>
                                <div className="flex items-center gap-1 mt-1">
                                  {isCurrentRecord && (
                                    <Badge className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5">
                                      當前記錄
                                    </Badge>
                                  )}
                                  {isAbnormal && !isCurrentRecord && (
                                    <Badge variant="destructive" className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5">
                                      異常
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getTimeAgo(record.createdAt || record.timestamp)}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {formatDate(record.createdAt || record.timestamp)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Badge variant={isAbnormal ? "destructive" : "secondary"} className={`text-xs px-2 py-1 ${
                                isAbnormal 
                                  ? "bg-red-100 text-red-700 border-red-200" 
                                  : "bg-green-100 text-green-700 border-green-200"
                              }`}>
                                {getMeasurementValue(record)}
                              </Badge>
                              
                              {record.notes && (
                                <span className="text-xs text-gray-600 truncate max-w-32">
                                  📝 {record.notes}
                                </span>
                              )}
                            </div>
                            
                            {/* 图片缩略图 */}
                            {record.images && record.images.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Image className="h-3 w-3 text-gray-500" />
                                <span className="text-xs text-gray-500">{record.images.length}張</span>
                                <div className="flex gap-1 ml-1">
                                  {record.images.slice(0, 2).map((image, imgIndex) => (
                                    <img
                                      key={imgIndex}
                                      src={apiService.getImageUrl(currentUserId || (typeof record.userId === 'string' ? record.userId : record.userId?._id), image.split('/').pop(), 'measurement')}
                                      alt={`縮略圖 ${imgIndex + 1}`}
                                      className="w-6 h-6 object-cover rounded border cursor-pointer hover:border-blue-400 transition-colors"
                                      onClick={() => openImageViewer(record.images, imgIndex, currentUserId || (typeof record.userId === 'string' ? record.userId : record.userId?._id))}
                                    />
                                  ))}
                                  {record.images.length > 2 && (
                                    <div className="w-6 h-6 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-600">
                                      +{record.images.length - 2}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* 跳转按钮 */}
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`text-xs px-2 py-1 h-7 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner hover:shadow-md transition-all duration-300 ${
                                isCurrentRecord 
                                  ? 'text-red-600 hover:bg-red-50/80' 
                                  : 'text-gray-600 hover:bg-gray-50/80'
                              }`}
                              onClick={() => handleViewDetails(record._id)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {isCurrentRecord ? '當前記錄' : '查看詳情'}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 诊断表单 - 右侧 */}
          <div>
            <Card 
              ref={diagnosisFormRef}
              className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-green-500/10"
            >
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
                  <Label htmlFor="diagnosis" className="text-sm font-medium text-gray-700">診斷結果 *</Label>
                  <Textarea
                    id="diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="請輸入詳細的診斷結果和分析..."
                    className="min-h-[120px] bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                    required
                  />
                </div>

                {/* 风险等级 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    風險等級 <span className="text-red-500">*</span>
                  </Label>
                  <Select value={riskLevel} onValueChange={(value) => setRiskLevel(value)}>
                    <SelectTrigger className="bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300">
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
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="medications" className="text-sm font-medium text-gray-700">用藥建議</Label>
                    <Textarea
                      id="medications"
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                      placeholder="請輸入推薦的藥物治療方案..."
                      className="min-h-[80px] bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lifestyle" className="text-sm font-medium text-gray-700">生活方式建議</Label>
                    <Textarea
                      id="lifestyle"
                      value={lifestyle}
                      onChange={(e) => setLifestyle(e.target.value)}
                      placeholder="請輸入生活方式調整建議..."
                      className="min-h-[80px] bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                    />
                  </div>
                </div>

                {/* 复查建议 */}
                <div className="space-y-2">
                  <Label htmlFor="followUp" className="text-sm font-medium text-gray-700">復查建議</Label>
                  <Textarea
                    id="followUp"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    placeholder="請輸入復查時間和注意事項..."
                    className="min-h-[80px] bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                  />
                </div>

                {/* 其他备注 */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">其他備註</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="請輸入其他需要注意的事項..."
                    className="min-h-[80px] bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                  />
                </div>

                {/* 提交按钮 */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleSubmitDiagnosis}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        提交中...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        提交診斷報告
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/medical/diagnosis')}
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    返回列表
                  </Button>
                </div>

                {/* 消息提示 */}
                {message && (
                  <Alert className={`mt-4 ${message.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <AlertDescription className={message.includes('✅') ? 'text-green-700' : 'text-red-700'}>
                      {message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* 图片查看器 */}
      <ImageViewer
        images={currentImages}
        userId={currentUserId}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        initialIndex={currentImageIndex}
      />

      {/* 确认弹窗 */}
      <Dialog open={confirmDialogOpen} onOpenChange={cancelNavigation}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>確認導航</DialogTitle>
            <DialogDescription>
              您確定要導航到詳情頁面嗎？
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-4">
            <Button variant="outline" onClick={cancelNavigation}>取消</Button>
            <Button variant="default" onClick={confirmNavigation}>確認</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}