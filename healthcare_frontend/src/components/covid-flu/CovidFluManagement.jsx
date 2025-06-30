import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx'
import { Badge } from '../ui/badge.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx'
import { Alert, AlertDescription } from '../ui/alert.jsx'
import { 
  Users, 
  Search, 
  Filter,
  AlertTriangle, 
  User,
  Calendar,
  TrendingUp,
  Thermometer,
  FileText,
  Download,
  RefreshCw,
  Eye,
  Edit
} from 'lucide-react'
import apiService from '../../services/api.js'

export default function CovidFluManagement({ user }) {
  const [assessments, setAssessments] = useState([])
  const [filteredAssessments, setFilteredAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadAllAssessments()
  }, [])

  useEffect(() => {
    filterAssessments()
  }, [searchTerm, riskFilter, typeFilter, dateFilter, assessments])

  const loadAllAssessments = async () => {
    setLoading(true)
    try {
      const allAssessments = await apiService.getAllCovidAssessments()
      console.log('Loaded all COVID assessments:', allAssessments)
      
      // 处理评估数据，确保包含患者信息
      const processedAssessments = allAssessments.map(assessment => ({
        ...assessment,
        patientId: assessment.userId?._id || assessment.userId,
        patientName: assessment.userId?.fullName || assessment.userId?.username || assessment.userId,
        patientEmail: assessment.userId?.email || '',
        assessmentType: assessment.assessmentType || 'covid'
      }))
      
      setAssessments(processedAssessments)
      setFilteredAssessments(processedAssessments)
    } catch (error) {
      console.error('Error loading assessments:', error)
      setAssessments([])
      setFilteredAssessments([])
    } finally {
      setLoading(false)
    }
  }

  const filterAssessments = () => {
    let filtered = [...assessments]

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(assessment => 
        (assessment.patientName && assessment.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (assessment.patientId && assessment.patientId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (assessment.patientEmail && assessment.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // 风险等级过滤
    if (riskFilter !== 'all') {
      filtered = filtered.filter(assessment => assessment.riskLevel === riskFilter)
    }

    // 评估类型过滤
    if (typeFilter !== 'all') {
      filtered = filtered.filter(assessment => assessment.assessmentType === typeFilter)
    }

    // 日期过滤
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(assessment => 
            new Date(assessment.createdAt) >= filterDate
          )
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          filtered = filtered.filter(assessment => 
            new Date(assessment.createdAt) >= filterDate
          )
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          filtered = filtered.filter(assessment => 
            new Date(assessment.createdAt) >= filterDate
          )
          break
      }
    }

    // 按创建时间排序，最新的在前面
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    setFilteredAssessments(filtered)
  }

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'very_high':
        return 'bg-red-600'
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      case 'very_low':
        return 'bg-green-400'
      default:
        return 'bg-gray-500'
    }
  }

  const getRiskLevelText = (riskLevel) => {
    switch (riskLevel) {
      case 'very_high': return '极高风险'
      case 'high': return '高风险'
      case 'medium': return '中等风险'
      case 'low': return '低风险'
      case 'very_low': return '极低风险'
      default: return '未知风险'
    }
  }

  const getAssessmentTypeText = (type) => {
    return type === 'covid' ? 'COVID-19' : '流感'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSymptomSummary = (symptoms) => {
    if (!symptoms || symptoms.length === 0) return '无症状'
    if (symptoms.length <= 3) return symptoms.join(', ')
    return `${symptoms.slice(0, 3).join(', ')} 等${symptoms.length}个症状`
  }

  const handleViewDetails = (assessment) => {
    setSelectedAssessment(assessment)
    setShowDetails(true)
  }

  const handleExportData = async () => {
    try {
      // 这里可以实现导出功能
      console.log('Exporting assessment data:', filteredAssessments)
      // 可以调用API导出CSV或Excel文件
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const getStats = () => {
    const total = filteredAssessments.length
    const highRisk = filteredAssessments.filter(a => 
      a.riskLevel === 'high' || a.riskLevel === 'very_high'
    ).length
    const covid = filteredAssessments.filter(a => a.assessmentType === 'covid').length
    const flu = filteredAssessments.filter(a => a.assessmentType === 'flu').length
    
    return { total, highRisk, covid, flu }
  }

  const stats = getStats()

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">加载患者评估数据中...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 搜索和过滤 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                患者评估管理
              </CardTitle>
              <CardDescription className="text-sm">
                管理和监控所有患者的COVID-19和流感评估记录
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadAllAssessments}>
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索患者姓名或ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            {/* 风险等级过滤 */}
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="风险等级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有风险等级</SelectItem>
                <SelectItem value="very_high">极高风险</SelectItem>
                <SelectItem value="high">高风险</SelectItem>
                <SelectItem value="medium">中等风险</SelectItem>
                <SelectItem value="low">低风险</SelectItem>
                <SelectItem value="very_low">极低风险</SelectItem>
              </SelectContent>
            </Select>

            {/* 评估类型过滤 */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="评估类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                <SelectItem value="covid">COVID-19</SelectItem>
                <SelectItem value="flu">流感</SelectItem>
              </SelectContent>
            </Select>

            {/* 日期过滤 */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="时间范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有时间</SelectItem>
                <SelectItem value="today">今天</SelectItem>
                <SelectItem value="week">最近一周</SelectItem>
                <SelectItem value="month">最近一月</SelectItem>
              </SelectContent>
            </Select>

            {/* 清除过滤器 */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchTerm('')
                setRiskFilter('all')
                setTypeFilter('all')
                setDateFilter('all')
              }}
              className="h-9"
            >
              <Filter className="h-4 w-4 mr-2" />
              清除过滤
            </Button>
          </div>

          {/* 快速统计信息 */}
          <div className="flex flex-wrap gap-4 mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm">
              <span className="text-gray-600">总数:</span>
              <span className="font-medium ml-1 text-blue-600">{stats.total}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">高风险:</span>
              <span className="font-medium ml-1 text-red-600">{stats.highRisk}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">COVID-19:</span>
              <span className="font-medium ml-1 text-green-600">{stats.covid}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">流感:</span>
              <span className="font-medium ml-1 text-purple-600">{stats.flu}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 评估记录列表 */}
      {filteredAssessments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || riskFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all' 
                ? '未找到匹配的评估记录' 
                : '暂无患者评估记录'
              }
            </p>
            {(searchTerm || riskFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setRiskFilter('all')
                  setTypeFilter('all')
                  setDateFilter('all')
                }}
                className="mt-2"
              >
                清除所有过滤条件
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAssessments.map((assessment, index) => (
            <Card key={assessment._id || assessment.id || index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-sm">
                          {assessment.patientName || assessment.patientId}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getAssessmentTypeText(assessment.assessmentType)}
                      </Badge>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-white text-xs font-medium ${getRiskLevelColor(assessment.riskLevel)}`}>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {getRiskLevelText(assessment.riskLevel)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-blue-500" />
                        <span className="text-xs">
                          风险评分: <span className="font-medium">{assessment.riskScore || 0}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-3 w-3 text-red-500" />
                        <span className="text-xs">
                          体温: <span className="font-medium">
                            {assessment.temperature ? `${assessment.temperature}°C` : '未测量'}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span className="text-xs">
                          评估时间: <span className="font-medium">{formatDate(assessment.createdAt)}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3 text-purple-500" />
                        <span className="text-xs">
                          症状: <span className="font-medium">{getSymptomSummary(assessment.symptoms)}</span>
                        </span>
                      </div>
                    </div>
                    
                    {assessment.recommendations && assessment.recommendations.length > 0 && (
                      <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                        <strong>建议:</strong> {assessment.recommendations.slice(0, 2).join('; ')}
                        {assessment.recommendations.length > 2 && '...'}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(assessment)}
                      className="h-8 px-3"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      详情
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 详情弹窗 - 这里可以实现一个详细的评估查看弹窗 */}
      {showDetails && selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">评估详情</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">患者信息</h4>
                <p>姓名: {selectedAssessment.patientName}</p>
                <p>ID: {selectedAssessment.patientId}</p>
                <p>评估时间: {formatDate(selectedAssessment.createdAt)}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">风险评估</h4>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${getRiskLevelColor(selectedAssessment.riskLevel)}`}>
                  {getRiskLevelText(selectedAssessment.riskLevel)}
                </div>
                <p className="mt-2">评分: {selectedAssessment.riskScore} 分</p>
              </div>
              
              {selectedAssessment.symptoms && selectedAssessment.symptoms.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">症状</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAssessment.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="outline">{symptom}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedAssessment.recommendations && (
                <div>
                  <h4 className="font-medium mb-2">建议措施</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedAssessment.recommendations).map(([category, items]) => (
                      items.length > 0 && (
                        <div key={category}>
                          <h5 className="text-sm font-medium text-gray-700 capitalize">{category}</h5>
                          <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                            {items.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 