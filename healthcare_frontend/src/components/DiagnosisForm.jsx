import { useState, useEffect } from 'react'
import { Button } from './ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx'
import { Textarea } from './ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.jsx'
import { Badge } from './ui/badge.jsx'
import { Alert, AlertDescription } from './ui/alert.jsx'
import { Checkbox } from './ui/checkbox.jsx'
import { Label } from './ui/label.jsx'
import { Input } from './ui/input.jsx'
import { Loader2, User, Activity, Calendar, ArrowLeft } from 'lucide-react'
import mockDataStore from '../utils/mockDataStore'

const recommendationOptions = [
  '定期監測血壓',
  '保持適量運動',
  '注意飲食均衡',
  '減少鹽分攝入',
  '戒煙限酒',
  '保持充足睡眠',
  '定期複查',
  '及時就醫',
  '服用處方藥物',
  '監測血糖'
]

export default function DiagnosisForm({ patient, onDiagnosisAdded, onCancel }) {
  const [formData, setFormData] = useState({
    diagnosis: '',
    recommendations: [],
    risk_level: 'low',
    follow_up_required: false,
    follow_up_date: '',
    custom_recommendation: ''
  })
  const [measurements, setMeasurements] = useState([])
  const [selectedMeasurements, setSelectedMeasurements] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchPatientMeasurements()
  }, [patient])

  const fetchPatientMeasurements = async () => {
    try {
      // 使用統一的mockDataStore獲取測量記錄
      const allMeasurements = mockDataStore.getMeasurements()
      const patientIdentifier = patient.username || patient.id
      
      console.log('DiagnosisForm - Patient info:', {
        patient_id: patient.id,
        patient_username: patient.username,
        patient_fullName: patient.fullName,
        patientIdentifier
      })
      console.log('DiagnosisForm - All measurements:', allMeasurements.length)
      console.log('DiagnosisForm - Sample measurements:', allMeasurements.slice(0, 3).map(m => ({
        id: m.id,
        user_id: m.user_id,
        measurement_type: m.measurement_type,
        is_abnormal: m.is_abnormal
      })))
      
      const patientMeasurements = allMeasurements
        .filter(m => {
          const match = m.user_id === patientIdentifier
          console.log(`Measurement ${m.id}: user_id=${m.user_id}, patientIdentifier=${patientIdentifier}, match=${match}`)
          return match
        })
        .sort((a, b) => new Date(b.measured_at) - new Date(a.measured_at))
        .slice(0, 20)
      
      console.log('DiagnosisForm - Filtered patient measurements:', patientMeasurements.length)
      setMeasurements(patientMeasurements)
      
      // 默認選中最新的異常測量記錄，如果沒有異常則選中最新的測量記錄
      if (patientMeasurements.length > 0) {
        const abnormalMeasurements = patientMeasurements.filter(m => m.is_abnormal)
        if (abnormalMeasurements.length > 0) {
          setSelectedMeasurements(abnormalMeasurements.slice(0, 3).map(m => m.id))
        } else {
          setSelectedMeasurements([patientMeasurements[0].id])
        }
      }
    } catch (error) {
      console.error('Error fetching measurements:', error)
      setError('無法載入患者測量記錄')
    }
  }

  const handleRecommendationChange = (recommendation, checked) => {
    if (checked) {
      setFormData({
        ...formData,
        recommendations: [...formData.recommendations, recommendation]
      })
    } else {
      setFormData({
        ...formData,
        recommendations: formData.recommendations.filter(r => r !== recommendation)
      })
    }
  }

  const addCustomRecommendation = () => {
    if (formData.custom_recommendation.trim()) {
      setFormData({
        ...formData,
        recommendations: [...formData.recommendations, formData.custom_recommendation.trim()],
        custom_recommendation: ''
      })
    }
  }

  const removeRecommendation = (recommendation) => {
    setFormData({
      ...formData,
      recommendations: formData.recommendations.filter(r => r !== recommendation)
    })
  }

  const handleMeasurementSelect = (measurementId, checked) => {
    if (checked) {
      setSelectedMeasurements([...selectedMeasurements, measurementId])
    } else {
      setSelectedMeasurements(selectedMeasurements.filter(id => id !== measurementId))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // 使用統一的mockDataStore保存診斷記錄
      const diagnosisData = {
        patient_id: patient.username || patient.id,
        patient_name: patient.fullName || patient.full_name || patient.name,
        doctor_id: 'doctor001', // 假設當前醫生ID
        doctor_name: '陳醫師',
        measurement_ids: selectedMeasurements,
        diagnosis: formData.diagnosis,
        recommendations: formData.recommendations,
        risk_level: formData.risk_level,
        follow_up_required: formData.follow_up_required,
        follow_up_date: formData.follow_up_date || null
      }

      console.log('Saving diagnosis:', diagnosisData)
      const savedDiagnosis = mockDataStore.addDiagnosis(diagnosisData)
      console.log('Diagnosis saved:', savedDiagnosis)
      
      // 将选中的测量记录标记为已处理
      selectedMeasurements.forEach(measurementId => {
        mockDataStore.updateMeasurementStatus(measurementId, 'processed')
      })
      
      // 将患者的所有异常测量记录标记为已处理（如果风险等级不是紧急）
      if (formData.risk_level !== 'critical') {
        mockDataStore.markPatientMeasurementsAsProcessed(patient.username || patient.id)
      }
      
      setSuccess('診斷記錄已成功保存！患者已從待處理列表中移除。')
      setTimeout(() => {
        if (onDiagnosisAdded) {
          onDiagnosisAdded()
        }
      }, 1500)

    } catch (error) {
      console.error('Error saving diagnosis:', error)
      setError('保存診斷記錄時發生錯誤，請重試')
    } finally {
      setLoading(false)
    }
  }

  const formatMeasurementValue = (measurement) => {
    switch (measurement.measurement_type) {
      case 'blood_pressure':
        return `${measurement.values.systolic}/${measurement.values.diastolic} mmHg`
      case 'heart_rate':
        return `${measurement.values.rate} bpm`
      case 'temperature':
        return `${measurement.values.celsius}°C`
      case 'oxygen_saturation':
        return `${measurement.values.percentage}%`
      case 'blood_glucose':
        return `${measurement.values.mg_dl} mg/dL`
      default:
        return 'N/A'
    }
  }

  const getMeasurementLabel = (type) => {
    switch (type) {
      case 'blood_pressure':
        return '血壓'
      case 'heart_rate':
        return '心率'
      case 'temperature':
        return '體溫'
      case 'oxygen_saturation':
        return '血氧飽和度'
      case 'blood_glucose':
        return '血糖'
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                為 {patient.fullName || patient.full_name || patient.name} 創建診斷記錄
              </CardTitle>
              <CardDescription>患者ID: {patient.username || patient.id}</CardDescription>
            </div>
            <Button variant="outline" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* 患者測量記錄 */}
      <Card>
        <CardHeader>
          <CardTitle>相關測量記錄</CardTitle>
          <CardDescription>選擇與此次診斷相關的測量記錄</CardDescription>
        </CardHeader>
        <CardContent>
          {measurements.length === 0 ? (
            <p className="text-gray-500">暫無測量記錄</p>
          ) : (
            <div className="space-y-3">
              {measurements.slice(0, 10).map((measurement) => (
                <div key={measurement.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={`measurement-${measurement.id}`}
                    checked={selectedMeasurements.includes(measurement.id)}
                    onCheckedChange={(checked) => handleMeasurementSelect(measurement.id, checked)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{getMeasurementLabel(measurement.measurement_type)}</span>
                        <span className="ml-2 text-lg">{formatMeasurementValue(measurement)}</span>
                        {measurement.is_abnormal && (
                          <Badge variant="destructive" className="ml-2">異常</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(measurement.measured_at).toLocaleString('zh-TW')}
                      </div>
                    </div>
                    {measurement.location && (
                      <p className="text-sm text-gray-500 mt-1">地點: {measurement.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 診斷表單 */}
      <Card>
        <CardHeader>
          <CardTitle>診斷評估</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="diagnosis">診斷結論 *</Label>
              <Textarea
                id="diagnosis"
                placeholder="請輸入詳細的診斷結論..."
                value={formData.diagnosis}
                onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>風險等級</Label>
              <Select value={formData.risk_level} onValueChange={(value) => 
                setFormData({...formData, risk_level: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="選擇風險等級" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低風險</SelectItem>
                  <SelectItem value="medium">中風險</SelectItem>
                  <SelectItem value="high">高風險</SelectItem>
                  <SelectItem value="critical">緊急</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>建議措施</Label>
              <div className="grid grid-cols-2 gap-3">
                {recommendationOptions.map((recommendation) => (
                  <div key={recommendation} className="flex items-center space-x-2">
                    <Checkbox
                      id={recommendation}
                      checked={formData.recommendations.includes(recommendation)}
                      onCheckedChange={(checked) => handleRecommendationChange(recommendation, checked)}
                    />
                    <Label htmlFor={recommendation} className="text-sm">
                      {recommendation}
                    </Label>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Input
                  placeholder="添加自定義建議..."
                  value={formData.custom_recommendation}
                  onChange={(e) => setFormData({...formData, custom_recommendation: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomRecommendation())}
                />
                <Button type="button" onClick={addCustomRecommendation}>
                  添加
                </Button>
              </div>

              {formData.recommendations.length > 0 && (
                <div className="space-y-2">
                  <Label>已選建議：</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.recommendations.map((rec, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeRecommendation(rec)}>
                        {rec} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="follow_up_required"
                  checked={formData.follow_up_required}
                  onCheckedChange={(checked) => setFormData({...formData, follow_up_required: checked})}
                />
                <Label htmlFor="follow_up_required">需要後續追蹤</Label>
              </div>

              {formData.follow_up_required && (
                <div className="space-y-2">
                  <Label htmlFor="follow_up_date">追蹤日期</Label>
                  <Input
                    id="follow_up_date"
                    type="datetime-local"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({...formData, follow_up_date: e.target.value})}
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading || !formData.diagnosis.trim()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? '保存中...' : '保存診斷記錄'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

