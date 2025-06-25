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
import apiService from '../services/api.js'

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
      // 使用真实API获取患者的测量记录
      const patientMeasurements = await apiService.getUserMeasurements(patient._id || patient.id)
      
      console.log('DiagnosisForm - Patient measurements:', patientMeasurements.length)
      
      // 按时间排序，最新的在前
      const sortedMeasurements = patientMeasurements
        .sort((a, b) => new Date(b.createdAt || b.measurementTime) - new Date(a.createdAt || a.measurementTime))
        .slice(0, 20)
      
      setMeasurements(sortedMeasurements)
      
      // 默认选中最新的异常测量记录，如果没有异常则选中最新的测量记录
      if (sortedMeasurements.length > 0) {
        const abnormalMeasurements = sortedMeasurements.filter(m => m.isAbnormal)
        if (abnormalMeasurements.length > 0) {
          setSelectedMeasurements(abnormalMeasurements.slice(0, 3).map(m => m._id))
        } else {
          setSelectedMeasurements([sortedMeasurements[0]._id])
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
      // 使用真实API保存诊断记录
      const diagnosisData = {
        patientId: patient._id || patient.id,
        measurementIds: selectedMeasurements,
        diagnosis: formData.diagnosis,
        recommendations: formData.recommendations,
        riskLevel: formData.risk_level,
        followUpRequired: formData.follow_up_required,
        followUpDate: formData.follow_up_date || null
      }

      console.log('Saving diagnosis:', diagnosisData)
      const savedDiagnosis = await apiService.createDiagnosis(diagnosisData)
      console.log('Diagnosis saved:', savedDiagnosis)
      
      // 将选中的测量记录标记为已处理
      for (const measurementId of selectedMeasurements) {
        try {
          await apiService.updateMeasurementStatus(measurementId, 'processed', false)
        } catch (error) {
          console.error('Error updating measurement status:', error)
        }
      }
      
      // 如果风险等级不是紧急，将患者的所有异常测量记录标记为已处理
      if (formData.risk_level !== 'critical') {
        try {
          await apiService.processPatientMeasurements(patient._id || patient.id)
        } catch (error) {
          console.error('Error processing patient measurements:', error)
        }
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
    const values = []
    
    if (measurement.systolic && measurement.diastolic) {
      values.push(`血壓: ${measurement.systolic}/${measurement.diastolic} mmHg`)
    }
    if (measurement.heartRate) {
      values.push(`心率: ${measurement.heartRate} 次/分`)
    }
    if (measurement.temperature) {
      values.push(`體溫: ${measurement.temperature}°C`)
    }
    if (measurement.oxygenSaturation) {
      values.push(`血氧: ${measurement.oxygenSaturation}%`)
    }
    
    return values.join(' | ') || 'N/A'
  }

  const getMeasurementLabel = (measurement) => {
    const types = []
    if (measurement.systolic && measurement.diastolic) types.push('血壓')
    if (measurement.heartRate) types.push('心率')
    if (measurement.temperature) types.push('體溫')
    if (measurement.oxygenSaturation) types.push('血氧')
    
    return types.join(' + ') || '健康測量'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                為 {patient.fullName || patient.name} 創建診斷記錄
              </CardTitle>
              <CardDescription>患者ID: {patient._id || patient.id}</CardDescription>
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
                <div key={measurement._id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={`measurement-${measurement._id}`}
                    checked={selectedMeasurements.includes(measurement._id)}
                    onCheckedChange={(checked) => handleMeasurementSelect(measurement._id, checked)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{getMeasurementLabel(measurement)}</span>
                        <span className="ml-2 text-lg">{formatMeasurementValue(measurement)}</span>
                        {measurement.isAbnormal && (
                          <Badge variant="destructive" className="ml-2">異常</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(measurement.createdAt || measurement.measurementTime).toLocaleString('zh-TW')}
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

