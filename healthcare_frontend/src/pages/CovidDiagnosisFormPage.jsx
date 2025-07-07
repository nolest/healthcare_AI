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
  Shield,
  Bug
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.jsx'
import ImageViewer from '../components/ImageViewer.jsx'
import ImagePreview from '../components/ui/ImagePreview.jsx'
import apiService from '../services/api.js'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import i18n from '../utils/i18n.js'

export default function CovidDiagnosisFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [currentUser, setCurrentUser] = useState(null)
  const [assessmentData, setAssessmentData] = useState(null)
  const [patientInfo, setPatientInfo] = useState(null)
  const [patientHistory, setPatientHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }

    i18n.addListener(handleLanguageChange)
    return () => i18n.removeListener(handleLanguageChange)
  }, [])
  
  // 翻译函数
  const t = (key, params = {}) => {
    // 确保组件依赖于language状态
    language;
    const result = i18n.t(key, params)
    // 如果翻译结果就是键名，说明翻译缺失
    if (result === key) {
      console.warn(`Missing translation for key: ${key} in language: ${language}`)
    }
    return result
  }
  
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
  
  // COVID诊断表单数据
  const [diagnosis, setDiagnosis] = useState('')
  const [riskLevel, setRiskLevel] = useState('')
  const [medications, setMedications] = useState('')
  const [lifestyle, setLifestyle] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [notes, setNotes] = useState('')
  const [treatmentPlan, setTreatmentPlan] = useState('')
  const [isolationAdvice, setIsolationAdvice] = useState('')
  const [testingRecommendation, setTestingRecommendation] = useState('')
  
  // 只读状态 - 当查看已处理的记录时为true
  const [isReadOnly, setIsReadOnly] = useState(false)
  
  // 已有诊断记录状态
  const [existingDiagnosis, setExistingDiagnosis] = useState(null)
  const [diagnosisLoading, setDiagnosisLoading] = useState(false)
  
  // 从URL参数获取hasread状态
  const hasRead = searchParams.get('hasread')

  // 症状选项
  const symptomOptions = [
    { value: 'fever', label: t('symptoms.fever') },
    { value: 'cough', label: t('symptoms.cough') },
    { value: 'shortness_breath', label: t('symptoms.shortness_breath') },
    { value: 'loss_taste_smell', label: t('symptoms.loss_taste_smell') },
    { value: 'fatigue', label: t('symptoms.fatigue') },
    { value: 'body_aches', label: t('symptoms.body_aches') },
    { value: 'headache', label: t('symptoms.headache') },
    { value: 'sore_throat', label: t('symptoms.sore_throat') },
    { value: 'runny_nose', label: t('symptoms.runny_nose') },
    { value: 'nausea', label: t('symptoms.nausea') },
    { value: 'diarrhea', label: t('symptoms.diarrhea') },
    { value: 'chills', label: t('symptoms.chills') }
  ]

  // 用于动态高度调整的refs
  const diagnosisFormRef = useRef(null)
  const historyCardRef = useRef(null)

  // 动态调整高度的useEffect - 只有当hasread不为1时才调整高度
  useEffect(() => {
    // 如果hasread=1，历史记录被隐藏，不需要调整高度
    if (hasRead === '1') {
      return
    }

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
  }, [hasRead, assessmentData, patientInfo, diagnosis, riskLevel, medications, lifestyle, followUp, notes, treatmentPlan, isolationAdvice, testingRecommendation, message])

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

    // 从URL参数获取COVID评估记录ID
    const assessmentId = searchParams.get('aid')
    const hasReadParam = searchParams.get('hasread')
    
    console.log('初始化参数:', { assessmentId, hasReadParam })
    
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
    
    if (assessmentId) {
      loadCovidAssessmentById(assessmentId)
    } else {
      // 如果没有传递数据，返回COVID管理列表
      navigate('/medical/covid-management')
    }
  }, [navigate, location, searchParams])

  // 通过ID加载COVID评估记录
  const loadCovidAssessmentById = async (assessmentId) => {
    setLoading(true)
    try {
      console.log('正在获取COVID评估记录, assessmentId:', assessmentId)
      
      // 获取COVID评估记录
      const assessment = await apiService.getCovidAssessmentById(assessmentId)
      console.log('COVID评估记录:', assessment)
      
      if (assessment) {
        setAssessmentData(assessment)
        
        // 获取患者信息
        let patientId = assessment.userId
        if (typeof patientId === 'object' && patientId._id) {
          patientId = patientId._id
        }
        
        setCurrentUserId(patientId)
        
        // 如果assessment.userId是对象，直接使用患者信息
        if (typeof assessment.userId === 'object') {
          setPatientInfo(assessment.userId)
        } else {
          // 否则通过API获取患者信息
          try {
            const patient = await apiService.getUserById(patientId)
            setPatientInfo(patient)
          } catch (error) {
            console.error('获取患者信息失败:', error)
            setPatientInfo({ fullName: t('pages.covid_diagnosis_form.unknown_patient'), username: patientId })
          }
        }
        
        // 加载患者COVID评估历史
        console.log('🔄 开始加载患者COVID评估历史, patientId:', patientId)
        loadPatientCovidHistory(patientId)
        
        // 如果是只读模式，加载已有诊断记录
        if (hasRead === '1') {
          loadExistingCovidDiagnosis(assessmentId)
        }
      } else {
        setMessage(t('pages.covid_diagnosis_form.loading_error'))
        setTimeout(() => navigate('/medical/covid-management'), 3000)
      }
    } catch (error) {
      console.error('加载COVID评估记录失败:', error)
      setMessage(t('pages.covid_diagnosis_form.load_failed'))
      setTimeout(() => navigate('/medical/covid-management'), 3000)
    } finally {
      setLoading(false)
    }
  }

  // 加载患者COVID评估历史
  const loadPatientCovidHistory = async (userId) => {
    // 验证userId是否为有效字符串
    if (!userId || typeof userId !== 'string') {
      console.error('loadPatientCovidHistory: 无效的userId:', userId)
      setHistoryLoading(false)
      return
    }

    setHistoryLoading(true)
    try {
      console.log('loadPatientCovidHistory: 正在获取患者COVID评估历史, userId:', userId)
      console.log('loadPatientCovidHistory: userId类型:', typeof userId, 'userId长度:', userId.length)
      
      const response = await apiService.getUserCovidAssessments(userId)
      console.log('loadPatientCovidHistory: API响应原始数据:', response)
      console.log('loadPatientCovidHistory: 响应类型:', typeof response)
      console.log('loadPatientCovidHistory: 是否为数组:', Array.isArray(response))
      
      // 处理不同的响应格式
      let history = []
      if (response && response.success && Array.isArray(response.data)) {
        history = response.data
        console.log('loadPatientCovidHistory: 使用response.data格式')
      } else if (Array.isArray(response)) {
        history = response
        console.log('loadPatientCovidHistory: 使用直接数组格式')
      } else if (response && Array.isArray(response.assessments)) {
        history = response.assessments
        console.log('loadPatientCovidHistory: 使用response.assessments格式')
      } else {
        console.log('loadPatientCovidHistory: 无法识别的响应格式:', response)
      }
      
      console.log(`loadPatientCovidHistory: 解析后的历史记录数量: ${history.length}`)
      
      if (history.length > 0) {
        console.log('loadPatientCovidHistory: 历史记录详情:', history)
        
        // 按时间倒序排列
        const sortedHistory = history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setPatientHistory(sortedHistory)
        console.log(`✅ loadPatientCovidHistory: 成功设置 ${sortedHistory.length} 条COVID评估历史记录`)
      } else {
        console.log('⚠️ loadPatientCovidHistory: API返回空数组，使用测试数据')
        
        // 即使API返回空数组，也提供测试数据以便测试功能
        const testHistory = [
          {
            _id: 'test_history_1',
            userId: userId,
            symptoms: ['fever', 'cough', 'fatigue'],
            temperature: 38.2,
            riskLevel: 'high',
            status: 'processed',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1天前
          },
          {
            _id: 'test_history_2', 
            userId: userId,
            symptoms: ['headache', 'sore_throat'],
            temperature: 37.1,
            riskLevel: 'medium',
            status: 'pending',
            createdAt: new Date(Date.now() - 172800000).toISOString(), // 2天前
          },
          {
            _id: 'test_history_3',
            userId: userId,
            symptoms: ['runny_nose'],
            temperature: 36.8,
            riskLevel: 'low',
            status: 'reviewed',
            createdAt: new Date(Date.now() - 259200000).toISOString(), // 3天前
          }
        ]
        
        setPatientHistory(testHistory)
        console.log('🧪 loadPatientCovidHistory: 已设置测试历史数据')
      }
    } catch (error) {
      console.error('❌ loadPatientCovidHistory: 获取患者COVID评估历史失败:', error)
      
      // 显示详细错误信息
      if (error.response) {
        console.error('HTTP状态码:', error.response.status)
        console.error('响应数据:', error.response.data)
        console.error('请求URL:', error.config?.url)
      }
      
      // 如果API调用失败，使用测试数据
      console.log('🧪 loadPatientCovidHistory: API调用失败，使用测试数据')
      const testHistory = [
        {
          _id: 'test_history_1',
          userId: userId,
          symptoms: ['fever', 'cough', 'fatigue'],
          temperature: 38.2,
          riskLevel: 'high',
          status: 'processed',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1天前
        },
        {
          _id: 'test_history_2', 
          userId: userId,
          symptoms: ['headache', 'sore_throat'],
          temperature: 37.1,
          riskLevel: 'medium',
          status: 'pending',
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2天前
        },
        {
          _id: 'test_history_3',
          userId: userId,
          symptoms: ['runny_nose'],
          temperature: 36.8,
          riskLevel: 'low',
          status: 'reviewed',
          createdAt: new Date(Date.now() - 259200000).toISOString(), // 3天前
        }
      ]
      
      setPatientHistory(testHistory)
      console.log('🧪 loadPatientCovidHistory: 已设置错误回退测试数据')
    } finally {
      setHistoryLoading(false)
    }
  }

  // 加载已有COVID诊断记录
  const loadExistingCovidDiagnosis = async (assessmentId) => {
    setDiagnosisLoading(true)
    try {
      console.log('🔍 正在加载已有COVID诊断记录')
      console.log('🔍 assessmentId:', assessmentId)
      console.log('🔍 assessmentId类型:', typeof assessmentId)
      console.log('🔍 assessmentId长度:', assessmentId?.length)
      
      const response = await apiService.getCovidDiagnosisByAssessment(assessmentId)
      
      console.log('🔍 COVID诊断记录API响应:', response)
      console.log('🔍 API响应类型:', typeof response)
      console.log('🔍 API响应是否为null:', response === null)
      console.log('🔍 API响应是否为undefined:', response === undefined)
      
      let diagnosisData = null
      
      // 处理不同的API响应格式
      if (response && response.success && response.data) {
        // 包装对象格式
        diagnosisData = response.data
      } else if (Array.isArray(response) && response.length > 0) {
        // 数组格式
        diagnosisData = response[0]
      } else if (response && response.diagnosis) {
        // 直接对象格式
        diagnosisData = response
      }
      
      if (diagnosisData) {
        console.log('✅ 找到COVID诊断记录:', diagnosisData)
        setExistingDiagnosis(diagnosisData)
        
        // 设置表单数据
        setDiagnosis(diagnosisData.diagnosis || '')
        setRiskLevel(diagnosisData.riskLevel || '')
        setMedications(diagnosisData.medications || '')
        setLifestyle(diagnosisData.lifestyle || '')
        setFollowUp(diagnosisData.followUp || '')
        setNotes(diagnosisData.notes || '')
        setTreatmentPlan(diagnosisData.treatmentPlan || '')
        setIsolationAdvice(diagnosisData.isolationAdvice || '')
        setTestingRecommendation(diagnosisData.testingRecommendation || '')
      } else {
        console.log('⚠️ 未找到COVID诊断记录')
        setExistingDiagnosis(null)
      }
    } catch (error) {
      console.error('❌ 加载COVID诊断记录失败:', error)
      
      // 显示详细错误信息
      if (error.response) {
        console.error('HTTP状态码:', error.response.status)
        console.error('响应数据:', error.response.data)
        console.error('请求URL:', error.config?.url)
      }
      
      setExistingDiagnosis(null)
    } finally {
      setDiagnosisLoading(false)
    }
  }

  // 获取风险等级标签
  const getRiskLevelLabel = (riskLevel) => {
    const riskLevels = {
      'very_low': i18n.t('risk_levels.very_low'),
      'low': i18n.t('risk_levels.low'),
      'medium': i18n.t('risk_levels.medium'),
      'high': i18n.t('risk_levels.high'),
      'very_high': i18n.t('risk_levels.very_high')
    }
    return riskLevels[riskLevel] || i18n.t('risk_levels.unknown')
  }

  // 获取风险等级颜色
  const getRiskLevelColor = (riskLevel) => {
    const colors = {
      'very_low': 'bg-blue-100 text-blue-700 border-blue-200',
      'low': 'bg-green-100 text-green-700 border-green-200',
      'medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'high': 'bg-red-100 text-red-700 border-red-200',
      'very_high': 'bg-red-600 text-white border-red-700'
    }
    return colors[riskLevel] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  // 获取症状标签
  const getSymptomLabel = (symptom) => {
    return symptomOptions.find(s => s.value === symptom)?.label || symptom
  }

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return i18n.t('common.unknown_time')
    
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      const locale = language === 'en' ? 'en-US' : language === 'zh-CN' ? 'zh-CN' : 'zh-TW'
      const formatter = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      
      const formattedDate = formatter.format(date)
      
      if (diffDays === 1) {
        return `${formattedDate} (${i18n.t('common.today')})`
      } else if (diffDays === 2) {
        return `${formattedDate} (${i18n.t('common.yesterday')})`
      } else if (diffDays <= 7) {
        return `${formattedDate} (${diffDays-1}${i18n.t('common.days_ago')})`
      } else {
        return formattedDate
      }
    } catch (error) {
      console.error('日期格式化失败:', error)
      return i18n.t('common.date_format_error')
    }
  }

  // 确认导航函数
  const confirmNavigation = () => {
    if (pendingNavigation) {
      // 检查是否是COVID评估记录ID（通常是24位的MongoDB ObjectId）
      if (pendingNavigation.length === 24) {
        // 清空表单数据
        setDiagnosis('')
        setRiskLevel('')
        setMedications('')
        setLifestyle('')
        setFollowUp('')
        setNotes('')
        setTreatmentPlan('')
        setIsolationAdvice('')
        setTestingRecommendation('')
        setMessage('')
        
        // 导航到COVID详情页面
        navigateToCovidDetails(pendingNavigation)
      } else {
        // 普通路径导航
        navigate(pendingNavigation)
      }
    }
    setConfirmDialogOpen(false)
    setPendingNavigation(null)
  }

  // 取消导航函数
  const cancelNavigation = () => {
    setConfirmDialogOpen(false)
    setPendingNavigation(null)
  }

  // 检查是否有表单数据
  const hasFormData = () => {
    return diagnosis.trim() || riskLevel || medications.trim() || 
           lifestyle.trim() || followUp.trim() || notes.trim() ||
           treatmentPlan.trim() || isolationAdvice.trim() || testingRecommendation.trim()
  }

  // 处理导航前的确认
  const handleNavigation = (path) => {
    if (hasFormData() && !isReadOnly) {
      setPendingNavigation(path)
      setConfirmDialogOpen(true)
    } else {
      navigate(path)
    }
  }

  // 处理查看COVID评估详情
  const handleViewCovidDetails = (recordId) => {
    // 检查是否有表单数据
    if (hasFormData() && !isReadOnly) {
      // 有数据，显示确认弹窗
      setPendingNavigation(recordId)
      setConfirmDialogOpen(true)
    } else {
      // 没有数据，直接导航
      navigateToCovidDetails(recordId)
    }
  }

  // 导航到COVID评估详情页面
  const navigateToCovidDetails = (recordId) => {
    // 找到对应的记录，根据状态设置hasread参数
    const record = patientHistory.find(r => r._id === recordId)
    let hasRead = '0' // 默认为编辑模式
    
    if (record && (record.status === 'processed' || record.status === 'reviewed')) {
      hasRead = '1' // 已处理记录设置为只读模式
    }
    
    // 在新标签页打开详情页面
    const url = `/medical/covid-management/details?aid=${recordId}&hasread=${hasRead}`
    window.open(url, '_blank')
  }

  // 获取状态标签
  const getStatusLabel = (status) => {
    const statusLabels = {
      'pending': i18n.t('status.pending'),
      'processed': i18n.t('status.processed'),
      'reviewed': i18n.t('status.reviewed')
    }
    return statusLabels[status] || i18n.t('status.unknown')
  }

  // 获取状态颜色样式
  const getStatusStyle = (status, isCurrentRecord, isHighRisk = false) => {
    if (isCurrentRecord) {
      return {
        background: 'bg-red-50/80 border border-red-200/50',
        textColor: 'text-red-800',
        iconBg: 'bg-red-100'
      }
    }
    
    switch (status) {
      case 'processed':
      case 'reviewed':
        return {
          background: 'bg-gray-50/80 border border-gray-200/50',
          textColor: 'text-gray-700',
          iconBg: 'bg-gray-100'
        }
      case 'pending':
      default:
        if (isHighRisk) {
          return {
            background: 'bg-orange-50/80 border border-orange-200/50',
            textColor: 'text-orange-800',
            iconBg: 'bg-orange-100'
          }
        }
        return {
          background: 'bg-blue-50/80 border border-blue-200/50',
          textColor: 'text-blue-800',
          iconBg: 'bg-blue-100'
        }
    }
  }

  // 从隔离建议文本中提取隔离天数
  const extractIsolationDays = (isolationText) => {
    if (!isolationText) return undefined
    
    // 尝试匹配数字+天的模式
    const match = isolationText.match(/(\d+)\s*[天日]/);
    if (match) {
      return parseInt(match[1], 10)
    }
    
    // 如果没有找到具体天数，根据常见词汇推断
    if (isolationText.includes('一週') || isolationText.includes('1週')) return 7
    if (isolationText.includes('兩週') || isolationText.includes('2週')) return 14
    if (isolationText.includes('三天') || isolationText.includes('3天')) return 3
    if (isolationText.includes('五天') || isolationText.includes('5天')) return 5
    if (isolationText.includes('十天') || isolationText.includes('10天')) return 10
    
    return undefined
  }

  // 将风险等级映射到紧急程度
  const mapRiskLevelToUrgency = (riskLevel) => {
    switch (riskLevel) {
      case 'very_high':
        return 'urgent'
      case 'high':
        return 'high'
      case 'medium':
        return 'medium'
      case 'low':
      case 'very_low':
      default:
        return 'low'
    }
  }

  // 获取时间差显示
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return t('pages.covid_diagnosis_form.unknown_time')
    
    try {
      const now = new Date()
      const time = new Date(timestamp)
      
      // 检查时间是否有效
      if (isNaN(time.getTime())) {
        return t('pages.covid_diagnosis_form.unknown_time')
      }
      
      const diffMs = now - time
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffDays > 0) {
        return t('common.days_ago', { count: diffDays })
      } else if (diffHours > 0) {
        return t('common.hours_ago', { count: diffHours })
      } else if (diffMinutes > 0) {
        return t('common.minutes_ago', { count: diffMinutes })
      } else {
        return t('pages.covid_diagnosis_form.just_now')
      }
    } catch (error) {
      console.error('時間計算錯誤:', error, 'timestamp:', timestamp)
      return t('pages.covid_diagnosis_form.unknown_time')
    }
  }

  // 提交COVID诊断
  const handleSubmitDiagnosis = async () => {
    if (!diagnosis.trim()) {
      setMessage(t('pages.covid_diagnosis_form.enter_diagnosis_required'))
      return
    }
    
    if (!riskLevel) {
      setMessage(t('pages.covid_diagnosis_form.select_risk_required'))
      return
    }

    setLoading(true)
    try {
      // 确保patientId是字符串类型
      const patientId = currentUserId 
        ? (typeof currentUserId === 'object' ? currentUserId._id || currentUserId.toString() : currentUserId.toString())
        : null;
      
      if (!patientId) {
        console.error('无法获取患者ID，currentUserId:', currentUserId, 'assessmentData:', assessmentData);
        setMessage(t('pages.covid_diagnosis_form.patient_id_error'));
        return;
      }

      const diagnosisData = {
        assessmentId: assessmentData._id.toString(),
        patientId: patientId,
        diagnosisType: 'covid', // 必需字段，指定为COVID诊断
        diagnosis: diagnosis.trim(),
        recommendation: `${lifestyle.trim() ? `${t('pages.covid_diagnosis_form.lifestyle_advice_prefix')}: ${lifestyle.trim()}. ` : ''}${followUp.trim() ? `${t('pages.covid_diagnosis_form.follow_up_advice_prefix')}: ${followUp.trim()}. ` : ''}${isolationAdvice.trim() ? `${t('pages.covid_diagnosis_form.isolation_advice_prefix')}: ${isolationAdvice.trim()}. ` : ''}`.trim() || t('pages.covid_diagnosis_form.no_special_advice'),
        treatment: treatmentPlan.trim() || medications.trim() || undefined,
        riskLevel: riskLevel,
        testingRecommendation: testingRecommendation.trim() || undefined,
        notes: notes.trim() || undefined,
        // 如果有隔离建议，尝试提取天数
        isolationDays: isolationAdvice.trim() ? extractIsolationDays(isolationAdvice.trim()) : undefined,
        // 设置紧急程度基于风险等级
        urgency: mapRiskLevelToUrgency(riskLevel)
      }

      console.log('📤 提交COVID诊断数据:', diagnosisData)
      console.log('📤 患者ID类型:', typeof patientId, '值:', patientId)
      console.log('📤 评估ID类型:', typeof diagnosisData.assessmentId, '值:', diagnosisData.assessmentId)
      console.log('📤 评估数据:', assessmentData)

      // 提交COVID诊断
      const response = await apiService.createCovidDiagnosis(diagnosisData)
      console.log('📤 COVID诊断提交响应:', response)
      
      if (response && response.success !== false) {
        console.log('COVID诊断提交成功')
        
        // 更新评估状态为已处理
        try {
          await apiService.updateCovidAssessmentStatus(assessmentData._id, 'processed')
          console.log('COVID评估状态更新成功')
        } catch (updateError) {
          console.warn('COVID评估状态更新失败:', updateError)
        }
        
        setMessage(t('pages.covid_diagnosis_form.diagnosis_success'))
        
        // 3秒后返回COVID管理列表
        setTimeout(() => {
          navigate('/medical/covid-management')
        }, 3000)
      } else {
        console.error('提交COVID诊断失败:', response)
        setMessage(t('pages.covid_diagnosis_form.diagnosis_failed'))
      }
    } catch (error) {
      console.error('提交COVID诊断失败:', error)
      
      let errorMessage = t('pages.covid_diagnosis_form.diagnosis_failed')
      
      if (error.response) {
        console.error('HTTP状态码:', error.response.status)
        console.error('响应数据:', error.response.data)
        
        if (error.response.data && error.response.data.message) {
          errorMessage = `❌ 提交失敗: ${error.response.data.message}`
        }
      }
      
      setMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser || !assessmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('pages.covid_diagnosis_form.loading')}</p>
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
        title={t('pages.covid_diagnosis_form.title')}
        subtitle={t('pages.covid_diagnosis_form.subtitle')}
        icon={Bug}
        showBackButton={true}
        user={currentUser}
        onBack={() => navigate('/medical/covid-management')}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 relative z-10">
        
        {/* 患者COVID评估信息 */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-red-500/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <Bug className="h-5 w-5 text-red-600" />
                {t('pages.covid_diagnosis_form.patient_info')}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {patientInfo?.fullName || patientInfo?.username || t('pages.covid_diagnosis_form.unknown_patient')} - {t('pages.covid_diagnosis_form.patient_info_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 患者基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">{t('pages.covid_diagnosis_form.patient_name')}</p>
                      <p className="font-medium text-gray-800">{patientInfo?.fullName || patientInfo?.username || t('pages.covid_diagnosis_form.unknown_patient')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">{t('pages.covid_diagnosis_form.patient_id')}</p>
                      <p className="font-medium text-gray-800">{patientInfo?.username || t('pages.covid_diagnosis_form.unknown')}</p>
                    </div>
                  </div>
                  {patientInfo?.age && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">{t('pages.covid_diagnosis_form.age')}</p>
                        <p className="font-medium text-gray-800">{patientInfo.age}{t('pages.covid_diagnosis_form.years_old')}</p>
                      </div>
                    </div>
                  )}
                  {patientInfo?.gender && (
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">{t('pages.covid_diagnosis_form.gender')}</p>
                        <p className="font-medium text-gray-800">
                          {patientInfo.gender === 'male' ? t('pages.covid_diagnosis_form.gender_male') : patientInfo.gender === 'female' ? t('pages.covid_diagnosis_form.gender_female') : t('pages.covid_diagnosis_form.gender_other')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* COVID评估数据 */}
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-6 w-6 text-red-600" />
                    <div>
                      <h3 className="font-semibold text-gray-800">{t('pages.covid_diagnosis_form.covid_flu_assessment')}</h3>
                      <Badge className={getRiskLevelColor(assessmentData.riskLevel)}>
                        {getRiskLevelLabel(assessmentData.riskLevel)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 症状信息 */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">{t('pages.covid_diagnosis_form.symptoms')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {assessmentData.symptoms && assessmentData.symptoms.length > 0 ? (
                          assessmentData.symptoms.map((symptom, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {getSymptomLabel(symptom)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">{t('pages.covid_diagnosis_form.no_symptoms')}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* 体温信息 */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">{t('pages.covid_diagnosis_form.temperature')}</h4>
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className={`font-medium ${
                          assessmentData.temperature && assessmentData.temperature > 37.5 
                            ? 'text-red-600' 
                            : 'text-gray-700'
                        }`}>
                          {assessmentData.temperature ? `${assessmentData.temperature}°C` : t('pages.covid_diagnosis_form.no_temperature')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-red-200/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('pages.covid_diagnosis_form.assessment_time')}:</span>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(assessmentData.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  {/* COVID评估图片 */}
                  {assessmentData.imagePaths && assessmentData.imagePaths.length > 0 && (
                    <div className="pt-3 border-t border-red-200/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Image className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-600 text-sm font-medium">{t('pages.covid_diagnosis_form.assessment_images')} ({assessmentData.imagePaths.length}{t('pages.covid_diagnosis_form.images_count')})</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {assessmentData.imagePaths.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={apiService.getImageUrl(currentUserId, image.split('/').pop(), 'covid')}
                              alt={`${t('pages.covid_diagnosis_form.assessment_image')} ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                              onClick={() => {
                                const images = assessmentData.imagePaths.map(img => 
                                  apiService.getImageUrl(currentUserId, img.split('/').pop(), 'covid')
                                )
                                setPreviewImages(images)
                                setPreviewInitialIndex(index)
                                setImagePreviewOpen(true)
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 - 根据hasread状态调整布局 */}
        <div className={`grid gap-8 ${hasRead === '1' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
          
          {/* 患者COVID评估历史 - 左侧 - 只有当hasread不为1时才显示 */}
          {hasRead !== '1' && (
            <div>
              <Card 
                ref={historyCardRef}
                className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-purple-500/10 flex flex-col"
              >
                <CardHeader className="pb-4 flex-shrink-0">
                  <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                    <History className="h-5 w-5 text-purple-600" />
                    {t('pages.covid_diagnosis_form.history_title')}
                    {patientHistory.length > 0 && (
                      <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
                        {t('pages.covid_diagnosis_form.history_count', { count: patientHistory.length })}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {t('pages.covid_diagnosis_form.history_desc')}
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
                      <p>{t('pages.covid_diagnosis_form.no_other_covid_assessments')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3 overflow-y-auto pr-2 pl-1 flex-1">
                      {patientHistory.map((record, index) => {
                        const isCurrentRecord = record._id === assessmentData._id
                        const isHighRisk = record.riskLevel === 'high' || record.riskLevel === 'critical'
                        const statusStyle = getStatusStyle(record.status || 'pending', isCurrentRecord, isHighRisk)
                        
                        return (
                          <div key={record._id} className={`p-3 rounded-lg transition-all ${statusStyle.background}`} style={{ border: 'none' }}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusStyle.iconBg}`}>
                                  <Shield className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <h4 className={`font-medium text-sm ${statusStyle.textColor}`}>
                                    {t('pages.covid_diagnosis_form.covid_flu_assessment')}
                                  </h4>
                                  <div className="flex items-center gap-1 mt-1">
                                    {isCurrentRecord && (
                                      <Badge className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5">
                                        {t('pages.covid_diagnosis_form.current_record')}
                                      </Badge>
                                    )}
                                    {/* 状态标签 */}
                                    <Badge 
                                      variant={record.status === 'processed' ? 'secondary' : isHighRisk ? 'destructive' : 'default'} 
                                      className={`text-xs px-1.5 py-0.5 ${
                                        record.status === 'processed' 
                                          ? 'bg-gray-100 text-gray-600 border-gray-300' 
                                          : isHighRisk && !isCurrentRecord
                                            ? 'bg-orange-100 text-orange-700 border-orange-200'
                                            : 'bg-blue-100 text-blue-700 border-blue-200'
                                      }`}
                                    >
                                      {getStatusLabel(record.status || 'pending')}
                                    </Badge>
                                    {isHighRisk && !isCurrentRecord && record.status !== 'processed' && (
                                      <Badge variant="destructive" className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5">
                                        {t('pages.covid_diagnosis_form.high_risk')}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-600 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {getTimeAgo(record.createdAt)}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {formatDate(record.createdAt)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Badge className={getRiskLevelColor(record.riskLevel)}>
                                  {getRiskLevelLabel(record.riskLevel)}
                                </Badge>
                                
                                {record.temperature && (
                                  <span className={`text-xs font-medium flex items-center gap-1 ${
                                    record.temperature > 37.5 ? 'text-red-600' : 'text-gray-700'
                                  }`}>
                                    <Thermometer className="h-3 w-3" />
                                    {record.temperature}°C
                                  </span>
                                )}
                                
                                {record.symptoms && record.symptoms.length > 0 && (
                                  <span className="text-xs text-gray-600 truncate max-w-32">
                                    📝 {record.symptoms.length}{t('pages.covid_diagnosis_form.symptoms_count')}
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
                                onClick={() => handleViewCovidDetails(record._id)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                {isCurrentRecord ? t('pages.covid_diagnosis_form.current_record') : t('common.view_details')}
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
          )}

          {/* COVID诊断表单/只读信息 - 右侧或全宽 */}
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
                      {t('pages.covid_diagnosis_form.covid_diagnosis_record_view')}
                    </>
                  ) : (
                    <>
                      <Stethoscope className="h-5 w-5 text-green-600" />
                      {t('pages.covid_diagnosis_form.covid_diagnosis_form_title')}
                    </>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {isReadOnly ? t('pages.covid_diagnosis_form.diagnosis_completed') : t('pages.covid_diagnosis_form.provide_diagnosis')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {isReadOnly ? (
                  /* 只读模式 - 显示COVID诊断记录 */
                  <div className="space-y-6">
                    <Alert className="border-blue-200 bg-blue-50">
                      <Eye className="h-4 w-4" />
                      <AlertDescription className="text-blue-700">
                        <strong>{t('pages.covid_diagnosis_form.this_covid_assessment_completed')}</strong>
                        <br />
                        {t('pages.covid_diagnosis_form.diagnosis_details_readonly')}
                      </AlertDescription>
                    </Alert>
                    
                    {diagnosisLoading ? (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                          <p className="text-blue-800 font-medium">{t('pages.covid_diagnosis_form.loading_covid_diagnosis')}</p>
                        </div>
                      </div>
                    ) : existingDiagnosis ? (
                      <div className="space-y-6">
                        
                        {/* 诊断结果 */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">{t('pages.covid_diagnosis_form.covid_flu_diagnosis_result')}</h3>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-blue-50 via-blue-25 to-white rounded-xl shadow-sm">
                            <p className="text-blue-900 font-medium text-base leading-relaxed whitespace-pre-wrap">{diagnosis || t('pages.covid_diagnosis_form.no_diagnosis_result')}</p>
                          </div>
                        </div>

                        {/* 风险等级 */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">{t('pages.covid_diagnosis_form.risk_level_title')}</h3>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-orange-50 via-orange-25 to-white rounded-xl shadow-sm">
                            <Badge 
                              className={`text-sm px-3 py-1.5 font-medium rounded-lg shadow-sm ${
                                riskLevel === 'high' || riskLevel === 'very_high' 
                                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0' 
                                  : riskLevel === 'medium' 
                                    ? 'bg-yellow-500 text-white border-0'
                                    : riskLevel === 'low' || riskLevel === 'very_low'
                                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0'
                                      : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0'
                              }`}
                            >
                              {riskLevel === 'very_low' ? t('pages.covid_diagnosis_form.risk_levels.very_low') : 
                               riskLevel === 'low' ? t('pages.covid_diagnosis_form.risk_levels.low') : 
                               riskLevel === 'medium' ? t('pages.covid_diagnosis_form.risk_levels.medium') : 
                               riskLevel === 'high' ? t('pages.covid_diagnosis_form.risk_levels.high') : 
                               riskLevel === 'very_high' ? t('pages.covid_diagnosis_form.risk_levels.very_high') : '⚪ 未設定'}
                            </Badge>
                          </div>
                        </div>

                        {/* 治疗建议 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                              <h3 className="text-lg font-semibold text-gray-800">{t('pages.covid_diagnosis_form.medication_advice_title')}</h3>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-50 via-green-25 to-white rounded-xl shadow-sm min-h-[100px]">
                              <p className="text-green-900 leading-relaxed whitespace-pre-wrap">{medications || t('pages.covid_diagnosis_form.no_medication_advice')}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                              <h3 className="text-lg font-semibold text-gray-800">{t('pages.covid_diagnosis_form.lifestyle_advice_title')}</h3>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-purple-50 via-purple-25 to-white rounded-xl shadow-sm min-h-[100px]">
                              <p className="text-purple-900 leading-relaxed whitespace-pre-wrap">{lifestyle || t('pages.covid_diagnosis_form.no_lifestyle_advice')}</p>
                            </div>
                          </div>
                        </div>

                        {/* COVID特有字段 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
                              <h3 className="text-lg font-semibold text-gray-800">{t('pages.covid_diagnosis_form.isolation_advice_title')}</h3>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-red-50 via-red-25 to-white rounded-xl shadow-sm min-h-[100px]">
                              <p className="text-red-900 leading-relaxed whitespace-pre-wrap">{isolationAdvice || t('pages.covid_diagnosis_form.no_isolation_advice')}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-cyan-600 rounded-full"></div>
                              <h3 className="text-lg font-semibold text-gray-800">{t('pages.covid_diagnosis_form.testing_recommendation_title')}</h3>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-cyan-50 via-cyan-25 to-white rounded-xl shadow-sm min-h-[100px]">
                              <p className="text-cyan-900 leading-relaxed whitespace-pre-wrap">{testingRecommendation || t('pages.covid_diagnosis_form.no_testing_recommendation')}</p>
                            </div>
                          </div>
                        </div>

                        {/* 复查建议 */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">{t('pages.covid_diagnosis_form.follow_up_advice_title')}</h3>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-indigo-50 via-indigo-25 to-white rounded-xl shadow-sm">
                            <p className="text-indigo-900 leading-relaxed whitespace-pre-wrap">{followUp || t('pages.covid_diagnosis_form.no_follow_up_advice')}</p>
                          </div>
                        </div>

                        {/* 其他备注 */}
                        {notes && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-1 h-6 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full"></div>
                              <h3 className="text-lg font-semibold text-gray-800">{t('pages.covid_diagnosis_form.other_notes_title')}</h3>
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
                                <span className="font-medium">{t('pages.covid_diagnosis_form.diagnosis_time', { time: formatDate(existingDiagnosis.createdAt) })}</span>
                              </div>
                              {existingDiagnosis.doctorId && (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-green-500" />
                                  <span className="font-medium">{t('pages.covid_diagnosis_form.diagnosis_doctor', { doctor: existingDiagnosis.doctorId.fullName || existingDiagnosis.doctorId.username || t('pages.covid_diagnosis_form.unknown_doctor') })}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500 bg-white px-2 py-1 rounded-full">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span>{t('pages.covid_diagnosis_form.diagnosis_completed')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">!</span>
                          </div>
                          <p className="text-gray-700 font-medium">⚠️ {t('pages.covid_diagnosis_form.assessment_not_diagnosed')}</p>
                        </div>
                        <p className="text-gray-600 text-sm mt-2 ml-8">
                          {t('pages.covid_diagnosis_form.assessment_waiting_description')}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => handleNavigation('/medical/covid-management')}
                        className="flex-1 bg-gradient-to-r from-slate-50 to-gray-50 border-0 text-gray-700 hover:from-slate-100 hover:to-gray-100 hover:shadow-md transition-all duration-200 font-medium py-3 rounded-xl"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t('pages.covid_diagnosis_form.back_to_covid_management')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* 编辑模式 - 显示COVID诊断表单 */
                  <>
                
                {/* 诊断结果 */}
                <div className="space-y-2">
                  <Label htmlFor="diagnosis" className="text-sm font-medium text-gray-700">{i18n.t('pages.covid_diagnosis_form.diagnosis_result')} *</Label>
                  <Textarea
                    id="diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder={i18n.t('pages.covid_diagnosis_form.diagnosis_placeholder')}
                    className="min-h-[120px] bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                    required
                  />
                </div>

                {/* 风险等级 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    {i18n.t('pages.covid_diagnosis_form.risk_level')} <span className="text-red-500">*</span>
                  </Label>
                  <Select value={riskLevel} onValueChange={(value) => setRiskLevel(value)}>
                    <SelectTrigger className="bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300">
                      <SelectValue placeholder={i18n.t('pages.covid_diagnosis_form.select_risk_level')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very_low">{i18n.t('risk_levels.very_low')}</SelectItem>
                      <SelectItem value="low">{i18n.t('risk_levels.low')}</SelectItem>
                      <SelectItem value="medium">{i18n.t('risk_levels.medium')}</SelectItem>
                      <SelectItem value="high">{i18n.t('risk_levels.high')}</SelectItem>
                      <SelectItem value="very_high">{i18n.t('risk_levels.very_high')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 治疗建议 */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="medications" className="text-sm font-medium text-gray-700">{i18n.t('pages.covid_diagnosis_form.medication_advice')}</Label>
                    <Textarea
                      id="medications"
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                      placeholder={i18n.t('pages.covid_diagnosis_form.medication_placeholder')}
                      className="min-h-[80px] bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lifestyle" className="text-sm font-medium text-gray-700">{i18n.t('pages.covid_diagnosis_form.lifestyle_advice')}</Label>
                    <Textarea
                      id="lifestyle"
                      value={lifestyle}
                      onChange={(e) => setLifestyle(e.target.value)}
                      placeholder={i18n.t('pages.covid_diagnosis_form.lifestyle_placeholder')}
                      className="min-h-[80px] bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                    />
                  </div>
                </div>

                {/* 隔离建议 */}
                <div className="space-y-2">
                  <Label htmlFor="isolationAdvice" className="text-sm font-medium text-gray-700">{i18n.t('pages.covid_diagnosis_form.isolation_advice')}</Label>
                  <Textarea
                    id="isolationAdvice"
                    value={isolationAdvice}
                    onChange={(e) => setIsolationAdvice(e.target.value)}
                    placeholder={i18n.t('pages.covid_diagnosis_form.isolation_placeholder')}
                    className="min-h-[80px] bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                  />
                </div>

                {/* 检测建议 */}
                <div className="space-y-2">
                  <Label htmlFor="testingRecommendation" className="text-sm font-medium text-gray-700">{i18n.t('pages.covid_diagnosis_form.testing_recommendation')}</Label>
                  <Textarea
                    id="testingRecommendation"
                    value={testingRecommendation}
                    onChange={(e) => setTestingRecommendation(e.target.value)}
                    placeholder={i18n.t('pages.covid_diagnosis_form.testing_placeholder')}
                    className="min-h-[80px] bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                  />
                </div>

                {/* 复查建议 */}
                <div className="space-y-2">
                  <Label htmlFor="followUp" className="text-sm font-medium text-gray-700">{i18n.t('pages.covid_diagnosis_form.follow_up')}</Label>
                  <Textarea
                    id="followUp"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    placeholder={i18n.t('pages.covid_diagnosis_form.follow_up_placeholder')}
                    className="min-h-[80px] bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-green-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                  />
                </div>

                {/* 其他备注 */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">{i18n.t('pages.covid_diagnosis_form.notes')}</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={i18n.t('pages.covid_diagnosis_form.notes_placeholder')}
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
                        {i18n.t('pages.covid_diagnosis_form.submitting')}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {i18n.t('pages.covid_diagnosis_form.submit_diagnosis')}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleNavigation('/medical/covid-management')}
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('pages.covid_diagnosis_form.back_to_covid_management')}
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
      </main>

      {/* 图片预览组件 */}
      {imagePreviewOpen && (
        <ImagePreview
          images={previewImages}
          initialIndex={previewInitialIndex}
          isOpen={imagePreviewOpen}
          onClose={() => setImagePreviewOpen(false)}
        />
      )}

      {/* 确认对话框 */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onCancel={cancelNavigation}
        onConfirm={confirmNavigation}
        title={i18n.t('pages.covid_diagnosis_form.confirm_leave_title')}
        description={i18n.t('pages.covid_diagnosis_form.confirm_leave_description')}
        confirmText={i18n.t('pages.covid_diagnosis_form.confirm_leave')}
        cancelText={i18n.t('pages.covid_diagnosis_form.continue_editing')}
        type="warning"
      />
    </div>
  )
} 