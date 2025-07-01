import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { FileText, Activity, Shield, Clock, User, AlertTriangle, Calendar, Pill, Monitor } from 'lucide-react'
import PatientHeader from '../components/ui/PatientHeader.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n.js'

export default function PatientDiagnosisReportDetailPage() {
  const navigate = useNavigate()
  const { reportId } = useParams()
  const [user, setUser] = useState(null)
  const [report, setReport] = useState(null)
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
      fetchReportDetail()
    } else {
      navigate('/login')
    }
  }, [navigate, reportId])

  const fetchReportDetail = async () => {
    try {
      setLoading(true)
      // 获取报告详情（自动标记为已读）
      const data = await apiService.getDiagnosisReportDetail(reportId)
      setReport(data)
    } catch (error) {
      console.error('获取报告详情失败:', error)
      navigate('/patient/diagnosis-reports')
    } finally {
      setLoading(false)
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

  const renderMeasurementData = (sourceData) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">生命體徵數據</h4>
          {sourceData.bloodPressure && (
            <div className="bg-white/50 rounded-lg p-3">
              <span className="text-sm font-medium">血壓：</span>
              <span className="text-sm">{sourceData.bloodPressure}</span>
            </div>
          )}
          {sourceData.heartRate && (
            <div className="bg-white/50 rounded-lg p-3">
              <span className="text-sm font-medium">心率：</span>
              <span className="text-sm">{sourceData.heartRate} bpm</span>
            </div>
          )}
          {sourceData.temperature && (
            <div className="bg-white/50 rounded-lg p-3">
              <span className="text-sm font-medium">體溫：</span>
              <span className="text-sm">{sourceData.temperature}°C</span>
            </div>
          )}
          {sourceData.oxygenSaturation && (
            <div className="bg-white/50 rounded-lg p-3">
              <span className="text-sm font-medium">血氧飽和度：</span>
              <span className="text-sm">{sourceData.oxygenSaturation}%</span>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">其他信息</h4>
          {sourceData.weight && (
            <div className="bg-white/50 rounded-lg p-3">
              <span className="text-sm font-medium">體重：</span>
              <span className="text-sm">{sourceData.weight} kg</span>
            </div>
          )}
          {sourceData.symptoms && (
            <div className="bg-white/50 rounded-lg p-3">
              <span className="text-sm font-medium">症狀：</span>
              <span className="text-sm">{sourceData.symptoms}</span>
            </div>
          )}
          {sourceData.notes && (
            <div className="bg-white/50 rounded-lg p-3">
              <span className="text-sm font-medium">備註：</span>
              <span className="text-sm">{sourceData.notes}</span>
            </div>
          )}
          <div className="bg-white/50 rounded-lg p-3">
            <span className="text-sm font-medium">測量時間：</span>
            <span className="text-sm">{formatDate(sourceData.createdAt)}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderCovidAssessmentData = (sourceData) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">評估信息</h4>
            <div className="space-y-2">
              <div className="bg-white/50 rounded-lg p-3">
                <span className="text-sm font-medium">評估類型：</span>
                <span className="text-sm">{sourceData.assessmentType === 'covid' ? 'COVID-19' : '流感'}</span>
              </div>
              {sourceData.temperature && (
                <div className="bg-white/50 rounded-lg p-3">
                  <span className="text-sm font-medium">體溫：</span>
                  <span className="text-sm">{sourceData.temperature}°C</span>
                </div>
              )}
              {sourceData.riskLevel && (
                <div className="bg-white/50 rounded-lg p-3">
                  <span className="text-sm font-medium">風險等級：</span>
                  <span className="text-sm">{sourceData.riskLevelLabel || sourceData.riskLevel}</span>
                </div>
              )}
              <div className="bg-white/50 rounded-lg p-3">
                <span className="text-sm font-medium">評估時間：</span>
                <span className="text-sm">{formatDate(sourceData.createdAt)}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">症狀記錄</h4>
            {sourceData.symptoms && sourceData.symptoms.length > 0 ? (
              <div className="bg-white/50 rounded-lg p-3">
                <div className="flex flex-wrap gap-1">
                  {sourceData.symptoms.map((symptom, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/50 rounded-lg p-3">
                <span className="text-sm text-gray-500">無症狀記錄</span>
              </div>
            )}
          </div>
        </div>

        {(sourceData.exposureHistory || sourceData.travelHistory || sourceData.contactHistory) && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">接觸史</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sourceData.exposureHistory && (
                <div className="bg-white/50 rounded-lg p-3">
                  <span className="text-sm font-medium">接觸史：</span>
                  <span className="text-sm">{sourceData.exposureHistory}</span>
                </div>
              )}
              {sourceData.travelHistory && (
                <div className="bg-white/50 rounded-lg p-3">
                  <span className="text-sm font-medium">旅行史：</span>
                  <span className="text-sm">{sourceData.travelHistory}</span>
                </div>
              )}
              {sourceData.contactHistory && (
                <div className="bg-white/50 rounded-lg p-3">
                  <span className="text-sm font-medium">密切接觸史：</span>
                  <span className="text-sm">{sourceData.contactHistory}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">報告不存在或無權訪問</p>
        </div>
      </div>
    )
  }

  const ReportIcon = getReportTypeIcon(report.reportType)

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
        title="診斷報告詳情"
        subtitle="查看詳細的診斷結果和醫療建議"
        icon={FileText}
        showBackButton={true}
        backPath="/patient/diagnosis-reports"
        user={user}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        {/* 报告概览 */}
        <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl shadow-blue-500/10 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 bg-gradient-to-br ${getReportTypeColor(report.reportType)} rounded-xl shadow-lg`}>
                  <ReportIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    {getReportTypeText(report.reportType)}診斷報告
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatDate(report.createdAt)}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {report.urgency && getUrgencyBadge(report.urgency)}
                {report.isRead && (
                  <Badge className="bg-green-500 text-white">已讀</Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 医生诊断 */}
          <div className="space-y-6">
            <Card className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl shadow-blue-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                  <User className="h-5 w-5 text-blue-600" />
                  醫生診斷與建議
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">診斷結果</h4>
                  <div className="bg-white/60 rounded-lg p-4">
                    <p className="text-gray-800">{report.diagnosis}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">醫生建議</h4>
                  <div className="bg-white/60 rounded-lg p-4">
                    <p className="text-gray-800">{report.recommendation}</p>
                  </div>
                </div>

                {report.treatment && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      治療方案
                    </h4>
                    <div className="bg-white/60 rounded-lg p-4">
                      <p className="text-gray-800">{report.treatment}</p>
                    </div>
                  </div>
                )}

                {report.notes && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">醫生備註</h4>
                    <div className="bg-white/60 rounded-lg p-4">
                      <p className="text-gray-800">{report.notes}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200/50">
                  <p className="text-sm text-gray-600">
                    診斷醫生：{report.doctorId?.fullName || report.doctorId?.username || '未知'}
                  </p>
                  {report.followUpDate && (
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4" />
                      復診日期：{formatDate(report.followUpDate)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* COVID/流感特有信息 */}
            {report.reportType === 'covid_flu' && (
              <Card className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl shadow-purple-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
                    <Monitor className="h-5 w-5 text-purple-600" />
                    專項指導
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report.isolationDays && (
                    <div className="bg-white/60 rounded-lg p-4">
                      <span className="font-medium text-gray-700">隔離建議：</span>
                      <span className="text-gray-800"> {report.isolationDays} 天</span>
                    </div>
                  )}
                  
                  {report.testingRecommendation && (
                    <div className="bg-white/60 rounded-lg p-4">
                      <span className="font-medium text-gray-700">檢測建議：</span>
                      <p className="text-gray-800 mt-1">{report.testingRecommendation}</p>
                    </div>
                  )}

                  {report.medicationPrescription && (
                    <div className="bg-white/60 rounded-lg p-4">
                      <span className="font-medium text-gray-700">藥物處方：</span>
                      <p className="text-gray-800 mt-1">{report.medicationPrescription}</p>
                    </div>
                  )}

                  {report.monitoringInstructions && (
                    <div className="bg-white/60 rounded-lg p-4">
                      <span className="font-medium text-gray-700">監測指示：</span>
                      <p className="text-gray-800 mt-1">{report.monitoringInstructions}</p>
                    </div>
                  )}

                  {report.returnToWorkDate && (
                    <div className="bg-white/60 rounded-lg p-4">
                      <span className="font-medium text-gray-700">預計復工日期：</span>
                      <span className="text-gray-800"> {formatDate(report.returnToWorkDate)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* 患者数据 */}
          <div>
            <Card className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl shadow-green-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                  <Activity className="h-5 w-5 text-green-600" />
                  患者數據
                </CardTitle>
                <CardDescription>
                  您提交的原始健康數據
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.sourceDataSnapshot ? (
                  report.reportType === 'measurement' ? 
                    renderMeasurementData(report.sourceDataSnapshot) :
                    renderCovidAssessmentData(report.sourceDataSnapshot)
                ) : (
                  <p className="text-gray-500">數據快照不可用</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 