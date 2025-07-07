import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Activity,
  Thermometer,
  User,
  Calendar,
  FileText,
  TrendingUp,
  Users,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/input.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n'

export default function PatientCovidAssessments({ user, onPatientSelect }) {
  const [assessments, setAssessments] = useState([])
  const [filteredAssessments, setFilteredAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    loadAllCovidAssessments()
    
    return () => {
      i18n.removeListener(handleLanguageChange)
    }
  }, [])

  useEffect(() => {
    // 根據搜索詞過濾評估記錄
    if (searchTerm.trim() === '') {
      setFilteredAssessments(assessments)
    } else {
      const filtered = assessments.filter(assessment => 
        assessment.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assessment.patient_name && assessment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredAssessments(filtered)
    }
  }, [searchTerm, assessments])

  const loadAllCovidAssessments = async () => {
    try {
      // 使用真实API获取COVID评估记录
      const covidAssessments = await apiService.getAllCovidAssessments()
      console.log('Loaded COVID assessments from API:', covidAssessments)
      
      // 评估记录已经包含患者信息
      const assessmentsWithNames = covidAssessments.map(assessment => ({
        ...assessment,
        user_id: assessment.userId?._id || assessment.userId,
        patient_name: assessment.userId?.fullName || assessment.userId?.name || assessment.userId,
        assessment_type: assessment.assessmentType || 'covid',
        risk_level: assessment.riskLevel || 'low'
      }))
      
      setAssessments(assessmentsWithNames)
      setFilteredAssessments(assessmentsWithNames)
    } catch (error) {
      console.error('Error loading COVID assessments:', error)
      setAssessments([])
      setFilteredAssessments([])
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevelColor = (riskLevel) => {
    if (!riskLevel) return 'bg-gray-500'
    
    const level = typeof riskLevel === 'string' ? riskLevel : riskLevel.label
    
    switch (level) {
      case '高風險':
      case 'high':
        return 'bg-red-500'
      case '中等風險':
      case '中風險':
      case 'medium':
        return 'bg-yellow-500'
      case '低風險':
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getRiskLevelText = (riskLevel) => {
    if (!riskLevel) return '未知風險'
    
    if (typeof riskLevel === 'string') {
      switch (riskLevel) {
        case 'high': return '高風險'
        case 'medium': return '中風險'
        case 'low': return '低風險'
        default: return riskLevel
      }
    }
    
    return riskLevel.label || '未知風險'
  }

  const getAssessmentStats = () => {
    const total = filteredAssessments.length
    const covidCount = filteredAssessments.filter(a => a.assessment_type === 'covid').length
    const fluCount = filteredAssessments.filter(a => a.assessment_type === 'flu').length
    const highRiskCount = filteredAssessments.filter(a => {
      const level = typeof a.risk_level === 'string' ? a.risk_level : (a.risk_level && a.risk_level.label)
      return level === '高風險' || level === 'high'
    }).length
    
    return { total, covidCount, fluCount, highRiskCount }
  }

  const handlePatientDiagnosis = (assessment) => {
    // 創建一個患者對象用於診斷
    const patient = {
      id: assessment.user_id,
      username: assessment.user_id,
      fullName: assessment.patient_name || assessment.user_id,
      full_name: assessment.patient_name || assessment.user_id,
      covidAssessment: assessment
    }
    
    console.log('Selecting patient for diagnosis:', patient)
    
    if (onPatientSelect) {
      onPatientSelect(patient)
    }
  }

  const t = (key) => i18n.t(key)
  const stats = getAssessmentStats()

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">載入患者COVID評估記錄中...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 統計概覽 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">{t('assessment.stats.total_assessments')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.covidCount}</div>
            <div className="text-sm text-gray-600">{t('assessment.stats.covid_assessments')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.fluCount}</div>
            <div className="text-sm text-gray-600">{t('assessment.stats.flu_assessments')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.highRiskCount}</div>
            <div className="text-sm text-gray-600">{t('assessment.stats.high_risk_assessments')}</div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索功能 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            患者COVID評估記錄
          </CardTitle>
          <CardDescription>
            查看所有患者的COVID-19和流感評估結果，點擊"診斷"為患者提供專業建議
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索患者ID或姓名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* 評估記錄列表 */}
      {filteredAssessments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? '未找到匹配的評估記錄' : '暫無患者COVID-19或流感評估記錄'}
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                className="mt-2"
              >
                清除搜索
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssessments.map((assessment, index) => (
            <Card key={assessment.id || index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {assessment.patient_name || assessment.user_id}
                        </span>
                      </div>
                      <Badge variant="outline">
                        {assessment.assessment_type === 'covid' ? t('assessment.type.covid') : t('assessment.type.flu')}
                      </Badge>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm ${getRiskLevelColor(assessment.risk_level)}`}>
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {getRiskLevelText(assessment.risk_level)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">
                          風險評分: <span className="font-medium">{assessment.risk_score || 0}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className="text-sm">
                          體溫: <span className="font-medium">{assessment.temperature || '未測量'}°C</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {new Date(assessment.assessed_at || assessment.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* 症狀摘要 */}
                    {assessment.symptoms && assessment.symptoms.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">主要症狀:</p>
                        <div className="flex flex-wrap gap-1">
                          {assessment.symptoms.slice(0, 5).map((symptom, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                          {assessment.symptoms.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{assessment.symptoms.length - 5} 更多
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 建議摘要 */}
                    {assessment.recommendations && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">系統建議:</p>
                        <p className="line-clamp-2">
                          {assessment.recommendations.immediate && assessment.recommendations.immediate.length > 0
                            ? assessment.recommendations.immediate[0]
                            : '請查看詳細評估結果'}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <Button 
                      onClick={() => handlePatientDiagnosis(assessment)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      診斷
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

