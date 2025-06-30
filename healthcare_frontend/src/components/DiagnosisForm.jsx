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
import ImageViewer from './ImageViewer.jsx'

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
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentImagePaths, setCurrentImagePaths] = useState([])
  const [currentImageUserId, setCurrentImageUserId] = useState('')
  const [currentImageUrls, setCurrentImageUrls] = useState(null)
  const [abnormalRanges, setAbnormalRanges] = useState([])

  useEffect(() => {
    fetchPatientMeasurements()
    fetchAbnormalRanges()
  }, [patient])

  const fetchAbnormalRanges = async () => {
    try {
      const ranges = await apiService.getAbnormalRanges()
      setAbnormalRanges(ranges)
      console.log('DiagnosisForm - Fetched abnormal ranges:', ranges)
    } catch (error) {
      console.error('Error fetching abnormal ranges:', error)
    }
  }

  const fetchPatientMeasurements = async () => {
    try {
      console.log('DiagnosisForm - Patient object:', patient)
      
      // 首先检查患者对象是否已经包含历史测量记录
      if (patient.history_measurements && Array.isArray(patient.history_measurements)) {
        console.log('DiagnosisForm - Using history_measurements from patient object:', patient.history_measurements.length)
        const patientMeasurements = patient.history_measurements
        
        // 按时间排序，最新的在前（已经在后端排序，但这里再次确保）
        const sortedMeasurements = patientMeasurements
          .sort((a, b) => new Date(b.createdAt || b.measurementTime) - new Date(a.createdAt || a.measurementTime))
          .slice(0, 20)
        
        console.log('DiagnosisForm - Sorted measurements:', sortedMeasurements.length)
        setMeasurements(sortedMeasurements)
        
        // 默认选中最新的异常测量记录，如果没有异常则选中最新的测量记录
        if (sortedMeasurements.length > 0) {
          const abnormalMeasurements = sortedMeasurements.filter(m => m.isAbnormal)
          if (abnormalMeasurements.length > 0) {
            setSelectedMeasurements([abnormalMeasurements[0]._id])
          } else {
            setSelectedMeasurements([sortedMeasurements[0]._id])
          }
        }
        return
      }
      
      // 如果患者对象没有包含历史测量记录，则使用原有的API调用方式
      const patientId = patient._id || patient.id
      const currentUser = apiService.getCurrentUser()
      
      console.log('DiagnosisForm - Current user:', currentUser)
      console.log('DiagnosisForm - Fetching measurements for patient ID:', patientId)
      console.log('DiagnosisForm - API Token exists:', !!apiService.token)
      
      // 使用真实API获取患者的测量记录
      let patientMeasurements = []
      
      try {
        console.log('DiagnosisForm - Making API call to:', `/measurements/user/${patientId}`)
        patientMeasurements = await apiService.getUserMeasurements(patientId)
        console.log('DiagnosisForm - Direct API call successful, got:', patientMeasurements.length, 'measurements')
      } catch (directError) {
        console.warn('DiagnosisForm - Direct API call failed, trying alternative method:', directError.message)
        
        // 备用方案：获取所有测量记录然后过滤
        try {
          const allMeasurements = await apiService.getAllMeasurements()
          console.log('DiagnosisForm - Got all measurements:', allMeasurements.length)
          
          patientMeasurements = allMeasurements.filter(m => {
            const measurementUserId = m.userId?._id || m.userId
            const measurementUserIdString = String(measurementUserId)
            const patientIdString = String(patientId)
            
            const matches = measurementUserIdString === patientIdString || 
                           measurementUserId === patient.username ||
                           (m.userId?.username && m.userId.username === patient.username)
            
            return matches
          })
          
          console.log('DiagnosisForm - Filtered measurements:', patientMeasurements.length)
        } catch (fallbackError) {
          console.error('DiagnosisForm - Fallback method also failed:', fallbackError)
          throw new Error(`无法获取测量记录: ${directError.message}`)
        }
      }
      
      console.log('DiagnosisForm - Final measurements count:', patientMeasurements.length)
      
      // 按时间排序，最新的在前
      const sortedMeasurements = patientMeasurements
        .sort((a, b) => new Date(b.createdAt || b.measurementTime) - new Date(a.createdAt || a.measurementTime))
        .slice(0, 20)
      
      console.log('DiagnosisForm - Sorted measurements:', sortedMeasurements.length)
      setMeasurements(sortedMeasurements)
      
      // 默认选中最新的异常测量记录，如果没有异常则选中最新的测量记录
      if (sortedMeasurements.length > 0) {
        const abnormalMeasurements = sortedMeasurements.filter(m => m.isAbnormal)
        if (abnormalMeasurements.length > 0) {
          setSelectedMeasurements([abnormalMeasurements[0]._id])
        } else {
          setSelectedMeasurements([sortedMeasurements[0]._id])
        }
      }
    } catch (error) {
      console.error('Error fetching measurements:', error)
      
      // 显示更友好的错误信息
      let errorMessage = '無法載入患者測量記錄'
      if (error.response?.status === 404) {
        errorMessage = '該患者暫無測量記錄'
      } else if (error.response?.status === 403) {
        errorMessage = '權限不足，無法訪問患者測量記錄'
      } else if (error.response?.status === 401) {
        errorMessage = '認證失效，請重新登錄'
      } else {
        errorMessage = `載入失敗: ${error.response?.data?.message || error.message}`
      }
      
      setError(errorMessage)
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
      // 只允许选择一条记录
      setSelectedMeasurements([measurementId])
    } else {
      setSelectedMeasurements([])
    }
  }

  const openImageViewer = (imagePaths, userId, initialIndex = 0, imageUrls = null) => {
    setCurrentImagePaths(imagePaths)
    setCurrentImageUserId(userId)
    setCurrentImageIndex(initialIndex)
    setCurrentImageUrls(imageUrls) // 传递完整的URL数组
    setImageViewerOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // 验证必填字段
      if (!formData.diagnosis.trim()) {
        setError('診斷結論為必填項目')
        setLoading(false)
        return
      }

      if (selectedMeasurements.length === 0) {
        setError('請至少選擇一條測量記錄')
        setLoading(false)
        return
      }

      // 使用真实API保存诊断记录 - 使用后端期望的字段格式
      const diagnosisData = {
        measurementId: selectedMeasurements[0], // 只取第一个测量记录ID
        diagnosis: formData.diagnosis,
        treatment: formData.recommendations.length > 0 
          ? formData.recommendations.join('；') 
          : '无特殊治疗建议',
        followUpDate: formData.follow_up_date || undefined,
        notes: `風險等級: ${formData.risk_level}${formData.follow_up_required ? '；需要後續追蹤' : ''}`
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
    if (measurement.bloodSugar) {
      values.push(`血糖: ${measurement.bloodSugar} mg/dL`)
    }
    
    return values.join(' | ') || 'N/A'
  }

  const getMeasurementLabel = (measurement) => {
    const types = []
    if (measurement.systolic && measurement.diastolic) types.push('血壓')
    if (measurement.heartRate) types.push('心率')
    if (measurement.temperature) types.push('體溫')
    if (measurement.oxygenSaturation) types.push('血氧')
    if (measurement.bloodSugar) types.push('血糖')
    
    return types.join(' + ') || '健康測量'
  }

  // 根据全局异常值范围检查单个测量值是否异常
  const checkValueIsAbnormal = (measurementType, fieldName, value) => {
    if (!abnormalRanges || !abnormalRanges.length || value === undefined || value === null) {
      return false
    }

    const range = abnormalRanges.find(r => r.measurementType === measurementType)
    if (!range || !range.normalRange) {
      return false
    }

    const normalRange = range.normalRange[fieldName]
    if (!normalRange || normalRange.min === undefined || normalRange.max === undefined) {
      return false
    }

    return value < normalRange.min || value > normalRange.max
  }

  const renderDetailedMeasurementValues = (measurement) => {
    const measurementItems = [
      {
        label: '收縮壓',
        value: measurement.systolic,
        unit: 'mmHg',
        measurementType: 'blood_pressure',
        fieldName: 'systolic',
        getNormalRange: () => {
          const range = abnormalRanges.find(r => r.measurementType === 'blood_pressure')
          return range?.normalRange?.systolic ? `${range.normalRange.systolic.min}-${range.normalRange.systolic.max}` : '90-140'
        }
      },
      {
        label: '舒張壓',
        value: measurement.diastolic,
        unit: 'mmHg',
        measurementType: 'blood_pressure',
        fieldName: 'diastolic',
        getNormalRange: () => {
          const range = abnormalRanges.find(r => r.measurementType === 'blood_pressure')
          return range?.normalRange?.diastolic ? `${range.normalRange.diastolic.min}-${range.normalRange.diastolic.max}` : '60-90'
        }
      },
      {
        label: '心率',
        value: measurement.heartRate,
        unit: '次/分',
        measurementType: 'heart_rate',
        fieldName: 'heartRate',
        getNormalRange: () => {
          const range = abnormalRanges.find(r => r.measurementType === 'heart_rate')
          return range?.normalRange?.heartRate ? `${range.normalRange.heartRate.min}-${range.normalRange.heartRate.max}` : '60-100'
        }
      },
      {
        label: '體溫',
        value: measurement.temperature,
        unit: '°C',
        measurementType: 'temperature',
        fieldName: 'temperature',
        getNormalRange: () => {
          const range = abnormalRanges.find(r => r.measurementType === 'temperature')
          return range?.normalRange?.temperature ? `${range.normalRange.temperature.min}-${range.normalRange.temperature.max}` : '36.1-37.2'
        }
      },
      {
        label: '血氧',
        value: measurement.oxygenSaturation,
        unit: '%',
        measurementType: 'oxygen_saturation',
        fieldName: 'oxygenSaturation',
        getNormalRange: () => {
          const range = abnormalRanges.find(r => r.measurementType === 'oxygen_saturation')
          return range?.normalRange?.oxygenSaturation ? `${range.normalRange.oxygenSaturation.min}-${range.normalRange.oxygenSaturation.max}` : '95-100'
        }
      },
      {
        label: '血糖',
        value: measurement.bloodSugar,
        unit: 'mg/dL',
        measurementType: 'blood_glucose',
        fieldName: 'bloodGlucose',
        getNormalRange: () => {
          const range = abnormalRanges.find(r => r.measurementType === 'blood_glucose')
          return range?.normalRange?.bloodGlucose ? `${range.normalRange.bloodGlucose.min}-${range.normalRange.bloodGlucose.max}` : '70-140'
        }
      }
    ]

    return measurementItems.map((item, index) => {
      const hasValue = item.value !== undefined && item.value !== null
      
      // 使用全局异常值范围检查是否异常
      const isAbnormal = hasValue && checkValueIsAbnormal(item.measurementType, item.fieldName, item.value)
      
      return (
        <div key={index} className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-50">
          <span className="text-gray-700 font-medium min-w-[60px]">{item.label}：</span>
          <div className="flex items-center space-x-2">
            {hasValue ? (
              <>
                <span className={`font-semibold ${isAbnormal ? 'text-red-600' : 'text-green-600'}`}>
                  {item.value} {item.unit}
                </span>
                {isAbnormal ? (
                  <Badge variant="destructive" className="text-xs">異常</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">正常</Badge>
                )}
                <span className="text-xs text-gray-500">
                  (正常: {item.getNormalRange()})
                </span>
              </>
            ) : (
              <span className="text-gray-400 italic">未測量</span>
            )}
          </div>
        </div>
      )
    })
  }

  const createTestMeasurement = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 使用当前登录用户的身份创建测试数据
      const currentUser = apiService.getCurrentUser()
      console.log('Creating test measurement for current user:', currentUser)
      
      const testMeasurement = await apiService.createTestMeasurement()
      console.log('Test measurement created:', testMeasurement)
      
      // 重新获取测量记录
      await fetchPatientMeasurements()
      
      setSuccess('測試數據創建成功！')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error creating test measurement:', error)
      setError('創建測試測量記錄時發生錯誤，請重試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            為 {patient.fullName || patient.name || patient.username} 創建診斷記錄
          </CardTitle>
          <CardDescription>
            患者ID: {patient._id || patient.id || patient.username || '未知'}
            {patient.email && ` | 邮箱: ${patient.email}`}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 患者測量記錄 */}
      <Card>
        <CardHeader>
          <CardTitle>相關測量記錄</CardTitle>
          <CardDescription>選擇與此次診斷相關的測量記錄（只能選擇一條）</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 调试信息 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">调试信息 (开发环境):</h4>
              <div className="text-xs text-gray-600 space-y-2">
                <p>患者ID: {patient._id || patient.id || '未知'}</p>
                <p>患者用户名: {patient.username || '未知'}</p>
                <p>找到 {measurements.length} 条测量记录</p>
                {error && (
                  <p className="text-red-600 font-medium">错误: {error}</p>
                )}
                {measurements.length === 0 && (
                  <div className="mt-2">
                    <Button 
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={createTestMeasurement}
                      disabled={loading}
                    >
                      创建测试测量数据
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      如果患者没有测量记录，可以创建一些测试数据
                    </p>
                  </div>
                )}
              </div>
              {measurements.length > 0 && (
                <details className="text-xs mt-2">
                  <summary className="cursor-pointer text-gray-700 hover:text-gray-900">
                    查看第一条测量记录数据结构
                  </summary>
                  <pre className="mt-2 overflow-auto bg-white p-2 rounded border text-xs">
                    {JSON.stringify(measurements[0], null, 2)}
                  </pre>
                </details>
              )}
              {measurements.length === 0 && (
                <details className="text-xs mt-2">
                  <summary className="cursor-pointer text-gray-700 hover:text-gray-900">
                    查看患者对象结构
                  </summary>
                  <pre className="mt-2 overflow-auto bg-white p-2 rounded border text-xs">
                    {JSON.stringify(patient, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          <div className="space-y-3">
            {measurements.length === 0 ? (
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3 mb-3">
                  <Checkbox disabled />
                  <span className="font-medium text-gray-500">暫無測量記錄</span>
                </div>
                <div className="ml-8 space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">收縮壓：</span>
                    <span className="text-gray-400">未測量</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">舒張壓：</span>
                    <span className="text-gray-400">未測量</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">心率：</span>
                    <span className="text-gray-400">未測量</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">體溫：</span>
                    <span className="text-gray-400">未測量</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">血氧：</span>
                    <span className="text-gray-400">未測量</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">血糖：</span>
                    <span className="text-gray-400">未測量</span>
                  </div>
                </div>
              </div>
            ) : (
              measurements.slice(0, 10).map((measurement) => (
                <div key={measurement._id} className={`border rounded-lg p-4 ${measurement.isAbnormal ? 'border-red-200 bg-red-50/30' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={`measurement-${measurement._id}`}
                      checked={selectedMeasurements.includes(measurement._id)}
                      onCheckedChange={(checked) => handleMeasurementSelect(measurement._id, checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-lg">{getMeasurementLabel(measurement)}</span>
                          {measurement.isAbnormal && (
                            <Badge variant="destructive">整體異常</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(measurement.createdAt || measurement.measurementTime).toLocaleString('zh-TW')}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                          {renderDetailedMeasurementValues(measurement)}
                        </div>
                      </div>
                      
                      {measurement.location && (
                        <p className="text-sm text-gray-500 mt-2 flex items-center">
                          <span className="mr-1">📍</span>
                          地點: {measurement.location}
                        </p>
                      )}
                      
                      {measurement.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          備註: {measurement.notes}
                        </p>
                      )}

                      {/* 患者症状信息 - 图片展示 */}
                      {measurement.imagePaths && measurement.imagePaths.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <span className="mr-2">📷</span>
                            患者症狀信息
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {measurement.imagePaths.map((imagePath, index) => {
                              // 优先使用后端提供的完整URL，如果没有则构建URL
                              let imageUrl;
                              if (measurement.imageUrls && measurement.imageUrls[index]) {
                                imageUrl = measurement.imageUrls[index];
                              } else {
                                // 兼容旧数据：从路径中提取用户ID和文件名
                                const pathParts = imagePath.split('/');
                                const filename = pathParts[pathParts.length - 1];
                                const userId = measurement.userId?._id || measurement.userId;
                                imageUrl = apiService.getImageUrl(userId, filename);
                              }
                              
                              // 如果无法生成有效的图片URL，则不渲染此图片
                              if (!imageUrl) {
                                console.warn(`无法生成图片URL: imagePath=${imagePath}, userId=${measurement.userId?._id || measurement.userId}`);
                                return null;
                              }
                              
                              return (
                                <div key={index} className="relative group">
                                  <img
                                    src={imageUrl}
                                    alt={`患者症狀圖片 ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
                                    onClick={() => openImageViewer(measurement.imagePaths, measurement.userId?._id || measurement.userId, index, measurement.imageUrls)}
                                    onError={(e) => {
                                      console.error(`图片加载失败: ${imageUrl}`);
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                                    圖片 {index + 1}
                                  </div>
                                </div>
                              );
                            }).filter(Boolean)}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            點擊圖片可查看大圖 • 共 {measurement.imagePaths.length} 張圖片
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
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

      {/* 图片查看器 */}
      <ImageViewer
        images={currentImagePaths}
        userId={currentImageUserId}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        initialIndex={currentImageIndex}
        imageUrls={currentImageUrls}
      />
    </div>
  )
}

