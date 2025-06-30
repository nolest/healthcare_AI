import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx'
import { Badge } from '../ui/badge.jsx'
import { Button } from '../ui/button.jsx'
import { 
  Clock, 
  AlertTriangle, 
  Thermometer,
  Calendar,
  FileText,
  TrendingUp
} from 'lucide-react'

export default function CovidFluHistory({ assessments, onViewAssessment }) {
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

  if (!assessments || assessments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">暂无评估历史记录</p>
          <p className="text-sm text-gray-400">
            完成症状评估后，历史记录将显示在这里
          </p>
        </CardContent>
      </Card>
    )
  }

  // 按日期排序，最新的在前面
  const sortedAssessments = [...assessments].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            评估历史记录
          </CardTitle>
          <CardDescription>
            您的COVID-19和流感评估历史记录，共 {assessments.length} 次评估
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {sortedAssessments.map((assessment, index) => (
          <Card 
            key={assessment._id || assessment.id || index} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onViewAssessment && onViewAssessment(assessment)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="outline" className="text-sm">
                      {getAssessmentTypeText(assessment.assessmentType)}
                    </Badge>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${getRiskLevelColor(assessment.riskLevel)}`}>
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {getRiskLevelText(assessment.riskLevel)}
                    </div>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        最新
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">
                        风险评分: <span className="font-medium">{assessment.riskScore || 0}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <span className="text-sm">
                        体温: <span className="font-medium">
                          {assessment.temperature ? `${assessment.temperature}°C` : '未测量'}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {formatDate(assessment.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* 症状摘要 */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">症状:</span> {getSymptomSummary(assessment.symptoms)}
                    </p>
                  </div>

                  {/* 风险因子 */}
                  {assessment.riskFactors && assessment.riskFactors.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">风险因子:</span> {assessment.riskFactors.length} 项
                      </p>
                    </div>
                  )}

                  {/* 主要建议 */}
                  {assessment.recommendations && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">主要建议:</span>
                        {assessment.recommendations.medical && assessment.recommendations.medical.length > 0
                          ? assessment.recommendations.medical[0]
                          : assessment.recommendations.testing && assessment.recommendations.testing.length > 0
                          ? assessment.recommendations.testing[0]
                          : '保持健康习惯'
                        }
                      </p>
                    </div>
                  )}
                </div>
                
                <Button variant="ghost" size="sm" className="ml-4">
                  <FileText className="h-4 w-4 mr-2" />
                  查看详情
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 统计信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">评估统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {assessments.length}
              </p>
              <p className="text-xs text-gray-600">总评估次数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {assessments.filter(a => a.assessmentType === 'covid').length}
              </p>
              <p className="text-xs text-gray-600">COVID-19评估</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {assessments.filter(a => a.assessmentType === 'flu').length}
              </p>
              <p className="text-xs text-gray-600">流感评估</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {assessments.filter(a => a.riskLevel === 'high' || a.riskLevel === 'very_high').length}
              </p>
              <p className="text-xs text-gray-600">高风险评估</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 