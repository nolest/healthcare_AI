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

export default function CovidManagementPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [covidAssessments, setCovidAssessments] = useState([])
  const [filteredAssessments, setFilteredAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  
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
    { value: 'fever', label: '發燒' },
    { value: 'cough', label: '咳嗽' },
    { value: 'shortness_breath', label: '呼吸困難' },
    { value: 'loss_taste_smell', label: '味覺嗅覺喪失' },
    { value: 'fatigue', label: '疲勞' },
    { value: 'body_aches', label: '肌肉疼痛' },
    { value: 'headache', label: '頭痛' },
    { value: 'sore_throat', label: '喉嚨痛' },
    { value: 'runny_nose', label: '流鼻涕' },
    { value: 'nausea', label: '噁心' },
    { value: 'diarrhea', label: '腹瀉' },
    { value: 'chills', label: '寒顫' }
  ]

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
      'very_high': '極高風險',
      'high': '高風險',
      'medium': '中風險',
      'low': '低風險',
      'very_low': '極低風險'
    }
    return labels[riskLevel] || '未知風險'
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
      'pending': '待處理',
      'processed': '已處理',
      'reviewed': '已審核'
    }
    return labels[status] || '未知狀態'
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
      return '昨天'
    } else if (diffDays <= 7) {
      return `${diffDays} 天前`
    } else {
      return date.toLocaleDateString('zh-TW', {
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
          <p className="mt-4 text-gray-600">載入中...</p>
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
        title="COVID管理"
        subtitle="COVID/流感評估數據管理與診斷"
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
              COVID/流感測量統計
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50/80 to-blue-100/60 backdrop-blur-md border-0 shadow-2xl shadow-blue-500/15">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600">總記錄數</CardTitle>
                  <Shield className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                  <p className="text-xs text-blue-600/70">COVID/流感評估記錄</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50/80 to-orange-100/60 backdrop-blur-md border-0 shadow-2xl shadow-orange-500/15">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-600">待處理</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-700">{stats.pending}</div>
                  <p className="text-xs text-orange-600/70">未進行診斷</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50/80 to-green-100/60 backdrop-blur-md border-0 shadow-2xl shadow-green-500/15">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">已處理</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{stats.processed}</div>
                  <p className="text-xs text-green-600/70">已進行診斷</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50/80 to-purple-100/60 backdrop-blur-md border-0 shadow-2xl shadow-purple-500/15">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-600">處理率</CardTitle>
                  <Activity className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">{stats.processingRate}%</div>
                  <p className="text-xs text-purple-600/70">診斷完成率</p>
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
                篩選異常
              </CardTitle>
              <CardDescription className="text-gray-600">
                使用多個條件來篩選需要診斷的COVID/流感評估記錄
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="patientId" className="text-sm font-medium text-gray-700">患者ID</Label>
                  <Input
                    id="patientId"
                    placeholder="輸入患者ID..."
                    className="mt-1 bg-white/70 border-green-200 focus:border-green-400"
                    value={filters.patientId}
                    onChange={(e) => setFilters(prev => ({ ...prev, patientId: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="patientName" className="text-sm font-medium text-gray-700">患者姓名</Label>
                  <Input
                    id="patientName"
                    placeholder="輸入患者姓名..."
                    className="mt-1 bg-white/70 border-green-200 focus:border-green-400"
                    value={filters.patientName}
                    onChange={(e) => setFilters(prev => ({ ...prev, patientName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">風險等級</Label>
                  <Select value={filters.riskLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevel: value }))}>
                    <SelectTrigger className="mt-1 bg-white/70 border-green-200 focus:border-green-400">
                      <SelectValue placeholder="選擇風險等級" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部等級</SelectItem>
                      <SelectItem value="very_high">極高風險</SelectItem>
                      <SelectItem value="high">高風險</SelectItem>
                      <SelectItem value="medium">中風險</SelectItem>
                      <SelectItem value="low">低風險</SelectItem>
                      <SelectItem value="very_low">極低風險</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">時間範圍</Label>
                  <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                    <SelectTrigger className="mt-1 bg-white/70 border-green-200 focus:border-green-400">
                      <SelectValue placeholder="選擇時間範圍" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部時間</SelectItem>
                      <SelectItem value="today">今天</SelectItem>
                      <SelectItem value="week">最近一週</SelectItem>
                      <SelectItem value="month">最近一月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* 症状多选 */}
              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">症狀篩選（可多選）</Label>
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
                  應用篩選
                </Button>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="border-green-200 hover:bg-green-50"
                >
                  重置篩選
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
              風險列表 ({filteredAssessments.length})
            </CardTitle>
            <CardDescription className="text-gray-600">
              點擊"查看詳情"按鈕查看患者COVID/流感評估詳情並進行診斷
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">載入COVID評估數據中...</p>
              </div>
            ) : filteredAssessments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暫無COVID評估數據</h3>
                <p>目前沒有需要診斷的COVID/流感評估記錄</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>患者信息</TableHead>
                      <TableHead>風險等級</TableHead>
                      <TableHead>主要症狀</TableHead>
                      <TableHead>體溫</TableHead>
                      <TableHead>評估時間</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>操作</TableHead>
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
                                  {assessment.patientInfo?.fullName || assessment.patientInfo?.username || '未知患者'}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span>ID: {(typeof assessment.userId === 'string' ? assessment.userId : assessment.userId?._id || '').slice(-8)}</span>
                                  {assessment.patientInfo?.gender && (
                                    <Badge variant="outline" className="text-xs">
                                      {assessment.patientInfo.gender === 'male' ? '男' : 
                                       assessment.patientInfo.gender === 'female' ? '女' : '未知'}
                                    </Badge>
                                  )}
                                  {assessment.patientInfo?.age && (
                                    <Badge variant="outline" className="text-xs">
                                      {assessment.patientInfo.age}歲
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
                                {assessment.temperature ? `${assessment.temperature}°C` : '未記錄'}
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
                              查看詳情
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