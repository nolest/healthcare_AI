import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx'
import { Input } from './ui/input.jsx'
import { Badge } from './ui/badge.jsx'
import { Search, User, Calendar, Phone, AlertTriangle } from 'lucide-react'
import i18n from '../utils/i18n'
import mockDataStore from '../utils/mockDataStore'

export default function PatientList({ onViewCovidAssessments }) {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

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
    
    // 監聽數據變化
    const handleDataChange = () => {
      fetchPatients()
    }
    
    mockDataStore.addListener(handleDataChange)
    
    return () => {
      mockDataStore.removeListener(handleDataChange)
    }
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      
      // 使用統一的mockDataStore獲取數據
      const users = mockDataStore.getUsersByRole('patient')
      const measurements = mockDataStore.getMeasurements()
      const diagnoses = mockDataStore.getDiagnoses()
      
      console.log('PatientList fetched data:', {
        users: users.length,
        measurements: measurements.length,
        diagnoses: diagnoses.length
      })
      
      // 為每個患者添加統計信息
      const patientsWithStats = users.map(user => {
        const userMeasurements = measurements.filter(m => m.user_id === user.username)
        const userDiagnoses = diagnoses.filter(d => d.patient_id === user.username)
        const abnormalMeasurements = userMeasurements.filter(m => m.is_abnormal)
        const pendingAbnormalMeasurements = userMeasurements.filter(m => 
          m.is_abnormal && (m.status !== 'processed')
        )
        
        return {
          ...user,
          measurementCount: userMeasurements.length,
          diagnosisCount: userDiagnoses.length,
          abnormalCount: abnormalMeasurements.length,
          pendingAbnormalCount: pendingAbnormalMeasurements.length,
          lastMeasurement: userMeasurements.length > 0 ? 
            userMeasurements[userMeasurements.length - 1].measured_at : null,
          hasAbnormal: abnormalMeasurements.length > 0,
          needsDiagnosis: pendingAbnormalMeasurements.length > 0
        }
      })
      
      setPatients(patientsWithStats)
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
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
            <p className="text-gray-500">{t('patient.no_patients')}</p>
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
                          <span className="text-gray-600">測量:</span>
                          <span className="font-medium">{patient.measurementCount} 次</span>
                          {patient.pendingAbnormalCount > 0 && (
                            <span className="text-red-600 font-medium">
                              ({patient.pendingAbnormalCount} 待處理)
                            </span>
                          )}
                          {patient.abnormalCount > 0 && patient.pendingAbnormalCount === 0 && (
                            <span className="text-gray-500 font-medium">
                              ({patient.abnormalCount} 已處理)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">診斷:</span>
                          <span className="font-medium">{patient.diagnosisCount} 次</span>
                        </div>
                      </div>
                      
                      {patient.lastMeasurement && (
                        <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                          <span>最後測量: {new Date(patient.lastMeasurement).toLocaleString('zh-TW')}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-6">
                      {patient.needsDiagnosis ? (
                        <Button
                          onClick={() => {
                            console.log('Navigating to diagnosis for patient:', patient.id, patient.username)
                            navigate(`/diagnosis/${patient.id}`)
                          }}
                          size="lg"
                          className="bg-red-600 hover:bg-red-700 text-white px-6"
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          立即診斷
                        </Button>
                      ) : (
                        <Button
                          onClick={() => navigate(`/diagnosis/${patient.id}`)}
                          size="sm"
                          variant="outline"
                        >
                          查看詳情
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => onViewCovidAssessments(patient)}
                        size="sm"
                        variant="ghost"
                      >
                        COVID評估
                      </Button>
                      
                      {patient.hasAbnormal && !patient.needsDiagnosis && (
                        <Button
                          onClick={() => navigate(`/diagnosis/${patient.id}`)}
                          size="sm"
                          variant="secondary"
                        >
                          重新診斷
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

