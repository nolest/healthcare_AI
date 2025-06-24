import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Loader2, Heart, Activity, Thermometer, Droplets } from 'lucide-react'
import mockDataStore from '../utils/mockDataStore.js'

const measurementTypes = [
  { value: 'blood_pressure', label: '血壓', icon: Heart, fields: ['systolic', 'diastolic'] },
  { value: 'heart_rate', label: '心率', icon: Activity, fields: ['rate'] },
  { value: 'temperature', label: '體溫', icon: Thermometer, fields: ['celsius'] },
  { value: 'oxygen_saturation', label: '血氧飽和度', icon: Droplets, fields: ['percentage'] },
  { value: 'blood_glucose', label: '血糖', icon: Activity, fields: ['mg_dl'] }
]

export default function MeasurementForm({ onMeasurementAdded }) {
  const [formData, setFormData] = useState({
    measurement_type: '',
    values: {},
    device_id: '',
    location: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      measurement_type: type,
      values: {}
    })
  }

  const handleValueChange = (field, value) => {
    setFormData({
      ...formData,
      values: {
        ...formData.values,
        [field]: parseFloat(value) || 0
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // 模擬API延遲
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      // 檢查異常值
      const isAbnormal = checkAbnormalValues(formData.measurement_type, formData.values)
      
      // 獲取當前用戶信息
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      if (!currentUser.username) {
        throw new Error('無法獲取當前用戶信息')
      }
      
      // 創建測量記錄
      const measurementData = {
        user_id: currentUser.username,
        patient_name: currentUser.fullName || currentUser.username,
        ...formData,
        is_abnormal: isAbnormal,
        measured_at: new Date().toISOString()
      }

      // 使用mockDataStore保存數據
      const savedMeasurement = mockDataStore.addMeasurement(measurementData)
      console.log('Measurement saved:', savedMeasurement)
      console.log('All measurements after save:', mockDataStore.getMeasurements().length)
      console.log('User measurements after save:', mockDataStore.getMeasurementsByUserId(currentUser.username).length)

      setSuccess('測量記錄已成功保存！')
      if (isAbnormal) {
        setSuccess(prev => prev + ' ⚠️ 檢測到異常值，建議諮詢醫護人員。')
      }
      
      // 重置表單
      setFormData({
        measurement_type: '',
        values: {},
        device_id: '',
        location: '',
        notes: ''
      })
      
      // 通知父組件
      if (onMeasurementAdded) {
        onMeasurementAdded()
      }
    } catch (error) {
      console.error('Submit error:', error)
      setError('保存測量記錄失敗，請重試')
    } finally {
      setLoading(false)
    }
  }

  // 檢查異常值的函數
  const checkAbnormalValues = (type, values) => {
    switch (type) {
      case 'blood_pressure':
        return values.systolic > 140 || values.systolic < 90 || values.diastolic > 90 || values.diastolic < 60
      case 'heart_rate':
        return values.rate > 100 || values.rate < 60
      case 'temperature':
        return values.celsius > 37.5 || values.celsius < 36.0
      case 'oxygen_saturation':
        return values.percentage < 95
      case 'blood_glucose':
        return values.mg_dl > 140 || values.mg_dl < 70
      default:
        return false
    }
  }

  const selectedType = measurementTypes.find(t => t.value === formData.measurement_type)

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>新建測量記錄</CardTitle>
        <CardDescription>
          請選擇測量類型並輸入測量數據
        </CardDescription>
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
            <Label>測量類型</Label>
            <Select value={formData.measurement_type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="選擇測量類型" />
              </SelectTrigger>
              <SelectContent>
                {measurementTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center">
                      <type.icon className="h-4 w-4 mr-2" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedType && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <selectedType.icon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium">{selectedType.label}測量</h3>
              </div>

              {selectedType.value === 'blood_pressure' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="systolic">收縮壓 (mmHg)</Label>
                    <Input
                      id="systolic"
                      type="number"
                      placeholder="120"
                      value={formData.values.systolic || ''}
                      onChange={(e) => handleValueChange('systolic', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diastolic">舒張壓 (mmHg)</Label>
                    <Input
                      id="diastolic"
                      type="number"
                      placeholder="80"
                      value={formData.values.diastolic || ''}
                      onChange={(e) => handleValueChange('diastolic', e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {selectedType.value === 'heart_rate' && (
                <div className="space-y-2">
                  <Label htmlFor="rate">心率 (bpm)</Label>
                  <Input
                    id="rate"
                    type="number"
                    placeholder="72"
                    value={formData.values.rate || ''}
                    onChange={(e) => handleValueChange('rate', e.target.value)}
                    required
                  />
                </div>
              )}

              {selectedType.value === 'temperature' && (
                <div className="space-y-2">
                  <Label htmlFor="celsius">體溫 (°C)</Label>
                  <Input
                    id="celsius"
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={formData.values.celsius || ''}
                    onChange={(e) => handleValueChange('celsius', e.target.value)}
                    required
                  />
                </div>
              )}

              {selectedType.value === 'oxygen_saturation' && (
                <div className="space-y-2">
                  <Label htmlFor="percentage">血氧飽和度 (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    placeholder="98"
                    value={formData.values.percentage || ''}
                    onChange={(e) => handleValueChange('percentage', e.target.value)}
                    required
                  />
                </div>
              )}

              {selectedType.value === 'blood_glucose' && (
                <div className="space-y-2">
                  <Label htmlFor="mg_dl">血糖 (mg/dL)</Label>
                  <Input
                    id="mg_dl"
                    type="number"
                    placeholder="100"
                    value={formData.values.mg_dl || ''}
                    onChange={(e) => handleValueChange('mg_dl', e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="device_id">設備ID（可選）</Label>
              <Input
                id="device_id"
                type="text"
                placeholder="BP001"
                value={formData.device_id}
                onChange={(e) => setFormData({...formData, device_id: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">測量地點（可選）</Label>
              <Input
                id="location"
                type="text"
                placeholder="診斷點A"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備註（可選）</Label>
            <Textarea
              id="notes"
              placeholder="任何額外的備註信息..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !formData.measurement_type}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? '保存中...' : '保存測量記錄'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

