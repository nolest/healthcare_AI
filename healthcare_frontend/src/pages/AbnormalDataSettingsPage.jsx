import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.jsx'
import { Textarea } from '../components/ui/textarea.jsx'
import { Alert, AlertDescription } from '../components/ui/alert.jsx'
import { Plus, Settings, AlertTriangle, Activity, Heart, Thermometer, Droplets } from 'lucide-react'
import MedicalHeader from '../components/ui/MedicalHeader.jsx'
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
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // 检查用户是否已登录和权限
    const userData = apiService.getCurrentUser()
    if (!userData) {
      navigate('/login')
      return
    }
    
    // 只允许医护人员访问此测试工具
    if (userData.role !== 'medical_staff') {
      alert('此功能仅限医护人员使用')
      navigate('/login')
      return
    }

    setCurrentUser(userData)
  }, [navigate])

  const measurementTypes = [
    {
      value: 'blood_pressure',
      label: '血壓',
      icon: Activity,
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
      icon: Heart,
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
      icon: Thermometer,
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
      icon: Droplets,
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
      for (const data of allAbnormalData) {
        await apiService.submitMeasurement(data)
        await new Promise(resolve => setTimeout(resolve, 500)) // 添加短暂延迟
      }

      setMessage('✅ 已成功添加所有異常測試數據！')
      
    } catch (error) {
      console.error('Error adding all abnormal data:', error)
      setMessage('❌ 批量添加數據失敗，請重試')
    } finally {
      setLoading(false)
    }
  }

  const renderFormFields = () => {
    if (!selectedType) return null

    const type = measurementTypes.find(t => t.value === selectedType)
    if (!type) return null

    switch (selectedType) {
      case 'blood_pressure':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="systolic" className="text-sm font-medium text-gray-700">收縮壓 (mmHg)</Label>
                <Input
                  id="systolic"
                  type="number"
                  placeholder="120"
                  className="mt-1 bg-white/70 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                  value={formData.values.systolic || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    values: { ...prev.values, systolic: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="diastolic" className="text-sm font-medium text-gray-700">舒張壓 (mmHg)</Label>
                <Input
                  id="diastolic"
                  type="number"
                  placeholder="80"
                  className="mt-1 bg-white/70 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                  value={formData.values.diastolic || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    values: { ...prev.values, diastolic: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
            </div>
          </div>
        )

      case 'heart_rate':
        return (
          <div>
            <Label htmlFor="rate" className="text-sm font-medium text-gray-700">心率 (bpm)</Label>
            <Input
              id="rate"
              type="number"
              placeholder="75"
              className="mt-1 bg-white/70 border-green-200 focus:border-green-400 focus:ring-green-400/20"
              value={formData.values.rate || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                values: { ...prev.values, rate: parseInt(e.target.value) || 0 }
              }))}
            />
          </div>
        )

      case 'temperature':
        return (
          <div>
            <Label htmlFor="celsius" className="text-sm font-medium text-gray-700">體溫 (°C)</Label>
            <Input
              id="celsius"
              type="number"
              step="0.1"
              placeholder="36.5"
              className="mt-1 bg-white/70 border-green-200 focus:border-green-400 focus:ring-green-400/20"
              value={formData.values.celsius || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                values: { ...prev.values, celsius: parseFloat(e.target.value) || 0 }
              }))}
            />
          </div>
        )

      case 'oxygen_saturation':
        return (
          <div>
            <Label htmlFor="percentage" className="text-sm font-medium text-gray-700">血氧飽和度 (%)</Label>
            <Input
              id="percentage"
              type="number"
              placeholder="98"
              className="mt-1 bg-white/70 border-green-200 focus:border-green-400 focus:ring-green-400/20"
              value={formData.values.percentage || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                values: { ...prev.values, percentage: parseInt(e.target.value) || 0 }
              }))}
            />
          </div>
        )

      default:
        return null
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-200/20 to-green-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <MedicalHeader 
        title="異常數據設置"
        subtitle="醫護人員測試工具 - 生成異常測量數據"
        icon={Settings}
        showBackButton={true}
        user={currentUser}
        onBack={() => navigate('/medical')}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        {/* 警告提示 */}
        <div className="mb-8">
          <Alert className="bg-gradient-to-br from-orange-50/90 to-orange-100/70 backdrop-blur-lg border-orange-200 shadow-lg shadow-orange-500/10">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>醫護人員專用工具</strong> - 此功能用於生成測試數據，請謹慎使用
            </AlertDescription>
          </Alert>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：数据输入表单 */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-4">
                添加測試數據
              </h3>
              
              <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-green-500/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-gray-800">選擇測量類型</CardTitle>
                  <CardDescription className="text-gray-600">
                    選擇要添加測試數據的測量類型
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="type" className="text-sm font-medium text-gray-700">測量類型</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="mt-1 bg-white/70 border-green-200 focus:border-green-400">
                        <SelectValue placeholder="選擇測量類型" />
                      </SelectTrigger>
                      <SelectContent>
                        {measurementTypes.map((type) => {
                          const IconComponent = type.icon
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedType && (
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>正常範圍:</strong> {measurementTypes.find(t => t.value === selectedType)?.normalRange}
                        </p>
                      </div>

                      {renderFormFields()}

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="device_id" className="text-sm font-medium text-gray-700">設備ID (可選)</Label>
                          <Input
                            id="device_id"
                            placeholder="TEST_DEVICE_001"
                            className="mt-1 bg-white/70 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                            value={formData.device_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, device_id: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="location" className="text-sm font-medium text-gray-700">測量地點</Label>
                          <Input
                            id="location"
                            className="mt-1 bg-white/70 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="notes" className="text-sm font-medium text-gray-700">備註</Label>
                          <Textarea
                            id="notes"
                            placeholder="測試數據備註..."
                            className="mt-1 bg-white/70 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleAddData}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {loading ? '添加中...' : '添加測試數據'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 快速操作 */}
            <Card className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl shadow-purple-500/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-800">快速操作</CardTitle>
                <CardDescription className="text-gray-600">
                  一鍵添加所有類型的異常測試數據
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={addAllAbnormalData}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-purple-200 hover:bg-purple-50 hover:border-purple-300 text-purple-700 hover:text-purple-800"
                >
                  {loading ? '批量添加中...' : '添加所有異常數據'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：预设数据示例 */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-4">
                預設異常數據
              </h3>
              
              <div className="space-y-4">
                {measurementTypes.map((type) => {
                  const IconComponent = type.icon
                  return (
                    <Card key={type.value} className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-lg shadow-gray-500/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                          <IconComponent className="h-5 w-5 text-green-600" />
                          {type.label}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          正常範圍: {type.normalRange}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {type.abnormalExamples.map((example, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-red-50/70 rounded-lg border border-red-200">
                              <div>
                                <p className="font-medium text-red-800">{example.name}</p>
                                <p className="text-sm text-red-600">
                                  {Object.entries(example.values).map(([key, value]) => `${key}: ${value}`).join(', ')}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedType(type.value)
                                  handleAddPresetData(example)
                                }}
                                className="border-red-200 hover:bg-red-50 hover:border-red-300 text-red-700 hover:text-red-800"
                              >
                                使用
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 状态消息 */}
        {message && (
          <div className="mt-8">
            <Alert className={`${
              message.includes('✅') 
                ? 'bg-gradient-to-br from-green-50/90 to-green-100/70 border-green-200 shadow-green-500/10' 
                : 'bg-gradient-to-br from-red-50/90 to-red-100/70 border-red-200 shadow-red-500/10'
            } backdrop-blur-lg shadow-lg`}>
              <AlertDescription className={message.includes('✅') ? 'text-green-800' : 'text-red-800'}>
                {message}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </main>
    </div>
  )
} 