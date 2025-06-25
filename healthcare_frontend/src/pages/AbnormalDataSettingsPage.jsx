import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.jsx'
import { Textarea } from '../components/ui/textarea.jsx'
import { Alert, AlertDescription } from '../components/ui/alert.jsx'
import { ArrowLeft, Plus, Settings, AlertTriangle } from 'lucide-react'
import apiService from '../services/api.js'

export default function AbnormalDataSettingsPage() {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState('')
  const [formData, setFormData] = useState({
    values: {},
    device_id: '',
    location: '測試診斷點',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const measurementTypes = [
    {
      value: 'blood_pressure',
      label: '血壓',
      normalRange: '收縮壓: 90-139 mmHg, 舒張壓: 60-89 mmHg',
      abnormalExamples: [
        { name: '高血壓', values: { systolic: 160, diastolic: 100 } },
        { name: '低血壓', values: { systolic: 80, diastolic: 50 } },
        { name: '嚴重高血壓', values: { systolic: 180, diastolic: 110 } }
      ]
    },
    {
      value: 'heart_rate',
      label: '心率',
      normalRange: '60-100 bpm',
      abnormalExamples: [
        { name: '心動過速', values: { rate: 120 } },
        { name: '心動過緩', values: { rate: 45 } },
        { name: '嚴重心動過速', values: { rate: 150 } }
      ]
    },
    {
      value: 'temperature',
      label: '體溫',
      normalRange: '36.0-37.3°C',
      abnormalExamples: [
        { name: '發燒', values: { celsius: 38.5 } },
        { name: '高燒', values: { celsius: 39.8 } },
        { name: '體溫過低', values: { celsius: 35.2 } }
      ]
    },
    {
      value: 'oxygen_saturation',
      label: '血氧飽和度',
      normalRange: '≥ 95%',
      abnormalExamples: [
        { name: '輕度缺氧', values: { percentage: 92 } },
        { name: '中度缺氧', values: { percentage: 88 } },
        { name: '嚴重缺氧', values: { percentage: 85 } }
      ]
    }
  ]

  const checkAbnormalValues = (type, values) => {
    switch (type) {
      case 'blood_pressure':
        return values.systolic >= 140 || values.systolic < 90 || values.diastolic >= 90 || values.diastolic < 60
      case 'heart_rate':
        return values.rate > 100 || values.rate < 60
      case 'temperature':
        return values.celsius > 37.3 || values.celsius < 36.0
      case 'oxygen_saturation':
        return values.percentage < 95
      default:
        return false
    }
  }

  const handleAddData = async () => {
    if (!selectedType || Object.keys(formData.values).length === 0) {
      setMessage('請選擇測量類型並輸入數值')
      return
    }

    setLoading(true)
    try {
      const currentUser = await apiService.getCurrentUser()
      if (!currentUser) {
        throw new Error('無法獲取當前用戶信息')
      }

      const isAbnormal = checkAbnormalValues(selectedType, formData.values)
      
      // 根据测量类型构建数据，适应新的API结构
      const measurementData = {
        deviceId: formData.device_id || `TEST_${selectedType.toUpperCase()}`,
        location: formData.location,
        notes: formData.notes || '測試異常數據'
      }

      // 根据测量类型添加相应的值
      if (selectedType === 'blood_pressure') {
        measurementData.systolic = formData.values.systolic
        measurementData.diastolic = formData.values.diastolic
      } else if (selectedType === 'heart_rate') {
        measurementData.heartRate = formData.values.rate
      } else if (selectedType === 'temperature') {
        measurementData.temperature = formData.values.celsius
      } else if (selectedType === 'oxygen_saturation') {
        measurementData.oxygenSaturation = formData.values.percentage
      }

      await apiService.submitMeasurement(measurementData)
      
      setMessage(`✅ 已添加${isAbnormal ? '異常' : '正常'}測量數據！`)
      
      // 重置表單
      setFormData({
        values: {},
        device_id: '',
        location: '測試診斷點',
        notes: ''
      })
      
    } catch (error) {
      console.error('Error adding data:', error)
      setMessage('❌ 添加數據失敗，請重試')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPresetData = (example) => {
    setFormData(prev => ({
      ...prev,
      values: example.values,
      notes: `測試數據 - ${example.name}`
    }))
  }

  const addAllAbnormalData = async () => {
    setLoading(true)
    try {
      const currentUser = await apiService.getCurrentUser()
      if (!currentUser) {
        throw new Error('無法獲取當前用戶信息')
      }

      const allAbnormalData = [
        {
          systolic: 180,
          diastolic: 110,
          deviceId: 'TEST_BLOOD_PRESSURE',
          location: '測試診斷點',
          notes: '嚴重高血壓測試數據'
        },
        {
          heartRate: 120,
          deviceId: 'TEST_HEART_RATE',
          location: '測試診斷點',
          notes: '心動過速測試數據'
        },
        {
          temperature: 39.2,
          deviceId: 'TEST_TEMPERATURE',
          location: '測試診斷點',
          notes: '高燒測試數據'
        },
        {
          oxygenSaturation: 85,
          deviceId: 'TEST_OXYGEN_SATURATION',
          location: '測試診斷點',
          notes: '嚴重缺氧測試數據'
        }
      ]

      // 使用 for...of 循环以便正确处理异步操作
      for (const measurementData of allAbnormalData) {
        try {
          await apiService.submitMeasurement(measurementData)
        } catch (error) {
          console.error('Error adding measurement:', error)
        }
      }

      setMessage('✅ 已添加所有4種類型的異常測量數據！')
      
    } catch (error) {
      console.error('Error adding all data:', error)
      setMessage('❌ 批量添加數據失敗，請重試')
    } finally {
      setLoading(false)
    }
  }

  const selectedTypeInfo = measurementTypes.find(t => t.value === selectedType)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>返回</span>
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                <Settings className="h-5 w-5 inline mr-2" />
                異常數據設置
              </h1>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* 批量操作 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                快速操作
              </CardTitle>
              <CardDescription>
                一鍵添加所有類型的異常測量數據用於測試
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={addAllAbnormalData}
                disabled={loading}
                size="lg"
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加所有4種異常數據
              </Button>
            </CardContent>
          </Card>

          {/* 单个数据添加 */}
          <Card>
            <CardHeader>
              <CardTitle>自定義異常數據</CardTitle>
              <CardDescription>
                選擇測量類型並設置具體數值
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {/* 测量类型选择 */}
              <div className="space-y-2">
                <Label>測量類型</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇測量類型" />
                  </SelectTrigger>
                  <SelectContent>
                    {measurementTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTypeInfo && (
                <div className="space-y-4">
                  {/* 正常范围提示 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">正常範圍</h4>
                    <p className="text-blue-800 text-sm">{selectedTypeInfo.normalRange}</p>
                  </div>

                  {/* 预设异常数据 */}
                  <div className="space-y-3">
                    <h4 className="font-medium">預設異常數據</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {selectedTypeInfo.abnormalExamples.map((example, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={() => handleAddPresetData(example)}
                          className="p-3 h-auto flex flex-col items-start"
                        >
                          <div className="font-medium">{example.name}</div>
                          <div className="text-sm text-gray-600">
                            {Object.entries(example.values).map(([key, value]) => (
                              <span key={key}>{value} </span>
                            ))}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 数值输入 */}
                  <div className="space-y-4">
                    <h4 className="font-medium">自定義數值</h4>
                    
                    {selectedType === 'blood_pressure' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>收縮壓 (mmHg)</Label>
                          <Input
                            type="number"
                            placeholder="120"
                            value={formData.values.systolic || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              values: { ...prev.values, systolic: parseInt(e.target.value) || 0 }
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>舒張壓 (mmHg)</Label>
                          <Input
                            type="number"
                            placeholder="80"
                            value={formData.values.diastolic || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              values: { ...prev.values, diastolic: parseInt(e.target.value) || 0 }
                            }))}
                          />
                        </div>
                      </div>
                    )}

                    {selectedType === 'heart_rate' && (
                      <div className="space-y-2">
                        <Label>心率 (bpm)</Label>
                        <Input
                          type="number"
                          placeholder="72"
                          value={formData.values.rate || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            values: { rate: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                    )}

                    {selectedType === 'temperature' && (
                      <div className="space-y-2">
                        <Label>體溫 (°C)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="36.5"
                          value={formData.values.celsius || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            values: { celsius: parseFloat(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                    )}

                    {selectedType === 'oxygen_saturation' && (
                      <div className="space-y-2">
                        <Label>血氧飽和度 (%)</Label>
                        <Input
                          type="number"
                          placeholder="98"
                          value={formData.values.percentage || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            values: { percentage: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                    )}

                    {selectedType === 'blood_glucose' && (
                      <div className="space-y-2">
                        <Label>血糖 (mg/dL)</Label>
                        <Input
                          type="number"
                          placeholder="100"
                          value={formData.values.mg_dl || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            values: { mg_dl: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                    )}
                  </div>

                  {/* 其他设置 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>設備ID</Label>
                      <Input
                        placeholder="TEST_DEVICE"
                        value={formData.device_id}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          device_id: e.target.value
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>測量地點</Label>
                      <Input
                        placeholder="測試診斷點"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          location: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>備註</Label>
                    <Textarea
                      placeholder="測試數據備註..."
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notes: e.target.value
                      }))}
                    />
                  </div>

                  <Button 
                    onClick={handleAddData}
                    disabled={loading}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加測量數據
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 