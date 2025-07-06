import React, { useState, useEffect, useRef } from 'react'
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
import ImagePreview from '../components/ui/ImagePreview.jsx'
import apiService from '../services/api.js'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import i18n from '../utils/i18n.js'

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
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())
  
  // 图片查看器状态
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [currentImages, setCurrentImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentUserId, setCurrentUserId] = useState(null)
  
  // 新图片预览组件状态
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [previewImages, setPreviewImages] = useState([])
  const [previewInitialIndex, setPreviewInitialIndex] = useState(0)
  
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
  
  // 只读状态 - 当查看已处理的记录时为true
  const [isReadOnly, setIsReadOnly] = useState(false)
  
  // 已有诊断数据状态
  const [existingDiagnosis, setExistingDiagnosis] = useState(null)
  
  // 从URL参数获取hasread状态
  const hasRead = searchParams.get('hasread')

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

    setCurrentUser(userData)

    // 从URL参数获取测量记录ID和只读状态
    const measurementId = searchParams.get('mid')
    const hasReadParam = searchParams.get('hasread')
    
    console.log('初始化参数:', { measurementId, hasReadParam })
    
    // 根据hasread参数设置初始只读状态
    if (hasReadParam === '1') {
      setIsReadOnly(true)
      console.log('根据hasread=1参数设置为只读模式')
    } else if (hasReadParam === '0') {
      setIsReadOnly(false)
      console.log('根据hasread=0参数设置为编辑模式')
    } else {
      // 如果没有hasread参数，默认为编辑模式
      setIsReadOnly(false)
      console.log('没有hasread参数，默认设置为编辑模式')
    }
    
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
    const hasReadParam = new URLSearchParams(window.location.search).get('hasread')
    console.log('loadMeasurementById: 参数检查', { measurementId, hasReadParam })
    
    try {
      console.log('loadMeasurementById: 正在获取测量记录, measurementId:', measurementId)
      
      // 首先尝试获取所有异常测量记录
      let measurement = null
      try {
        const response = await apiService.getAbnormalMeasurements()
        console.log('loadMeasurementById: 异常测量记录API响应:', response)
        
        if (response.success && response.data) {
          measurement = response.data.find(m => m._id === measurementId)
          console.log('loadMeasurementById: 在异常记录中查找结果:', measurement ? '找到' : '未找到')
        }
      } catch (error) {
        console.error('loadMeasurementById: 获取异常测量记录失败:', error)
      }
      
      // 如果在异常记录中没找到，尝试获取所有测量记录
      if (!measurement) {
        try {
          console.log('loadMeasurementById: 在异常记录中未找到，尝试获取所有测量记录')
          const allMeasurementsResponse = await apiService.getAllMeasurements()
          console.log('loadMeasurementById: 所有测量记录API响应:', allMeasurementsResponse)
          
          if (allMeasurementsResponse.success && allMeasurementsResponse.data) {
            measurement = allMeasurementsResponse.data.find(m => m._id === measurementId)
            console.log('loadMeasurementById: 在所有记录中查找结果:', measurement ? '找到' : '未找到')
          }
        } catch (error) {
          console.error('loadMeasurementById: 获取所有测量记录失败:', error)
        }
      }
      
      if (measurement) {
          console.log('loadMeasurementById: 找到测量记录:', measurement)
          setMeasurementData(measurement)
          
          // 检查测量记录状态，如果已处理则设置为只读模式
          // 但如果URL参数中有hasread=1，则优先使用URL参数
          const hasReadParam = new URLSearchParams(window.location.search).get('hasread')
          if (hasReadParam === '1') {
            setIsReadOnly(true)
            console.log('loadMeasurementById: 根据hasread=1参数设置为只读模式')
          } else if (hasReadParam === '0') {
            setIsReadOnly(false)
            console.log('loadMeasurementById: 根据hasread=0参数设置为编辑模式')
          } else if (measurement.status === 'processed' || measurement.status === 'reviewed') {
            setIsReadOnly(true)
            console.log('loadMeasurementById: 测量记录已处理，设置为只读模式')
          } else {
            setIsReadOnly(false)
            console.log('loadMeasurementById: 测量记录待处理，设置为编辑模式')
          }
          
          // 安全地获取患者信息 - 修复userId提取逻辑
          let userId = null
          let userInfo = null
          
          if (typeof measurement.userId === 'string') {
            // userId是字符串ID
            userId = measurement.userId
            console.log('loadMeasurementById: userId是字符串:', userId)
          } else if (measurement.userId && typeof measurement.userId === 'object') {
            // userId是用户对象
            userId = measurement.userId._id
            userInfo = measurement.userId
            console.log('loadMeasurementById: userId是对象:', userId, userInfo)
          }
          
          if (!userId) {
            console.error('loadMeasurementById: 无法提取有效的userId')
            setMessage('❌ 測量記錄缺少有效的用戶信息')
            if (hasReadParam !== '1') {
              setTimeout(() => navigate('/medical/diagnosis'), 2000)
            }
            return
          }
          
          console.log('loadMeasurementById: 最终提取的userId:', userId, '类型:', typeof userId)
          setCurrentUserId(userId)
          
          // 设置患者信息
          if (userInfo) {
            // 如果userId是对象，直接使用其中的用户信息
            console.log('loadMeasurementById: 使用对象中的用户信息')
            setPatientInfo(userInfo)
          } else {
            // 否则通过API获取用户信息
            console.log('loadMeasurementById: 通过API获取用户信息')
            try {
              const userResponse = await apiService.getUserById(userId)
              if (userResponse.success) {
                setPatientInfo(userResponse.data)
              } else {
                console.error('获取患者信息失败:', userResponse)
              }
            } catch (error) {
              console.error('获取患者信息失败:', error)
            }
          }
          
          // 加载患者历史记录
          loadPatientHistory(userId)
          
          // 如果是只读模式，加载已有的诊断记录
          const currentHasReadParam = new URLSearchParams(window.location.search).get('hasread')
          if (currentHasReadParam === '1') {
            console.log('loadMeasurementById: 只读模式，开始加载已有诊断记录')
            // 使用setTimeout确保状态更新完成后再加载诊断
            setTimeout(() => {
              loadExistingDiagnosis(measurementId)
            }, 100)
          }
        } else {
          console.log('loadMeasurementById: 未找到指定的测量记录')
          setMessage('❌ 未找到指定的测量记录')
          // 如果是只读模式，不要重定向，让用户看到错误信息
          if (hasReadParam !== '1') {
            setTimeout(() => navigate('/medical/diagnosis'), 2000)
          }
        }
          } catch (error) {
        console.error('加载测量记录失败:', error)
        setMessage('❌ 加载测量记录失败')
        if (hasReadParam !== '1') {
          setTimeout(() => navigate('/medical/diagnosis'), 2000)
        }
      } finally {
        setLoading(false)
      }
  }

  // 加载已有的诊断记录
  const loadExistingDiagnosis = async (measurementId) => {
    try {
      console.log('🔍 加载已有诊断记录, measurementId:', measurementId)
      const response = await apiService.getMeasurementDiagnosisByMeasurement(measurementId)
      console.log('📡 API响应:', response)
      
      // 检查响应格式，支持多种格式
      let diagnosisData = null
      
      if (response && response.success && response.data) {
        // 格式: { success: true, data: diagnosisData }
        diagnosisData = response.data
        console.log('✅ 找到已有诊断记录 (包装格式):', diagnosisData)
      } else if (response && Array.isArray(response) && response.length > 0) {
        // 格式: [diagnosisData]
        diagnosisData = response[0]
        console.log('✅ 找到已有诊断记录 (数组格式):', diagnosisData)
      } else if (response && response._id) {
        // 格式: 直接返回诊断对象
        diagnosisData = response
        console.log('✅ 找到已有诊断记录 (直接对象):', diagnosisData)
      }
      
      if (diagnosisData) {
        setExistingDiagnosis(diagnosisData)
        
        // 将诊断数据填充到表单字段中（只读模式下显示）
        setDiagnosis(diagnosisData.diagnosis || '')
        setRiskLevel(diagnosisData.riskLevel || '')
        setMedications(diagnosisData.medications || '')
        setLifestyle(diagnosisData.lifestyle || '')
        setFollowUp(diagnosisData.followUp || '')
        setNotes(diagnosisData.notes || '')
        setTreatmentPlan(diagnosisData.treatmentPlan || '')
        
        console.log('📋 诊断数据已填充:', {
          diagnosis: diagnosisData.diagnosis,
          riskLevel: diagnosisData.riskLevel,
          medications: diagnosisData.medications,
          lifestyle: diagnosisData.lifestyle,
          followUp: diagnosisData.followUp,
          notes: diagnosisData.notes
        })
      } else {
        console.log('⚠️ 未找到已有诊断记录')
        setExistingDiagnosis(null)
      }
    } catch (error) {
      console.error('❌ 加载已有诊断记录失败:', error)
      setExistingDiagnosis(null)
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
        const sortedHistory = response.data.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp))
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

  // 打开新的图片预览组件
  const openImagePreview = (images, index = 0) => {
    // 确保images是字符串数组
    const imageUrls = images.map(img => {
      if (typeof img === 'string') {
        return img
      }
      // 如果是图片对象，构建完整URL
      return apiService.getFullImageUrl('measurement', currentUserId, img)
    })
    
    setPreviewImages(imageUrls)
    setPreviewInitialIndex(index)
    setImagePreviewOpen(true)
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
    // 找到对应的记录，根据状态设置hasread参数
    const record = patientHistory.find(r => r._id === recordId)
    let hasRead = '0' // 默认为编辑模式
    
    if (record && (record.status === 'processed' || record.status === 'reviewed')) {
      hasRead = '1' // 已处理记录设置为只读模式
    }
    
    // 在新标签页打开详情页面
    const url = `/medical/diagnosis/form?mid=${recordId}&hasread=${hasRead}`
    window.open(url, '_blank')
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

  // 获取状态标签
  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': '待處理',
      'processing': '處理中',
      'processed': '已處理',
      'reviewed': '已審核',
      'completed': '已完成',
      'cancelled': '已取消',
      'failed': '處理失敗'
    }
    return statusMap[status] || status || '未知狀態'
  }

  // 获取状态样式
  const getStatusStyle = (status, isCurrentRecord, isAbnormal) => {
    // 如果是 processed 状态，使用灰白样式
    if (status === 'processed') {
      return {
        background: 'bg-gradient-to-r from-gray-100 to-gray-200',
        iconBg: 'bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-sm',
        textColor: 'text-gray-600'
      }
    }
    
    // 当前记录样式
    if (isCurrentRecord) {
      return {
        background: 'bg-gradient-to-r from-red-50 to-pink-50 shadow-md',
        iconBg: 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-sm',
        textColor: 'text-red-700'
      }
    }
    
    // 异常记录样式
    if (isAbnormal) {
      return {
        background: 'bg-gradient-to-r from-orange-50 to-red-50 shadow-sm',
        iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm',
        textColor: 'text-gray-800'
      }
    }
    
    // 正常记录样式
    return {
      background: 'bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-sm',
      textColor: 'text-gray-800'
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
        return i18n.t('pages.medical_diagnosis_form.unknown_time')
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
      return i18n.t('pages.medical_diagnosis_form.unknown_time')
    }
  }

  const handleSubmitDiagnosis = async () => {
    if (!diagnosis.trim()) {
      setMessage(i18n.t('pages.medical_diagnosis_form.enter_diagnosis'))
      return
    }

    if (!riskLevel) {
      setMessage(i18n.t('pages.medical_diagnosis_form.select_risk'))
      return
    }

    setLoading(true)
    try {
      // 映射风险等级值
      const urgencyMapping = {
        'low': 'low',
        'medium': 'medium', 
        'high': 'high',
        'critical': 'urgent'
      }

      // 关键修复：确保patientId和sourceId的用户ID匹配
      // 我们应该使用测量记录关联的用户ID作为患者ID
      const measurementUserId = typeof measurementData.userId === 'string' 
        ? measurementData.userId 
        : measurementData.userId?._id

      console.log('🔍 诊断提交详细信息:')
      console.log('测量记录数据:', measurementData)
      console.log('测量记录userId:', measurementData.userId)
      console.log('提取的测量用户ID:', measurementUserId)
      console.log('测量记录ID (sourceId):', measurementData._id)
      console.log('当前患者信息:', patientInfo)

      // 验证数据完整性
      if (!measurementUserId) {
        console.error('❌ 測量記錄缺少用戶信息')
        setMessage(i18n.t('pages.medical_diagnosis_form.missing_user_info'))
        return
      }

      if (!measurementData._id) {
        console.error('❌ 測量記錄ID缺失')
        setMessage(i18n.t('pages.medical_diagnosis_form.missing_measurement_id'))
        return
      }

      // 准备诊断数据 - 符合新的measurement-diagnoses DTO格式
      const diagnosisData = {
        patientId: measurementUserId,  // 使用测量记录的userId
        measurementId: measurementData._id,  // 测量记录的ID
        diagnosis: diagnosis,
        riskLevel: riskLevel,
        medications: medications || '',
        lifestyle: lifestyle || '',
        followUp: followUp || '',
        treatmentPlan: `${medications || ''}${lifestyle ? '\n\n' + lifestyle : ''}`,
        notes: notes || ''
      }

      console.log('📋 提交诊断数据:', JSON.stringify(diagnosisData, null, 2))

      // 提交测量诊断
      const response = await apiService.createMeasurementDiagnosis(diagnosisData)
      
      console.log('📡 API响应:', response)
      
      if (response && (response.success !== false)) {
        console.log('✅ 诊断报告提交成功')
        
        // 更新测量状态为已处理
        try {
          await apiService.updateMeasurementStatus(measurementData._id, 'processed', true)
          console.log('✅ 测量状态更新成功')
        } catch (updateError) {
          console.warn('⚠️ 测量状态更新失败:', updateError)
        }
        
        setMessage(i18n.t('pages.medical_diagnosis_form.diagnosis_submitted'))
        
        // 3秒后返回诊断列表
        setTimeout(() => {
          navigate('/medical/diagnosis')
        }, 3000)
      } else {
        console.error('❌ 提交測量診斷失敗:', response)
        setMessage(i18n.t('pages.medical_diagnosis_form.submit_failed'))
      }
    } catch (error) {
      console.error('❌ 提交诊断失败:', error)
      
      let errorMessage = i18n.t('pages.medical_diagnosis_form.submit_failed')
      
      if (error.response) {
        // 服务器响应了错误状态码
        console.error('HTTP状态码:', error.response.status)
        console.error('响应头:', error.response.headers)
        console.error('响应数据:', error.response.data)
        
        if (error.response.data && error.response.data.message) {
          errorMessage = `❌ 提交失敗: ${error.response.data.message}`
        } else if (error.response.status === 500) {
          errorMessage = i18n.t('pages.medical_diagnosis_form.server_error')
        } else if (error.response.status === 400) {
          errorMessage = i18n.t('pages.medical_diagnosis_form.data_format_error')
        } else if (error.response.status === 401) {
          errorMessage = i18n.t('pages.medical_diagnosis_form.auth_failed')
        } else if (error.response.status === 403) {
          errorMessage = i18n.t('pages.medical_diagnosis_form.permission_denied')
        }
      } else if (error.request) {
        // 请求已发出，但没有收到响应
        console.error('请求已发出但无响应:', error.request)
        errorMessage = i18n.t('pages.medical_diagnosis_form.network_error')
      } else {
        // 在设置请求时发生了错误
        console.error('请求设置错误:', error.message)
        errorMessage = `❌ 請求錯誤: ${error.message}`
      }
      
      setMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser || !measurementData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{i18n.t('common.loading')}</p>
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
        title={i18n.t('pages.medical_diagnosis_form.title')}
        subtitle={i18n.t('pages.medical_diagnosis_form.subtitle')}
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
                {i18n.t('pages.medical_diagnosis_form.patient_abnormal_measurement_info')}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {patientInfo?.fullName || patientInfo?.username || i18n.t('pages.medical_diagnosis_form.unknown_patient')} - {getMeasurementTypeLabel(measurementType)}{i18n.t('pages.medical_diagnosis_form.abnormal')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 患者基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">{i18n.t('pages.medical_diagnosis_form.patient_name')}</p>
                      <p className="font-medium text-gray-800">{patientInfo?.fullName || patientInfo?.username || i18n.t('pages.medical_diagnosis_form.unknown_patient')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">{i18n.t('pages.medical_diagnosis_form.patient_id')}</p>
                      <p className="font-medium text-gray-800">{patientInfo?.username || i18n.t('common.unknown')}</p>
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
                    {(measurementData.imagePaths || measurementData.images) && (measurementData.imagePaths || measurementData.images).length > 0 && (
                      <div className="pt-3 border-t border-red-200/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Image className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-600 text-sm font-medium">測量圖片 ({(measurementData.imagePaths || measurementData.images).length}張)</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(measurementData.imagePaths || measurementData.images).map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={apiService.getImageUrl(currentUserId || (typeof measurementData.userId === 'string' ? measurementData.userId : measurementData.userId?._id), image.split('/').pop(), 'measurement')}
                                alt={`測量圖片 ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 ring-2 ring-blue-200 hover:ring-blue-400"
                                onClick={() => {
                                  // 构建完整的图片URL数组
                                  const imageUrls = (measurementData.imagePaths || measurementData.images).map(img => 
                                    apiService.getImageUrl(currentUserId || (typeof measurementData.userId === 'string' ? measurementData.userId : measurementData.userId?._id), img.split('/').pop(), 'measurement')
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
                        {(measurementData.imagePaths || measurementData.images).length > 3 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
                            onClick={() => {
                              const imageUrls = (measurementData.imagePaths || measurementData.images).map(img => 
                                apiService.getImageUrl(currentUserId || (typeof measurementData.userId === 'string' ? measurementData.userId : measurementData.userId?._id), img.split('/').pop(), 'measurement')
                              )
                              openImagePreview(imageUrls, 0)
                            }}
                          >
                            <Image className="h-3 w-3 mr-1" />
                            查看所有圖片 ({(measurementData.imagePaths || measurementData.images).length}張)
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 根据hasRead参数决定显示模式 */}
        {hasRead === '1' ? (
          /* 只读模式：只显示诊断内容 */
          <div>
            <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-green-500/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  診斷記錄查看
                </CardTitle>
                <CardDescription className="text-gray-600">
                  此測量記錄已完成診斷評估
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50">
                  <Eye className="h-4 w-4" />
                  <AlertDescription className="text-blue-700">
                    <strong>此測量記錄已完成診斷評估</strong>
                    <br />
                    以下是該記錄的診斷詳情，內容為只讀模式。
                  </AlertDescription>
                </Alert>
                
                {existingDiagnosis ? (
                  <div className="space-y-6">
                    
                    {/* 诊断结果 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-gray-800">診斷結果</h3>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-50 via-blue-25 to-white rounded-xl shadow-sm">
                        <p className="text-blue-900 font-medium text-base leading-relaxed whitespace-pre-wrap">{diagnosis || '無診斷結果'}</p>
                      </div>
                    </div>

                    {/* 风险等级 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-gray-800">風險等級</h3>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-orange-50 via-orange-25 to-white rounded-xl shadow-sm">
                        <Badge 
                          className={`text-sm px-3 py-1.5 font-medium rounded-lg shadow-sm ${
                            riskLevel === 'high' || riskLevel === 'critical' 
                              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0' 
                              : riskLevel === 'medium' 
                                ? 'bg-yellow-500 text-white border-0'
                                : 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0'
                          }`}
                        >
                          {riskLevel === 'low' ? '🟢 低風險' : 
                           riskLevel === 'medium' ? '🟡 中風險' : 
                           riskLevel === 'high' ? '🔴 高風險' : 
                           riskLevel === 'critical' ? '🚨 緊急' : '⚪ 未設定'}
                        </Badge>
                      </div>
                    </div>

                    {/* 治疗建议 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-gray-800">用藥建議</h3>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-green-50 via-green-25 to-white rounded-xl shadow-sm min-h-[100px]">
                          <p className="text-green-900 leading-relaxed whitespace-pre-wrap">{medications || '暫無用藥建議'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-gray-800">生活方式建議</h3>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-purple-50 via-purple-25 to-white rounded-xl shadow-sm min-h-[100px]">
                          <p className="text-purple-900 leading-relaxed whitespace-pre-wrap">{lifestyle || '暫無生活方式建議'}</p>
                        </div>
                      </div>
                    </div>

                    {/* 复查建议 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-gray-800">復查建議</h3>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-indigo-50 via-indigo-25 to-white rounded-xl shadow-sm">
                        <p className="text-indigo-900 leading-relaxed whitespace-pre-wrap">{followUp || '暫無復查建議'}</p>
                      </div>
                    </div>

                    {/* 其他备注 */}
                    {notes && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-6 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-gray-800">其他備註</h3>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-gray-50 via-gray-25 to-white rounded-xl shadow-sm">
                          <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{notes}</p>
                        </div>
                      </div>
                    )}

                    {/* 诊断信息 */}
                    <div className="mt-8 p-4 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-xl shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">診斷時間：{formatDate(existingDiagnosis.createdAt)}</span>
                          </div>
                          {existingDiagnosis.doctorId && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-green-500" />
                              <span className="font-medium">診斷醫生：{existingDiagnosis.doctorId.fullName || existingDiagnosis.doctorId.username || '未知醫生'}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 bg-white px-2 py-1 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>已完成診斷</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                      <p className="text-orange-800 font-medium">⚠️ 正在加載診斷記錄，請稍候...</p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/medical/diagnosis')}
                    className="flex-1 bg-gradient-to-r from-slate-50 to-gray-50 border-0 text-gray-700 hover:from-slate-100 hover:to-gray-100 hover:shadow-md transition-all duration-200 font-medium py-3 rounded-xl"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    返回診斷列表
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* 编辑模式：显示患者历史记录 + 诊断表单 */
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
                      const statusStyle = getStatusStyle(record.status, isCurrentRecord, isAbnormal)
                      
                      return (
                        <div key={record._id} className={`p-3 rounded-lg transition-all ${statusStyle.background}`} style={{ border: 'none' }}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusStyle.iconBg}`}>
                                {getMeasurementTypeIcon(getMeasurementType(record))}
                              </div>
                              <div>
                                <h4 className={`font-medium text-sm ${statusStyle.textColor}`}>
                                  {getMeasurementTypeLabel(getMeasurementType(record))}
                                </h4>
                                <div className="flex items-center gap-1 mt-1">
                                  {isCurrentRecord && (
                                    <Badge className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5">
                                      當前記錄
                                    </Badge>
                                  )}
                                  {/* 状态标签 */}
                                  <Badge 
                                    variant={record.status === 'processed' ? 'secondary' : isAbnormal ? 'destructive' : 'default'} 
                                    className={`text-xs px-1.5 py-0.5 ${
                                      record.status === 'processed' 
                                        ? 'bg-gray-100 text-gray-600 border-gray-300' 
                                        : isAbnormal && !isCurrentRecord
                                          ? 'bg-orange-100 text-orange-700 border-orange-200'
                                          : 'bg-blue-100 text-blue-700 border-blue-200'
                                    }`}
                                  >
                                    {getStatusLabel(record.status)}
                                  </Badge>
                                  {isAbnormal && !isCurrentRecord && record.status !== 'processed' && (
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

          {/* 诊断表单/只读信息 - 右侧 */}
          <div>
            <Card 
              ref={diagnosisFormRef}
              className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-green-500/10"
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  {isReadOnly ? (
                    <>
                      <Eye className="h-5 w-5 text-blue-600" />
                      診斷記錄查看
                    </>
                  ) : (
                    <>
                      <Stethoscope className="h-5 w-5 text-green-600" />
                      診斷評估表單
                    </>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {isReadOnly ? '此測量記錄已完成診斷評估' : '請提供專業的診斷結果和治療建議'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {isReadOnly ? (
                  /* 只读模式 - 显示诊断内容 */
                  <div className="space-y-6">
                    <Alert className="border-blue-200 bg-blue-50">
                      <Eye className="h-4 w-4" />
                      <AlertDescription className="text-blue-700">
                        <strong>此測量記錄已完成診斷評估</strong>
                        <br />
                        以下是該記錄的診斷詳情，內容為只讀模式。
                      </AlertDescription>
                    </Alert>
                    
                    {existingDiagnosis ? (
                      <div className="space-y-6">
                        
                        {/* 诊断结果 */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">診斷結果</h3>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-blue-50 via-blue-25 to-white rounded-xl shadow-sm">
                            <p className="text-blue-900 font-medium text-base leading-relaxed whitespace-pre-wrap">{diagnosis || '無診斷結果'}</p>
                          </div>
                        </div>

                        {/* 风险等级 */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">風險等級</h3>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-orange-50 via-orange-25 to-white rounded-xl shadow-sm">
                            <Badge 
                              className={`text-sm px-3 py-1.5 font-medium rounded-lg shadow-sm ${
                                riskLevel === 'high' || riskLevel === 'critical' 
                                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0' 
                                  : riskLevel === 'medium' 
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0'
                                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0'
                              }`}
                            >
                              {riskLevel === 'low' ? '🟢 低風險' : 
                               riskLevel === 'medium' ? '🟡 中風險' : 
                               riskLevel === 'high' ? '🔴 高風險' : 
                               riskLevel === 'critical' ? '🚨 緊急' : '⚪ 未設定'}
                            </Badge>
                          </div>
                        </div>

                        {/* 治疗建议 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                              <h3 className="text-lg font-semibold text-gray-800">用藥建議</h3>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-50 via-green-25 to-white rounded-xl shadow-sm min-h-[100px]">
                              <p className="text-green-900 leading-relaxed whitespace-pre-wrap">{medications || '暫無用藥建議'}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                              <h3 className="text-lg font-semibold text-gray-800">生活方式建議</h3>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-purple-50 via-purple-25 to-white rounded-xl shadow-sm min-h-[100px]">
                              <p className="text-purple-900 leading-relaxed whitespace-pre-wrap">{lifestyle || '暫無生活方式建議'}</p>
                            </div>
                          </div>
                        </div>

                        {/* 复查建议 */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">復查建議</h3>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-indigo-50 via-indigo-25 to-white rounded-xl shadow-sm">
                            <p className="text-indigo-900 leading-relaxed whitespace-pre-wrap">{followUp || '暫無復查建議'}</p>
                          </div>
                        </div>

                        {/* 其他备注 */}
                        {notes && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-1 h-6 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full"></div>
                              <h3 className="text-lg font-semibold text-gray-800">其他備註</h3>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-gray-50 via-gray-25 to-white rounded-xl shadow-sm">
                              <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{notes}</p>
                            </div>
                          </div>
                        )}

                        {/* 诊断信息 */}
                        <div className="mt-8 p-4 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-xl shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">診斷時間：{formatDate(existingDiagnosis.createdAt)}</span>
                              </div>
                              {existingDiagnosis.doctorId && (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-green-500" />
                                  <span className="font-medium">診斷醫生：{existingDiagnosis.doctorId.fullName || existingDiagnosis.doctorId.username || '未知醫生'}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500 bg-white px-2 py-1 rounded-full">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span>已完成診斷</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                          <p className="text-orange-800 font-medium">⚠️ 正在加載診斷記錄，請稍候...</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/medical/diagnosis')}
                        className="flex-1 bg-gradient-to-r from-slate-50 to-gray-50 border-0 text-gray-700 hover:from-slate-100 hover:to-gray-100 hover:shadow-md transition-all duration-200 font-medium py-3 rounded-xl"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        返回診斷列表
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* 编辑模式 - 显示诊断表单 */
                  <>
                {/* 诊断结果 */}
                <div className="space-y-2">
                  <Label htmlFor="diagnosis" className="text-sm font-medium text-gray-700">{i18n.t('pages.medical_diagnosis_form.diagnosis_result_required')}</Label>
                  <Textarea
                    id="diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder={i18n.t('pages.medical_diagnosis_form.diagnosis_placeholder')}
                    className="min-h-[120px] bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                    required
                  />
                </div>

                {/* 风险等级 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    {i18n.t('pages.medical_diagnosis_form.risk_level')} <span className="text-red-500">*</span>
                  </Label>
                  <Select value={riskLevel} onValueChange={(value) => setRiskLevel(value)}>
                    <SelectTrigger className="bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300">
                      <SelectValue placeholder={i18n.t('pages.medical_diagnosis_form.select_risk_level')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{i18n.t('pages.medical_diagnosis_form.low_risk')}</SelectItem>
                      <SelectItem value="medium">{i18n.t('pages.medical_diagnosis_form.medium_risk')}</SelectItem>
                      <SelectItem value="high">{i18n.t('pages.medical_diagnosis_form.high_risk')}</SelectItem>
                      <SelectItem value="critical">{i18n.t('pages.medical_diagnosis_form.critical_risk')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 治疗建议 */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="medications" className="text-sm font-medium text-gray-700">{i18n.t('pages.medical_diagnosis_form.medication_advice')}</Label>
                    <Textarea
                      id="medications"
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                      placeholder={i18n.t('pages.medical_diagnosis_form.medication_placeholder')}
                      className="min-h-[80px] bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lifestyle" className="text-sm font-medium text-gray-700">{i18n.t('pages.medical_diagnosis_form.lifestyle_advice')}</Label>
                    <Textarea
                      id="lifestyle"
                      value={lifestyle}
                      onChange={(e) => setLifestyle(e.target.value)}
                      placeholder={i18n.t('pages.medical_diagnosis_form.lifestyle_placeholder')}
                      className="min-h-[80px] bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                    />
                  </div>
                </div>

                {/* 复查建议 */}
                <div className="space-y-2">
                  <Label htmlFor="followUp" className="text-sm font-medium text-gray-700">{i18n.t('pages.medical_diagnosis_form.follow_up_advice')}</Label>
                  <Textarea
                    id="followUp"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    placeholder={i18n.t('pages.medical_diagnosis_form.follow_up_placeholder')}
                    className="min-h-[80px] bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                  />
                </div>

                {/* 其他备注 */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">{i18n.t('pages.medical_diagnosis_form.other_notes')}</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={i18n.t('pages.medical_diagnosis_form.notes_placeholder')}
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
                        {i18n.t('pages.medical_diagnosis_form.submitting')}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {i18n.t('pages.medical_diagnosis_form.submit_diagnosis')}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/medical/diagnosis')}
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {i18n.t('pages.medical_diagnosis_form.back_to_list')}
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </main>
      
      {/* 图片查看器 */}
      <ImageViewer
        images={currentImages}
        userId={currentUserId}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        initialIndex={currentImageIndex}
      />

      {/* 新的图片预览组件 */}
      <ImagePreview
        images={previewImages}
        isOpen={imagePreviewOpen}
        onClose={() => setImagePreviewOpen(false)}
        initialIndex={previewInitialIndex}
        showDownload={true}
        showRotate={true}
        showZoom={true}
        showNavigation={true}
        maxZoom={5}
        minZoom={0.1}
        zoomStep={0.2}
      />

      {/* 确认弹窗 */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={cancelNavigation}
        type="warning"
        title={i18n.t('pages.medical_diagnosis_form.confirm_navigation')}
        description={i18n.t('pages.medical_diagnosis_form.confirm_navigation_desc')}
        onConfirm={confirmNavigation}
        onCancel={cancelNavigation}
      />
    </div>
  )
}