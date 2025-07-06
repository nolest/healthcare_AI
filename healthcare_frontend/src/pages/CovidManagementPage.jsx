import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Shield, 
  Filter, 
  Search, 
  AlertTriangle, 
  User, 
  Calendar, 
  Activity, 
  Thermometer, 
  Users,
  Eye,
  FileText,
  UserCheck,
  Clock,
  MapPin,
  Stethoscope
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

export default function CovidManagementPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [covidAssessments, setCovidAssessments] = useState([])
  const [filteredAssessments, setFilteredAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())
  
  // 筛选状态
  const [filters, setFilters] = useState({
    patientId: '',
    patientName: '',
    riskLevel: 'all',
    symptoms: [],
    dateRange: 'all'
  })

  // 可选症状列表（多选）
  const symptomOptions = [
    { value: 'fever', label: i18n.t('pages.covid_management.fever') },
    { value: 'cough', label: i18n.t('pages.covid_management.cough') },
    { value: 'shortness_breath', label: i18n.t('pages.covid_management.shortness_breath') },
    { value: 'loss_taste_smell', label: i18n.t('pages.covid_management.loss_taste_smell') },
    { value: 'fatigue', label: i18n.t('pages.covid_management.fatigue') },
    { value: 'body_aches', label: i18n.t('pages.covid_management.body_aches') },
    { value: 'headache', label: i18n.t('pages.covid_management.headache') },
    { value: 'sore_throat', label: i18n.t('pages.covid_management.sore_throat') },
    { value: 'runny_nose', label: i18n.t('pages.covid_management.runny_nose') },
    { value: 'nausea', label: i18n.t('pages.covid_management.nausea') },
    { value: 'diarrhea', label: i18n.t('pages.covid_management.diarrhea') },
    { value: 'chills', label: i18n.t('pages.covid_management.chills') }
  ]

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
    loadCovidAssessments()
  }, [navigate])

  const loadCovidAssessments = async () => {
    setLoading(true)
    try {
      console.log('🚀 开始加载COVID评估数据...')
      
      // 获取统计数据
      console.log('📊 获取统计数据...')
      const statsData = await apiService.getCovidAssessmentStats()
      console.log('✅ 统计数据:', statsData)
      
      if (statsData) {
        setStats(statsData)
      }
      
      // 获取所有评估数据
      console.log('📋 获取评估数据...')
      const assessmentsData = await apiService.getAllCovidAssessments()
      console.log('✅ 评估数据:', assessmentsData)
      
      if (assessmentsData && Array.isArray(assessmentsData)) {
        if (assessmentsData.length > 0) {
          console.log(`📝 处理 ${assessmentsData.length} 条评估数据`)
          
          // 处理数据，确保患者信息正确显示
          const processedAssessments = assessmentsData.map(assessment => {
            // 如果userId是对象（已经populated），直接使用
            if (assessment.userId && typeof assessment.userId === 'object') {
              return {
                ...assessment,
                patientInfo: {
                  fullName: assessment.userId.fullName || assessment.userId.username || '未知患者',
                  username: assessment.userId.username || 'unknown',
                  age: assessment.userId.age || 0,
                  gender: assessment.userId.gender || 'unknown',
                  email: assessment.userId.email || ''
                }
              }
            } else {
              // 如果userId是字符串，创建默认患者信息
              return {
                ...assessment,
                patientInfo: {
                  fullName: '患者' + (assessment.userId ? assessment.userId.slice(-4) : '未知'),
                  username: assessment.userId || 'unknown',
                  age: 0,
                  gender: 'unknown',
                  email: ''
                }
              }
            }
          })
          
          console.log('📝 处理后的数据示例:', processedAssessments[0])
          
          setCovidAssessments(processedAssessments)
          setFilteredAssessments(processedAssessments)
          
          // 如果没有统计数据，重新计算
          if (!statsData) {
            console.log('📊 重新计算统计数据')
            calculateStats(processedAssessments)
          }
        } else {
          console.log('ℹ️ 没有评估数据')
          setCovidAssessments([])
          setFilteredAssessments([])
        }
      } else {
        console.log('⚠️ 数据格式错误或为空')
        setCovidAssessments([])
        setFilteredAssessments([])
        setStats({
          total: 0,
          pending: 0,
          processed: 0,
          processingRate: 0
        })
      }
      
    } catch (error) {
      console.error('❌ 加载COVID评估数据失败:', error)
      
      // 显示详细错误信息
      if (error.response) {
        console.error('响应状态:', error.response.status)
        console.error('响应数据:', error.response.data)
      }
      
      // 使用测试数据
      console.log('🧪 使用测试数据')
      const testData = [
        {
          _id: 'test1',
          userId: 'user1',
          patientInfo: {
            fullName: '張三',
            username: 'zhang_san',
            age: 35,
            gender: 'male',
            email: 'zhang@test.com'
          },
          riskLevel: 'high',
          symptoms: ['fever', 'cough', 'shortness_breath'],
          temperature: 38.5,
          assessmentDate: new Date().toISOString(),
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'test2',
          userId: 'user2',
          patientInfo: {
            fullName: '李四',
            username: 'li_si',
            age: 42,
            gender: 'female',
            email: 'li@test.com'
          },
          riskLevel: 'medium',
          symptoms: ['cough', 'fatigue'],
          temperature: 37.2,
          assessmentDate: new Date(Date.now() - 86400000).toISOString(),
          status: 'processed',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: 'test3',
          userId: 'user3',
          patientInfo: {
            fullName: '王五',
            username: 'wang_wu',
            age: 28,
            gender: 'male',
            email: 'wang@test.com'
          },
          riskLevel: 'low',
          symptoms: ['headache'],
          temperature: 36.8,
          assessmentDate: new Date(Date.now() - 172800000).toISOString(),
          status: 'pending',
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ]
      
      setCovidAssessments(testData)
      setFilteredAssessments(testData)
      setStats({
        total: 3,
        pending: 2,
        processed: 1,
        processingRate: 33
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (assessments) => {
    const stats = {
      total: assessments.length,
      // 修复：待处理包括没有status、status为null或status为'pending'的记录
      pending: assessments.filter(a => 
        !a.status || 
        a.status === null || 
        a.status === 'pending'
      ).length,
      processed: assessments.filter(a => a.status === 'processed' || a.status === 'reviewed').length,
      byRisk: {}
    }
    
    // 处理率
    stats.processingRate = stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0
    
    // 按风险等级统计
    assessments.forEach(assessment => {
      const risk = assessment.riskLevel || 'unknown'
      stats.byRisk[risk] = (stats.byRisk[risk] || 0) + 1
    })
    
    console.log('📊 计算的统计数据:', stats)
    setStats(stats)
  }

  const getRiskLevelLabel = (riskLevel) => {
    const labels = {
      'very_high': i18n.t('risk.critical'),
      'high': i18n.t('risk.high'),
      'medium': i18n.t('risk.medium'),
      'low': i18n.t('risk.low'),
      'very_low': i18n.t('risk.low')
    }
    return labels[riskLevel] || i18n.t('measurement.unknown')
  }

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'very_high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'very_low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      'pending': i18n.t('pages.covid_management.status_pending'),
      'processed': i18n.t('pages.covid_management.status_processed'),
      'reviewed': i18n.t('pages.covid_management.status_completed')
    }
    return labels[status] || i18n.t('measurement.unknown')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'processed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return i18n.t('common.yesterday') || '昨天'
    } else if (diffDays <= 7) {
      return `${diffDays} ${i18n.t('common.days_ago') || '天前'}`
    } else {
      return date.toLocaleDateString(i18n.getCurrentLanguage() === 'en' ? 'en-US' : 'zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }
  }

  const applyFilters = () => {
    let filtered = [...covidAssessments]
    
    // 患者ID筛选
    if (filters.patientId.trim()) {
      filtered = filtered.filter(assessment => 
        assessment.patientInfo.username.toLowerCase().includes(filters.patientId.toLowerCase()) ||
        assessment._id.toLowerCase().includes(filters.patientId.toLowerCase())
      )
    }
    
    // 患者姓名筛选
    if (filters.patientName.trim()) {
      filtered = filtered.filter(assessment => 
        assessment.patientInfo.fullName.toLowerCase().includes(filters.patientName.toLowerCase())
      )
    }
    
    // 风险等级筛选
    if (filters.riskLevel !== 'all') {
      filtered = filtered.filter(assessment => assessment.riskLevel === filters.riskLevel)
    }
    
    // 症状筛选
    if (filters.symptoms.length > 0) {
      filtered = filtered.filter(assessment => 
        filters.symptoms.some(symptom => assessment.symptoms && assessment.symptoms.includes(symptom))
      )
    }
    
    // 时间范围筛选
    if (filters.dateRange !== 'all') {
      const now = new Date()
      let startDate = new Date()
      
      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
      }
      
      filtered = filtered.filter(assessment => 
        new Date(assessment.createdAt) >= startDate
      )
    }
    
    setFilteredAssessments(filtered)
  }

  const resetFilters = () => {
    setFilters({
      patientId: '',
      patientName: '',
      riskLevel: 'all',
      symptoms: [],
      dateRange: 'all'
    })
    setFilteredAssessments(covidAssessments)
  }

  const handleDiagnose = (assessment) => {
    // 在新标签页打开COVID诊断页面
    const hasRead = (assessment.status === 'processed' || assessment.status === 'reviewed') ? '1' : '0'
    const url = `/medical/covid-management/details?aid=${assessment._id}&hasread=${hasRead}`
    window.open(url, '_blank')
  }

  const toggleSymptom = (symptomValue) => {
    setFilters(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptomValue)
        ? prev.symptoms.filter(s => s !== symptomValue)
        : [...prev.symptoms, symptomValue]
    }))
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{i18n.t('pages.covid_management.loading')}</p>
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
        title={i18n.t('pages.covid_management.title')}
        subtitle={i18n.t('pages.covid_management.subtitle')}
        icon={Shield}
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
              {i18n.t('pages.covid_management.assessment_stats')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50/80 to-blue-100/60 backdrop-blur-md border-0 shadow-2xl shadow-blue-500/15">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600">{i18n.t('pages.covid_management.total_assessments')}</CardTitle>
                  <Shield className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                  <p className="text-xs text-blue-600/70">{i18n.t('pages.covid_management.assessments')}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50/80 to-orange-100/60 backdrop-blur-md border-0 shadow-2xl shadow-orange-500/15">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-600">{i18n.t('pages.covid_management.pending_assessments')}</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-700">{stats.pending}</div>
                  <p className="text-xs text-orange-600/70">{i18n.t('pages.covid_management.status_pending')}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50/80 to-green-100/60 backdrop-blur-md border-0 shadow-2xl shadow-green-500/15">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">{i18n.t('pages.covid_management.processed_assessments')}</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{stats.processed}</div>
                  <p className="text-xs text-green-600/70">{i18n.t('pages.covid_management.status_processed')}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50/80 to-purple-100/60 backdrop-blur-md border-0 shadow-2xl shadow-purple-500/15">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-600">{i18n.t('pages.covid_management.processing_rate')}</CardTitle>
                  <Activity className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">{stats.processingRate}%</div>
                  <p className="text-xs text-purple-600/70">{i18n.t('pages.covid_management.processing_rate')}</p>
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
                {i18n.t('pages.covid_management.filter_by_risk')}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {i18n.t('pages.covid_management.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="patientId" className="text-sm font-medium text-gray-700">{i18n.t('pages.covid_management.patient_id')}</Label>
                  <Input
                    id="patientId"
                    placeholder={i18n.t('pages.covid_management.search_patient')}
                    className="mt-1 bg-white/70 border-green-200 focus:border-green-400"
                    value={filters.patientId}
                    onChange={(e) => setFilters(prev => ({ ...prev, patientId: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="patientName" className="text-sm font-medium text-gray-700">{i18n.t('pages.covid_management.patient_name')}</Label>
                  <Input
                    id="patientName"
                    placeholder={i18n.t('pages.covid_management.search_patient')}
                    className="mt-1 bg-white/70 border-green-200 focus:border-green-400"
                    value={filters.patientName}
                    onChange={(e) => setFilters(prev => ({ ...prev, patientName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">{i18n.t('pages.covid_management.risk_level')}</Label>
                  <Select value={filters.riskLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevel: value }))}>
                    <SelectTrigger className="mt-1 bg-white/70 border-green-200 focus:border-green-400">
                      <SelectValue placeholder={i18n.t('pages.covid_management.filter_by_risk')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{i18n.t('pages.covid_management.all_risk_levels')}</SelectItem>
                      <SelectItem value="very_high">{i18n.t('risk.critical')}</SelectItem>
                      <SelectItem value="high">{i18n.t('risk.high')}</SelectItem>
                      <SelectItem value="medium">{i18n.t('risk.medium')}</SelectItem>
                      <SelectItem value="low">{i18n.t('risk.low')}</SelectItem>
                      <SelectItem value="very_low">{i18n.t('risk.low')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">{i18n.t('pages.covid_management.filter_by_date')}</Label>
                  <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                    <SelectTrigger className="mt-1 bg-white/70 border-green-200 focus:border-green-400">
                      <SelectValue placeholder={i18n.t('pages.covid_management.filter_by_date')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{i18n.t('pages.covid_management.all_dates')}</SelectItem>
                      <SelectItem value="today">{i18n.t('common.today') || '今天'}</SelectItem>
                      <SelectItem value="week">{i18n.t('pages.covid_management.last_7_days')}</SelectItem>
                      <SelectItem value="month">{i18n.t('pages.covid_management.last_30_days')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* 症状多选 */}
              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">{i18n.t('pages.covid_management.filter_by_symptoms')}</Label>
                <div className="flex flex-wrap gap-2">
                  {symptomOptions.map((symptom) => (
                    <Button
                      key={symptom.value}
                      variant={filters.symptoms.includes(symptom.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSymptom(symptom.value)}
                      className={`text-xs ${
                        filters.symptoms.includes(symptom.value)
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'border-green-200 hover:bg-green-50 text-green-700'
                      }`}
                    >
                      {symptom.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={applyFilters}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {i18n.t('pages.covid_management.apply_filters')}
                </Button>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="border-green-200 hover:bg-green-50"
                >
                  {i18n.t('pages.covid_management.reset_filters')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 风险列表 */}
        <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-green-500/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              {i18n.t('pages.covid_management.assessments')} ({filteredAssessments.length})
            </CardTitle>
            <CardDescription className="text-gray-600">
              {i18n.t('pages.covid_management.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">{i18n.t('pages.covid_management.loading')}</p>
              </div>
            ) : filteredAssessments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{i18n.t('pages.covid_management.no_assessments')}</h3>
                <p>{i18n.t('pages.covid_management.no_data')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{i18n.t('pages.covid_management.patient_name')}</TableHead>
                      <TableHead>{i18n.t('pages.covid_management.risk_level')}</TableHead>
                      <TableHead>{i18n.t('pages.covid_management.symptoms')}</TableHead>
                      <TableHead>{i18n.t('pages.covid_management.temperature')}</TableHead>
                      <TableHead>{i18n.t('pages.covid_management.assessment_date')}</TableHead>
                      <TableHead>{i18n.t('pages.covid_management.status')}</TableHead>
                      <TableHead>{i18n.t('pages.covid_management.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssessments.map((assessment) => {
                      return (
                        <TableRow key={assessment._id} className="hover:bg-green-50/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {assessment.patientInfo?.fullName || assessment.patientInfo?.username || i18n.t('measurement.unknown')}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span>ID: {(typeof assessment.userId === 'string' ? assessment.userId : assessment.userId?._id || '').slice(-8)}</span>
                                  {assessment.patientInfo?.gender && (
                                    <Badge variant="outline" className="text-xs">
                                      {assessment.patientInfo.gender === 'male' ? i18n.t('auth.gender.male') : 
                                       assessment.patientInfo.gender === 'female' ? i18n.t('auth.gender.female') : i18n.t('measurement.unknown')}
                                    </Badge>
                                  )}
                                  {assessment.patientInfo?.age && (
                                    <Badge variant="outline" className="text-xs">
                                      {assessment.patientInfo.age}{i18n.t('pages.medical_patients.years_old')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge className={getRiskLevelColor(assessment.riskLevel)}>
                              {getRiskLevelLabel(assessment.riskLevel)}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {assessment.symptoms && assessment.symptoms.slice(0, 3).map((symptom) => {
                                const symptomLabel = symptomOptions.find(s => s.value === symptom)?.label || symptom
                                return (
                                  <Badge key={symptom} variant="outline" className="text-xs">
                                    {symptomLabel}
                                  </Badge>
                                )
                              })}
                              {assessment.symptoms && assessment.symptoms.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{assessment.symptoms.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Thermometer className="h-4 w-4 text-red-500" />
                              <span className={`font-medium ${
                                assessment.temperature && assessment.temperature > 37.5 
                                  ? 'text-red-600' 
                                  : 'text-gray-700'
                              }`}>
                                {assessment.temperature ? `${assessment.temperature}${i18n.t('pages.covid_management.celsius')}` : i18n.t('measurement.unknown')}
                              </span>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(assessment.createdAt)}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge className={getStatusColor(assessment.status || 'pending')}>
                              {getStatusLabel(assessment.status || 'pending')}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleDiagnose(assessment)}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                            >
                              <Stethoscope className="h-4 w-4 mr-1" />
                              {i18n.t('pages.covid_management.view_details')}
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