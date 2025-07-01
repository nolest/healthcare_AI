import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { FileText, Clock, Activity, Shield, AlertTriangle, Eye } from 'lucide-react'
import PatientHeader from '../components/ui/PatientHeader.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n.js'

export default function PatientDiagnosisReportsPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    
    return () => {
      i18n.removeListener(handleLanguageChange)
    }
  }, [])

  useEffect(() => {
    const currentUser = apiService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      fetchDiagnosisReports()
    } else {
      navigate('/login')
    }
  }, [navigate])

  const fetchDiagnosisReports = async () => {
    try {
      setLoading(true)
      const data = await apiService.getPatientDiagnosisReports(apiService.getCurrentUser().userId)
      setReports(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch (error) {
      console.error('获取诊断报告失败:', error)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewReport = async (reportId) => {
    try {
      // 标记为已读并跳转到详情页
      await apiService.markDiagnosisReportAsRead(reportId)
      navigate(`/patient/diagnosis-reports/${reportId}`)
      // 刷新列表以更新已读状态
      fetchDiagnosisReports()
    } catch (error) {
      console.error('打开报告失败:', error)
    }
  }

  const getReportTypeText = (reportType) => {
    switch (reportType) {
      case 'measurement': return '生命體徵測量'
      case 'covid_flu': return 'COVID/流感評估'
      default: return '未知類型'
    }
  }

  const getReportTypeIcon = (reportType) => {
    switch (reportType) {
      case 'measurement': return Activity
      case 'covid_flu': return Shield
      default: return FileText
    }
  }

  const getReportTypeColor = (reportType) => {
    switch (reportType) {
      case 'measurement': return 'from-green-500 to-emerald-600'
      case 'covid_flu': return 'from-purple-500 to-indigo-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return <Badge className="bg-red-600 text-white">緊急</Badge>
      case 'high':
        return <Badge className="bg-red-500 text-white">高優先級</Badge>
      case 'medium':
        return <Badge className="bg-yellow-500 text-white">中等</Badge>
      case 'low':
        return <Badge className="bg-green-500 text-white">低優先級</Badge>
      default:
        return <Badge variant="outline">普通</Badge>
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <PatientHeader 
        title="診斷報告"
        subtitle="查看醫護人員的診斷結果和醫療建議"
        icon={FileText}
        showBackButton={true}
        user={user}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl shadow-blue-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">總報告數</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{reports.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl shadow-purple-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">未讀報告</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {reports.filter(r => !r.isRead).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl shadow-green-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">最新報告</CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-green-600">
                {reports.length > 0 ? formatDate(reports[0].createdAt).split(' ')[0] : '無'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 报告列表 */}
        <Card className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl shadow-blue-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              <FileText className="h-6 w-6 text-blue-600" />
              診斷報告列表
            </CardTitle>
            <CardDescription className="text-gray-600">
              您的醫療診斷報告和醫生建議
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">暫無診斷報告</p>
                <p className="text-gray-400">完成健康評估後，醫護人員會為您提供診斷報告</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => {
                  const ReportIcon = getReportTypeIcon(report.reportType)
                  return (
                    <div 
                      key={report._id} 
                      className={`bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${!report.isRead ? 'ring-2 ring-blue-500/50' : ''}`}
                      onClick={() => handleViewReport(report._id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-gradient-to-br ${getReportTypeColor(report.reportType)} rounded-xl shadow-lg`}>
                            <ReportIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              {getReportTypeText(report.reportType)}
                              {!report.isRead && (
                                <Badge className="bg-blue-500 text-white text-xs">未讀</Badge>
                              )}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              {formatDate(report.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {report.urgency && getUrgencyBadge(report.urgency)}
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/50 border-blue-200 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            查看
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">診斷結果</h4>
                          <p className="text-sm text-gray-600 bg-white/50 rounded-lg p-3">
                            {report.diagnosis || '診斷進行中...'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">醫生建議</h4>
                          <p className="text-sm text-gray-600 bg-white/50 rounded-lg p-3">
                            {report.recommendation || '建議制定中...'}
                          </p>
                        </div>
                      </div>

                      {report.doctorId && (
                        <div className="mt-4 pt-4 border-t border-gray-200/50">
                          <p className="text-xs text-gray-500">
                            診斷醫生：{report.doctorId.fullName || report.doctorId.username}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 