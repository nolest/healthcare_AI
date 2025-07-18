import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.jsx'
import { 
  Users, 
  Search, 
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Activity,
  Stethoscope,
  Info
} from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import MedicalHeader from '../components/ui/MedicalHeader.jsx'
import apiService from '../services/api.js'
import i18n from '../utils/i18n.js'

export default function MedicalPatientsPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())
  const [filters, setFilters] = useState({
    name: '',
    patientId: '',
    ageMin: '',
    ageMax: '',
    registrationDateStart: '',
    registrationDateEnd: '',
    nextCheckupStart: '',
    nextCheckupEnd: ''
  })

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
    loadData()
  }, [navigate])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // 获取所有用户数据、测量数据和COVID评估数据
      const [usersData, measurementsResponse, covidAssessmentsResponse] = await Promise.all([
        apiService.getUsers(),
        apiService.getAllMeasurements(),
        apiService.getAllCovidAssessments()
      ])

      console.log('🔍 加载用户数据:', usersData)
      console.log('📊 加载测量数据:', measurementsResponse)
      console.log('🦠 加载COVID评估数据:', covidAssessmentsResponse)

      // 确保数据是数组格式
      const measurementsData = Array.isArray(measurementsResponse) ? measurementsResponse : 
                              (measurementsResponse?.data && Array.isArray(measurementsResponse.data)) ? measurementsResponse.data : []
      
      const covidAssessmentsData = Array.isArray(covidAssessmentsResponse) ? covidAssessmentsResponse : 
                                  (covidAssessmentsResponse?.data && Array.isArray(covidAssessmentsResponse.data)) ? covidAssessmentsResponse.data : []

      const usersDataArray = Array.isArray(usersData) ? usersData : 
                            (usersData?.data && Array.isArray(usersData.data)) ? usersData.data : []

      console.log('✅ 验证后的数据:', {
        measurementsCount: measurementsData.length,
        covidAssessmentsCount: covidAssessmentsData.length,
        usersCount: usersDataArray.length
      })

      // 过滤出患者角色的用户
      const patientUsers = usersDataArray.filter(user => user.role === 'patient')
      console.log('👥 患者用户数量:', patientUsers.length)
      
      // 为每个患者计算统计信息
      const patientsWithStats = await Promise.all(
        patientUsers.map(async (patient) => {
          try {
            // 获取患者的测量数据
            const patientMeasurements = Array.isArray(measurementsData) ? 
              measurementsData.filter(m => {
                // 处理userId可能是对象或字符串的情况
                const measurementUserId = typeof m.userId === 'object' ? m.userId._id : m.userId;
                return measurementUserId === patient._id;
              }) : []
            
            // 获取患者的COVID评估数据
            const patientCovidAssessments = Array.isArray(covidAssessmentsData) ? 
              covidAssessmentsData.filter(c => {
                // 处理userId可能是对象或字符串的情况
                const assessmentUserId = typeof c.userId === 'object' ? c.userId._id : c.userId;
                return assessmentUserId === patient._id;
              }) : []
            
            // 获取患者的诊断记录
            let diagnoses = []
            try {
              const diagnosesResponse = await apiService.getPatientDiagnoses(patient._id)
              diagnoses = Array.isArray(diagnosesResponse) ? diagnosesResponse : 
                         (diagnosesResponse?.data && Array.isArray(diagnosesResponse.data)) ? diagnosesResponse.data : []
            } catch (error) {
              console.warn(`无法获取患者 ${patient._id} 的诊断记录:`, error)
              diagnoses = []
            }

            // 计算年龄
            const age = patient.dateOfBirth 
              ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
              : null

            // 检查是否有异常测量值
            const hasAbnormalMeasurements = Array.isArray(patientMeasurements) && patientMeasurements.some(measurement => {
              return measurement.systolic > 140 || measurement.systolic < 90 ||
                     measurement.diastolic > 90 || measurement.diastolic < 60 ||
                     measurement.heartRate > 100 || measurement.heartRate < 60 ||
                     measurement.temperature > 37.3 || measurement.temperature < 36.0 ||
                     measurement.oxygenSaturation < 95
            })

            // 查找最近的诊断记录中的下次检查时间
            const latestDiagnosis = diagnoses.length > 0 
              ? diagnoses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
              : null

            const patientWithStats = {
              ...patient,
              age,
              measurementCount: patientMeasurements.length,
              covidAssessmentCount: patientCovidAssessments.length,
              hasAbnormalMeasurements,
              latestMeasurement: (Array.isArray(patientMeasurements) && patientMeasurements.length > 0) 
                ? patientMeasurements.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp))[0]
                : null,
              nextCheckupDate: latestDiagnosis?.recommendations?.nextCheckup || null,
              diagnosisCount: diagnoses.length
            }

            console.log(`📋 患者 ${patient.fullName || patient.username} 统计:`, {
              measurementCount: patientWithStats.measurementCount,
              covidAssessmentCount: patientWithStats.covidAssessmentCount,
              hasAbnormalMeasurements: patientWithStats.hasAbnormalMeasurements,
              diagnosisCount: patientWithStats.diagnosisCount
            })

            return patientWithStats
          } catch (error) {
            console.error(`处理患者 ${patient._id} 数据时出错:`, error)
            return {
              ...patient,
              age: null,
              measurementCount: 0,
              covidAssessmentCount: 0,
              hasAbnormalMeasurements: false,
              latestMeasurement: null,
              nextCheckupDate: null,
              diagnosisCount: 0
            }
          }
        })
      )

      console.log('👥 处理后的患者数据:', patientsWithStats)

      setPatients(patientsWithStats)
      setFilteredPatients(patientsWithStats)

      // 计算统计数据
      const totalPatients = patientsWithStats.length
      
      // 测量统计 - 确保数据是数组
      const totalMeasurements = Array.isArray(measurementsData) ? measurementsData.length : 0
      const normalMeasurements = Array.isArray(measurementsData) ? measurementsData.filter(m => {
        return !(m.systolic > 140 || m.systolic < 90 ||
                m.diastolic > 90 || m.diastolic < 60 ||
                m.heartRate > 100 || m.heartRate < 60 ||
                m.temperature > 37.3 || m.temperature < 36.0 ||
                m.oxygenSaturation < 95)
      }).length : 0
      const abnormalMeasurements = totalMeasurements - normalMeasurements

      // 今日测量统计
      const today = new Date().toDateString()
      const todayMeasurements = Array.isArray(measurementsData) ? measurementsData.filter(m => {
        return new Date(m.createdAt || m.timestamp).toDateString() === today
      }).length : 0

      // COVID评估统计 - 确保数据是数组
      const totalCovidAssessments = Array.isArray(covidAssessmentsData) ? covidAssessmentsData.length : 0
      const patientCovidAssessments = totalCovidAssessments // 患者提交的总次数
      
      // 获取医生诊断后异常的次数（高风险评估）
      const highRiskCovidAssessments = Array.isArray(covidAssessmentsData) ? covidAssessmentsData.filter(assessment => {
        // 根据风险等级判断异常 - 假设'high'为异常
        return assessment.riskLevel === 'high' || assessment.riskLevel === 'medium'
      }).length : 0

      const statsData = {
        totalPatients,
        todayMeasurements,
        // 测量数据饼图
        measurementStats: {
          total: totalMeasurements,
          normal: normalMeasurements,
          abnormal: abnormalMeasurements
        },
        // COVID评估数据饼图
        covidStats: {
          total: totalCovidAssessments,
          patientSubmissions: patientCovidAssessments,
          doctorDiagnosedAbnormal: highRiskCovidAssessments
        }
      }

      console.log('📊 统计数据:', statsData)
      setStats(statsData)

    } catch (error) {
      console.error('加载患者数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 筛选功能
  const applyFilters = () => {
    let filtered = [...patients]

    // 按姓名筛选
    if (filters.name.trim()) {
      filtered = filtered.filter(patient => 
        patient.fullName?.toLowerCase().includes(filters.name.toLowerCase()) ||
        patient.username?.toLowerCase().includes(filters.name.toLowerCase())
      )
    }

    // 按患者ID筛选
    if (filters.patientId.trim()) {
      filtered = filtered.filter(patient => 
        patient._id.toLowerCase().includes(filters.patientId.toLowerCase())
      )
    }

    // 按年龄范围筛选
    if (filters.ageMin) {
      filtered = filtered.filter(patient => patient.age >= parseInt(filters.ageMin))
    }
    if (filters.ageMax) {
      filtered = filtered.filter(patient => patient.age <= parseInt(filters.ageMax))
    }

    // 按注册时间筛选
    if (filters.registrationDateStart) {
      filtered = filtered.filter(patient => 
        new Date(patient.createdAt) >= new Date(filters.registrationDateStart)
      )
    }
    if (filters.registrationDateEnd) {
      filtered = filtered.filter(patient => 
        new Date(patient.createdAt) <= new Date(filters.registrationDateEnd)
      )
    }

    // 按下次检查时间筛选
    if (filters.nextCheckupStart && filters.nextCheckupStart) {
      filtered = filtered.filter(patient => {
        if (!patient.nextCheckupDate) return false
        return new Date(patient.nextCheckupDate) >= new Date(filters.nextCheckupStart)
      })
    }
    if (filters.nextCheckupEnd) {
      filtered = filtered.filter(patient => {
        if (!patient.nextCheckupDate) return false
        return new Date(patient.nextCheckupDate) <= new Date(filters.nextCheckupEnd)
      })
    }

    setFilteredPatients(filtered)
  }

  const resetFilters = () => {
    setFilters({
      name: '',
      patientId: '',
      ageMin: '',
      ageMax: '',
      registrationDateStart: '',
      registrationDateEnd: '',
      nextCheckupStart: '',
      nextCheckupEnd: ''
    })
    setFilteredPatients(patients)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '未設定'
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const handlePatientClick = (patientId) => {
    // 跳转到患者详情页面，通过查询参数传递患者ID
    navigate(`/medical/patients-management/details?patientId=${patientId}`)
  }

  // 获取测量数据饼图配置
  const getMeasurementChartOption = () => {
    if (!stats) return {}
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 5,
        itemWidth: 8,
        itemHeight: 8,
        textStyle: {
          fontSize: 9
        }
      },
      series: [
        {
          name: '測量數據',
          type: 'pie',
          radius: ['30%', '80%'],
          center: ['50%', '40%'],
          avoidLabelOverlap: false,
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: stats.measurementStats.normal,
              name: '正常',
              itemStyle: { color: '#10b981' }
            },
            {
              value: stats.measurementStats.abnormal,
              name: '異常',
              itemStyle: { color: '#ef4444' }
            }
          ]
        }
      ]
    }
  }

  // 获取COVID评估饼图配置
  const getCovidChartOption = () => {
    if (!stats) return {}
    
    const normalCount = stats.covidStats.patientSubmissions - stats.covidStats.doctorDiagnosedAbnormal
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 5,
        itemWidth: 8,
        itemHeight: 8,
        textStyle: {
          fontSize: 9
        }
      },
      series: [
        {
          name: 'COVID評估',
          type: 'pie',
          radius: ['30%', '80%'],
          center: ['50%', '40%'],
          avoidLabelOverlap: false,
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: normalCount,
              name: '正常',
              itemStyle: { color: '#3b82f6' }
            },
            {
              value: stats.covidStats.doctorDiagnosedAbnormal,
              name: '異常',
              itemStyle: { color: '#f59e0b' }
            }
          ]
        }
      ]
    }
  }

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{i18n.t('pages.medical_patients.loading')}</p>
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
        title={i18n.t('pages.medical_patients.title')}
        subtitle={i18n.t('pages.medical_patients.subtitle')}
        icon={Users}
        showBackButton={true}
        user={currentUser}
        onBack={() => navigate('/medical')}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        {/* 统计概览 - 三列简洁布局 */}
        {stats && (
          <div className="mb-8">
            <h3 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-6">
              {i18n.t('pages.medical_patients.statistics')}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 第一列：患者综合统计 */}
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-6 w-6 text-blue-600" />
                    <span className="text-lg font-medium text-gray-700">{i18n.t('pages.medical_patients.overview')}</span>
                  </div>
                  
                  {/* 统计数据网格 */}
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalPatients}</div>
                      <p className="text-xs text-gray-600">{i18n.t('pages.medical_patients.total_patients')}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {patients.filter(p => p.hasAbnormalMeasurements).length}
                      </div>
                      <p className="text-xs text-gray-600">{i18n.t('pages.medical_patients.patients_with_abnormal')}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {patients.filter(p => p.nextCheckupDate && new Date(p.nextCheckupDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
                      </div>
                      <p className="text-xs text-gray-600">{i18n.t('pages.medical_patients.patients_need_followup')}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {patients.filter(p => {
                          if (!p.latestMeasurement) return false
                          const daysSinceLastMeasurement = Math.floor((new Date() - new Date(p.latestMeasurement.createdAt || p.latestMeasurement.timestamp)) / (24 * 60 * 60 * 1000))
                          return daysSinceLastMeasurement <= 30
                        }).length}
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <p className="text-xs text-gray-600">{i18n.t('pages.medical_patients.active_patients')}</p>
                        <div className="relative group">
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-50">
                            <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                              30天内有测量记录的患者
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 快速概览指标 */}
                  <div className="mt-4 pt-3 border-t border-gray-200 w-full">
                    <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>今日測量:</span>
                        <span className="font-medium text-blue-600">
                          {stats.todayMeasurements}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>平均年齡:</span>
                        <span className="font-medium text-gray-700">
                          {patients.length > 0 ? 
                            Math.round(patients.filter(p => p.age).reduce((sum, p) => sum + p.age, 0) / patients.filter(p => p.age).length) || '未知'
                            : '未知'
                          }歲
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>健康率:</span>
                        <span className="font-medium text-green-600">
                          {patients.length > 0 ? 
                            Math.round(((patients.length - patients.filter(p => p.hasAbnormalMeasurements).length) / patients.length) * 100)
                            : 0
                          }%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 第二列：测量数据饼图 */}
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mt-3 mb-1">
                    <Activity className="h-6 w-6 text-gray-700" />
                    <span className="text-lg font-medium text-gray-700">測量數據</span>
                  </div>
                  <div className="w-full h-52">
                    <ReactECharts 
                      option={getMeasurementChartOption()} 
                      style={{ height: '100%', width: '100%' }}
                      opts={{ renderer: 'svg' }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {i18n.t('pages.medical_patients.total_measurements')}: {stats.measurementStats.total} {i18n.t('pages.medical_patients.times')}
                  </div>
                </div>
              </div>

              {/* 第三列：COVID评估饼图 */}
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mt-3 mb-1">
                    <Stethoscope className="h-6 w-6 text-gray-700" />
                    <span className="text-lg font-medium text-gray-700">{i18n.t('pages.medical_patients.covid_chart_title')}</span>
                  </div>
                  <div className="w-full h-52">
                    <ReactECharts 
                      option={getCovidChartOption()} 
                      style={{ height: '100%', width: '100%' }}
                      opts={{ renderer: 'svg' }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {i18n.t('pages.medical_patients.total_covid_assessments')}: {stats.covidStats.total} {i18n.t('pages.medical_patients.times')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 筛选功能 */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-green-500/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <Filter className="h-5 w-5 text-green-600" />
                {i18n.t('pages.medical_patients.filter_patients')}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {i18n.t('pages.medical_patients.use_multiple_conditions')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">{i18n.t('pages.medical_patients.patient_name')}</Label>
                  <Input
                    id="name"
                    placeholder={i18n.t('pages.medical_patients.search_placeholder')}
                    className="mt-1 bg-white/70 border-green-200 focus:border-green-400"
                    value={filters.name}
                    onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="patientId" className="text-sm font-medium text-gray-700">{i18n.t('pages.medical_patients.patient_id')}</Label>
                  <Input
                    id="patientId"
                    placeholder={i18n.t('pages.medical_patients.search_placeholder')}
                    className="mt-1 bg-white/70 border-green-200 focus:border-green-400"
                    value={filters.patientId}
                    onChange={(e) => setFilters(prev => ({ ...prev, patientId: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">{i18n.t('pages.medical_patients.filter_by_age')}</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      placeholder={i18n.t('pages.medical_patients.age_min')}
                      className="bg-white/70 border-green-200 focus:border-green-400"
                      value={filters.ageMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, ageMin: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder={i18n.t('pages.medical_patients.age_max')}
                      className="bg-white/70 border-green-200 focus:border-green-400"
                      value={filters.ageMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, ageMax: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">{i18n.t('pages.medical_patients.filter_by_registration')}</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="date"
                      className="bg-white/70 border-green-200 focus:border-green-400"
                      value={filters.registrationDateStart}
                      onChange={(e) => setFilters(prev => ({ ...prev, registrationDateStart: e.target.value }))}
                    />
                    <Input
                      type="date"
                      className="bg-white/70 border-green-200 focus:border-green-400"
                      value={filters.registrationDateEnd}
                      onChange={(e) => setFilters(prev => ({ ...prev, registrationDateEnd: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={applyFilters}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {i18n.t('pages.medical_patients.apply_filters')}
                </Button>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="border-green-200 hover:bg-green-50"
                >
                  {i18n.t('pages.medical_patients.reset_filters')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 患者列表 */}
        <div>
          <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-green-500/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                {i18n.t('pages.medical_patients.patient_list')} ({filteredPatients.length})
              </CardTitle>
              <CardDescription className="text-gray-600">
                {i18n.t('pages.medical_patients.click_to_view_details')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{i18n.t('pages.medical_patients.patient_id')}</TableHead>
                      <TableHead>{i18n.t('pages.medical_patients.patient_name')}</TableHead>
                      <TableHead>{i18n.t('pages.medical_patients.age')}</TableHead>
                      <TableHead>{i18n.t('pages.medical_patients.registration_date')}</TableHead>
                      <TableHead>{i18n.t('pages.medical_patients.measurement_count')}</TableHead>
                      <TableHead>{i18n.t('pages.medical_patients.health_status')}</TableHead>
                      <TableHead>{i18n.t('pages.medical_patients.next_checkup')}</TableHead>
                      <TableHead>{i18n.t('pages.medical_patients.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          {i18n.t('pages.medical_patients.no_patients_found')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPatients.map((patient) => (
                        <TableRow
                          key={patient._id}
                          className="cursor-pointer hover:bg-green-50/50 transition-colors"
                          onClick={() => handlePatientClick(patient._id)}
                        >
                          <TableCell className="font-mono text-xs text-gray-600">
                            {patient._id.slice(-8)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {patient.fullName || patient.username}
                          </TableCell>
                          <TableCell>
                            {patient.age ? `${patient.age}${i18n.t('pages.medical_patients.years_old')}` : i18n.t('common.unknown')}
                          </TableCell>
                          <TableCell>
                            {formatDate(patient.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              {patient.measurementCount} {i18n.t('pages.medical_patients.times')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {patient.hasAbnormalMeasurements ? (
                              <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {i18n.t('pages.medical_patients.abnormal')}
                              </Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {i18n.t('pages.medical_patients.normal')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {formatDate(patient.nextCheckupDate)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-green-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePatientClick(patient._id)
                              }}
                            >
                              <Eye className="h-4 w-4 text-green-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 