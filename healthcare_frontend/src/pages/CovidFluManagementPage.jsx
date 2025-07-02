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
  MapPin
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

export default function CovidFluManagementPage() {
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
    dateRange: 'all',
    assessmentType: 'all'
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
    loadCovidAssessments()
  }, [navigate])

  const loadCovidAssessments = async () => {
    setLoading(true)
    try {
      const response = await apiService.getAllCovidAssessments()
      console.log('COVID评估数据:', response)
      
      if (response.success && response.data) {
        // 确保数据格式正确，添加用户信息
        const assessmentsWithUserInfo = response.data.map((assessment) => {
          // 检查 userId 是否已经被 populate 了
          const userInfo = assessment.userId && typeof assessment.userId === 'object' 
            ? assessment.userId 
            : null

          return {
            ...assessment,
            patientInfo: userInfo || {
              fullName: '未知患者',
              username: typeof assessment.userId === 'string' ? assessment.userId : assessment.userId?._id || '未知',
              age: null,
              gender: '未知'
            }
          }
        })
        
        setCovidAssessments(assessmentsWithUserInfo)
        setFilteredAssessments(assessmentsWithUserInfo)
        
        // 计算统计数据
        calculateStats(assessmentsWithUserInfo)
      } else {
        setCovidAssessments([])
        setFilteredAssessments([])
      }
    } catch (error) {
      console.error('获取COVID评估数据失败:', error)
      setCovidAssessments([])
      setFilteredAssessments([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (assessments) => {
    const stats = {
      total: assessments.length,
      highRisk: assessments.filter(a => a.riskLevel === 'high').length,
      mediumRisk: assessments.filter(a => a.riskLevel === 'medium').length,
      lowRisk: assessments.filter(a => a.riskLevel === 'low').length,
      recentAssessments: assessments.filter(a => {
        const assessmentDate = new Date(a.createdAt)
        const now = new Date()
        const diffTime = Math.abs(now - assessmentDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 7
      }).length
    }
    
    setStats(stats)
  }

  const getRiskLevelLabel = (riskLevel) => {
    const labels = {
      high: '高風險',
      medium: '中風險',
      low: '低風險'
    }
    return labels[riskLevel] || '未知'
  }

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAssessmentTypeLabel = (type) => {
    const labels = {
      covid: 'COVID',
      flu: '流感',
      both: 'COVID/流感'
    }
    return labels[type] || 'COVID'
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
    
    // 评估类型筛选
    if (filters.assessmentType !== 'all') {
      filtered = filtered.filter(assessment => assessment.assessmentType === filters.assessmentType)
    }
    
    // 日期范围筛选
    if (filters.dateRange !== 'all') {
      const now = new Date()
      let daysAgo = 0
      
      switch (filters.dateRange) {
        case 'today':
          daysAgo = 1
          break
        case 'week':
          daysAgo = 7
          break
        case 'month':
          daysAgo = 30
          break
      }
      
      if (daysAgo > 0) {
        const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
        filtered = filtered.filter(assessment => new Date(assessment.createdAt) >= cutoffDate)
      }
    }
    
    setFilteredAssessments(filtered)
  }

  const resetFilters = () => {
    setFilters({
      patientId: '',
      patientName: '',
      riskLevel: 'all',
      dateRange: 'all',
      assessmentType: 'all'
    })
    setFilteredAssessments(covidAssessments)
  }

  const handleViewDetail = (assessment) => {
    // 导航到评估详情页面
    navigate(`/medical/covid-assessment/${assessment._id}`)
  }

  const handleCreateDiagnosis = (assessment) => {
    // 导航到创建诊断页面
    navigate(`/medical/covid-diagnosis/form?assessmentId=${assessment._id}`)
  }

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <MedicalHeader 
        title="COVID/流感評估管理"
        subtitle="專業疫情評估數據管理"
        icon={Shield}
        showBackButton={true}
        user={currentUser}
        onBack={() => navigate('/medical')}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        {/* 统计概览 */}
        {stats && (
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">總評估數</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">高風險</p>
                      <p className="text-2xl font-bold text-red-600">{stats.highRisk}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">中風險</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.mediumRisk}</p>
                    </div>
                    <Activity className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">低風險</p>
                      <p className="text-2xl font-bold text-green-600">{stats.lowRisk}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">近期評估</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.recentAssessments}</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 筛选区域 */}
        <Card className="mb-6 bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              篩選條件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="patientId">患者ID</Label>
                <Input
                  id="patientId"
                  placeholder="輸入患者ID..."
                  value={filters.patientId}
                  onChange={(e) => setFilters(prev => ({ ...prev, patientId: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="patientName">患者姓名</Label>
                <Input
                  id="patientName"
                  placeholder="輸入患者姓名..."
                  value={filters.patientName}
                  onChange={(e) => setFilters(prev => ({ ...prev, patientName: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="riskLevel">風險等級</Label>
                <Select value={filters.riskLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇風險等級" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="high">高風險</SelectItem>
                    <SelectItem value="medium">中風險</SelectItem>
                    <SelectItem value="low">低風險</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="assessmentType">評估類型</Label>
                <Select value={filters.assessmentType} onValueChange={(value) => setFilters(prev => ({ ...prev, assessmentType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇評估類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="covid">COVID</SelectItem>
                    <SelectItem value="flu">流感</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="dateRange">時間範圍</Label>
                <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇時間範圍" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="today">今天</SelectItem>
                    <SelectItem value="week">近一週</SelectItem>
                    <SelectItem value="month">近一月</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4 mr-2" />
                應用篩選
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                重置
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 评估数据表格 */}
        <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                COVID/流感評估記錄 ({filteredAssessments.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAssessments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暫無評估記錄</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>患者信息</TableHead>
                      <TableHead>評估類型</TableHead>
                      <TableHead>風險等級</TableHead>
                      <TableHead>主要症狀</TableHead>
                      <TableHead>體溫</TableHead>
                      <TableHead>評估時間</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssessments.map((assessment) => (
                      <TableRow key={assessment._id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{assessment.patientInfo.fullName}</p>
                              <p className="text-sm text-gray-500">{assessment.patientInfo.username}</p>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {getAssessmentTypeLabel(assessment.assessmentType)}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={getRiskLevelColor(assessment.riskLevel)}>
                            {getRiskLevelLabel(assessment.riskLevel)}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="max-w-32">
                            {assessment.symptoms && assessment.symptoms.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {assessment.symptoms.slice(0, 2).map((symptom, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {symptom}
                                  </Badge>
                                ))}
                                {assessment.symptoms.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{assessment.symptoms.length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">無症狀記錄</span>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {assessment.temperature ? (
                            <div className="flex items-center gap-1">
                              <Thermometer className="h-4 w-4 text-orange-500" />
                              <span className={assessment.temperature > 37.5 ? 'text-red-600 font-medium' : ''}>
                                {assessment.temperature}°C
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">未記錄</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatDate(assessment.createdAt)}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetail(assessment)}
                              className="h-8 px-3"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              查看
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleCreateDiagnosis(assessment)}
                              className="h-8 px-3 bg-green-600 hover:bg-green-700"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              診斷
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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