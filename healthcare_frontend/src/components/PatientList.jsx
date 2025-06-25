import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx'
import { Input } from './ui/input.jsx'
import { Badge } from './ui/badge.jsx'
import { Search, User, Calendar, Phone, AlertTriangle } from 'lucide-react'
import i18n from '../utils/i18n'
import apiService from '../services/api.js'

export default function PatientList({ onViewCovidAssessments }) {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())
  const [error, setError] = useState('')

  useEffect(() => {
    // 監聽語言變化
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    
    return () => {
      i18n.removeListener(handleLanguageChange)
    }
  }, [])

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 获取异常测量数据（包含患者信息）
      const abnormalMeasurements = await apiService.getAbnormalMeasurements()
      
      console.log('PatientList fetched abnormal measurements:', abnormalMeasurements.length)
      
      // 按患者分组统计
      const patientStats = {}
      
      abnormalMeasurements.forEach(measurement => {
        const patientId = measurement.userId._id
        const patient = measurement.userId
        
        if (!patientStats[patientId]) {
          patientStats[patientId] = {
            ...patient,
            id: patientId,
            measurementCount: 0,
            abnormalCount: 0,
            pendingAbnormalCount: 0,
            lastMeasurement: null,
            measurements: []
          }
        }
        
        patientStats[patientId].measurements.push(measurement)
        patientStats[patientId].measurementCount++
        
        if (measurement.isAbnormal) {
          patientStats[patientId].abnormalCount++
          
          if (measurement.status === 'pending') {
            patientStats[patientId].pendingAbnormalCount++
          }
        }
        
        // 更新最后测量时间
        const measurementTime = new Date(measurement.createdAt || measurement.measurementTime)
        if (!patientStats[patientId].lastMeasurement || 
            measurementTime > new Date(patientStats[patientId].lastMeasurement)) {
          patientStats[patientId].lastMeasurement = measurementTime.toISOString()
        }
      })
      
      // 转换为数组并添加状态标记
      const patientsWithStats = Object.values(patientStats).map(patient => ({
        ...patient,
        hasAbnormal: patient.abnormalCount > 0,
        needsDiagnosis: patient.pendingAbnormalCount > 0
      }))
      
      // 按需要诊断的患者优先排序
      patientsWithStats.sort((a, b) => {
        if (a.needsDiagnosis && !b.needsDiagnosis) return -1
        if (!a.needsDiagnosis && b.needsDiagnosis) return 1
        return b.pendingAbnormalCount - a.pendingAbnormalCount
      })
      
      setPatients(patientsWithStats)
    } catch (error) {
      console.error('Error fetching patients:', error)
      setError('获取患者列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPatient = async (patientId) => {
    try {
      await apiService.processPatientMeasurements(patientId)
      // 重新获取数据
      await fetchPatients()
    } catch (error) {
      console.error('Error processing patient measurements:', error)
      setError('处理患者测量记录失败')
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.username.toString().includes(searchTerm)
  )

  const t = (key) => i18n.t(key)

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">{t('patient.loading')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('patient.management.title')}</CardTitle>
        <CardDescription>{t('patient.management.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* 搜索框 */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t('patient.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 患者列表 */}
        {filteredPatients.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{searchTerm ? '未找到匹配的患者' : '暂无需要关注的患者'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className={`transition-all duration-200 hover:shadow-md ${
                patient.needsDiagnosis ? 'border-l-4 border-l-red-500 bg-red-50/20' : 
                patient.hasAbnormal ? 'border-l-4 border-l-orange-500 bg-orange-50/20' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-xl">{patient.fullName}</h3>
                        <div className="flex gap-2">
                          {patient.needsDiagnosis && (
                            <Badge variant="destructive" className="animate-pulse">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              急需診斷
                            </Badge>
                          )}
                          {patient.hasAbnormal && !patient.needsDiagnosis && (
                            <Badge variant="secondary">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              有異常記錄
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">ID:</span>
                          <span className="font-medium">{patient.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">電話:</span>
                          <span className="font-medium">{patient.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">異常測量:</span>
                          <span className="font-medium">{patient.abnormalCount} 次</span>
                          {patient.pendingAbnormalCount > 0 && (
                            <span className="text-red-600 font-medium">
                              ({patient.pendingAbnormalCount} 待處理)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">郵箱:</span>
                          <span className="font-medium text-xs">{patient.email}</span>
                        </div>
                      </div>
                      
                      {patient.lastMeasurement && (
                        <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                          <span>最後測量: {new Date(patient.lastMeasurement).toLocaleString('zh-TW')}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/medical-staff/patient/${patient.id}`)}
                      >
                        查看詳情
                      </Button>
                      
                      {patient.needsDiagnosis && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleProcessPatient(patient.id)}
                        >
                          處理異常
                        </Button>
                      )}
                      
                      {onViewCovidAssessments && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewCovidAssessments(patient.id)}
                        >
                          COVID評估
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

