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
      
      // 获取所有患者和相关数据
      const [allPatients, allMeasurements] = await Promise.all([
        apiService.getPatients(),
        apiService.getAllMeasurements()
      ])
      
      console.log('PatientList fetched:', {
        allPatients: allPatients.length,
        allMeasurements: allMeasurements.length
      })
      
      // 为每个患者统计测量数据
      const patientsWithStats = allPatients.map(patient => {
        // 获取该患者的所有测量记录
        const patientMeasurements = allMeasurements.filter(m => 
          m.userId && (m.userId._id === patient._id || m.userId === patient._id)
        )
        
        // 统计异常和待处理的测量
        const abnormalCount = patientMeasurements.filter(m => m.isAbnormal).length
        const pendingAbnormalCount = patientMeasurements.filter(m => 
          m.isAbnormal && m.status === 'pending'
        ).length
        
        // 获取最后测量时间
        let lastMeasurement = null
        if (patientMeasurements.length > 0) {
          const sortedMeasurements = patientMeasurements.sort((a, b) => 
            new Date(b.createdAt || b.measurementTime) - new Date(a.createdAt || a.measurementTime)
          )
          lastMeasurement = sortedMeasurements[0].createdAt || sortedMeasurements[0].measurementTime
        }
        
        return {
          ...patient,
          id: patient._id,
          measurementCount: patientMeasurements.length,
          abnormalCount,
          pendingAbnormalCount,
          lastMeasurement,
          measurements: patientMeasurements,
          hasAbnormal: abnormalCount > 0,
          needsDiagnosis: pendingAbnormalCount > 0
        }
      })
      
      // 按优先级排序：需要诊断的患者优先，然后按异常数量排序
      patientsWithStats.sort((a, b) => {
        if (a.needsDiagnosis && !b.needsDiagnosis) return -1
        if (!a.needsDiagnosis && b.needsDiagnosis) return 1
        if (a.hasAbnormal && !b.hasAbnormal) return -1
        if (!a.hasAbnormal && b.hasAbnormal) return 1
        return b.abnormalCount - a.abnormalCount
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
            <p className="text-gray-500">{searchTerm ? '未找到匹配的患者' : '暂无患者数据'}</p>
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

