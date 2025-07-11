import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { ArrowLeft, FileText, User, LogOut, Clock, AlertCircle, Eye } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n.js'

export default function PatientDiagnosesPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [diagnoses, setDiagnoses] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    i18n.addListener(handleLanguageChange)
    return () => i18n.removeListener(handleLanguageChange)
  }, [])

  useEffect(() => {
    const currentUser = apiService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      fetchDiagnoses()
    } else {
      navigate('/login')
    }
  }, [navigate])

  const fetchDiagnoses = async () => {
    try {
      const data = await apiService.getMyDiagnoses()
      setDiagnoses(data)
      
      // 计算未读诊断数量 (假设24小时内的诊断为新诊断)
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const unread = data.filter(d => new Date(d.created_at) > oneDayAgo).length
      setUnreadCount(unread)
    } catch (error) {
      console.error('Error fetching diagnoses:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (diagnosisId) => {
    try {
      // 这里可以添加标记为已读的API调用
      // await apiService.markDiagnosisAsRead(diagnosisId)
      console.log('Marking diagnosis as read:', diagnosisId)
    } catch (error) {
      console.error('Error marking diagnosis as read:', error)
    }
  }

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskLevelText = (riskLevel) => {
    switch (riskLevel) {
      case 'low':
        return i18n.t('risk_levels.low')
      case 'medium':
        return i18n.t('risk_levels.medium')
      case 'high':
        return i18n.t('risk_levels.high')
      case 'critical':
        return i18n.t('risk_levels.critical')
      default:
        return i18n.t('risk_levels.unknown')
    }
  }

  const isNewDiagnosis = (diagnosis) => {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    return new Date(diagnosis.created_at) > oneDayAgo
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/patient')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {i18n.t('common.back_to_menu')}
              </Button>
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">{i18n.t('pages.patient_diagnoses.title')}</h1>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-3">
                  {i18n.t('pages.patient_diagnoses.new_reports', { count: unreadCount })}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-700">{user?.username}</span>
              </div>
              <Button variant="outline" onClick={() => {
                apiService.logout()
                window.location.href = '/login'
              }}>
                <LogOut className="h-4 w-4 mr-2" />
                {i18n.t('common.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {diagnoses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{i18n.t('pages.patient_diagnoses.no_diagnoses_title')}</h3>
              <p className="text-gray-500">{i18n.t('pages.patient_diagnoses.no_diagnoses_description')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 统计信息 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{i18n.t('pages.patient_diagnoses.total_diagnoses')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{diagnoses.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{i18n.t('pages.patient_diagnoses.new_reports_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{i18n.t('pages.patient_diagnoses.high_risk_diagnoses')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {diagnoses.filter(d => d.risk_level === 'high' || d.risk_level === 'critical').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 诊断列表 */}
            <div className="space-y-4">
              {diagnoses.map((diagnosis) => (
                <Card key={diagnosis.id} className={`${isNewDiagnosis(diagnosis) ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{diagnosis.doctor_name || i18n.t('pages.patient_diagnoses.medical_staff')}</CardTitle>
                          {isNewDiagnosis(diagnosis) && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {i18n.t('pages.patient_diagnoses.new_report')}
                            </Badge>
                          )}
                          <Badge className={getRiskLevelColor(diagnosis.risk_level)}>
                            {getRiskLevelText(diagnosis.risk_level)}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(diagnosis.created_at).toLocaleString(language === 'zh-CN' ? 'zh-CN' : 'zh-TW', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                      {isNewDiagnosis(diagnosis) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(diagnosis.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {i18n.t('pages.patient_diagnoses.mark_as_read')}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{i18n.t('pages.patient_diagnoses.diagnosis_result')}</h4>
                        <p className="text-gray-700">{diagnosis.diagnosis}</p>
                      </div>
                      
                      {diagnosis.treatment_plan && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">{i18n.t('pages.patient_diagnoses.treatment_plan')}</h4>
                          <p className="text-gray-700">{diagnosis.treatment_plan}</p>
                        </div>
                      )}
                      
                      {diagnosis.notes && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">{i18n.t('pages.patient_diagnoses.notes')}</h4>
                          <p className="text-gray-700">{diagnosis.notes}</p>
                        </div>
                      )}
                      
                      {diagnosis.follow_up_date && (
                        <div className="flex items-center text-sm text-blue-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {i18n.t('pages.patient_diagnoses.next_follow_up', { 
                            date: new Date(diagnosis.follow_up_date).toLocaleDateString(language === 'zh-CN' ? 'zh-CN' : 'zh-TW') 
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 