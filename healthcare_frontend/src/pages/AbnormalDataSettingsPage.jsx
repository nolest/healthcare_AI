import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Activity, Heart, Thermometer, Zap, Settings, Save, RotateCcw } from 'lucide-react'
import apiService from '../services/api'
import MedicalHeader from '../components/ui/MedicalHeader'

export default function AbnormalDataSettingsPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [abnormalRanges, setAbnormalRanges] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // 預設分界點配置 - 用戶只需要設定這些關鍵分界點
  const defaultBoundaries = {
    blood_pressure: {
      measurementType: 'blood_pressure',
      name: '血壓',
      unit: 'mmHg',
      icon: Activity,
      color: 'blue',
      parameters: {
        systolic: {
          name: '收縮壓',
          boundaries: {
            severe_low_max: 70,    // 嚴重低血壓上限
            low_max: 90,           // 低血壓上限 (正常下限)
            normal_max: 140,       // 正常上限 (高血壓下限)
            high_max: 160,         // 高血壓1期上限
            severe_high_max: 180   // 高血壓2期上限 (危象下限)
          },
          absoluteMin: 0,
          absoluteMax: 250
        },
        diastolic: {
          name: '舒張壓',
          boundaries: {
            severe_low_max: 40,
            low_max: 60,
            normal_max: 90,
            high_max: 100,
            severe_high_max: 110
          },
          absoluteMin: 0,
          absoluteMax: 150
        }
      }
    },
    heart_rate: {
      measurementType: 'heart_rate',
      name: '心率',
      unit: 'bpm',
      icon: Heart,
      color: 'red',
      parameters: {
        rate: {
          name: '心率',
          boundaries: {
            severe_low_max: 40,    // 嚴重心動過緩上限
            low_max: 60,           // 心動過緩上限 (正常下限)
            normal_max: 100,       // 正常上限 (心動過速下限)
            high_max: 120,         // 輕度心動過速上限
            severe_high_max: 150   // 中度心動過速上限 (嚴重心動過速下限)
          },
          absoluteMin: 0,
          absoluteMax: 250
        }
      }
    },
    temperature: {
      measurementType: 'temperature',
      name: '體溫',
      unit: '°C',
      icon: Thermometer,
      color: 'orange',
      parameters: {
        temperature: {
          name: '體溫',
          boundaries: {
            severe_low_max: 35.0,
            low_max: 36.1,
            normal_max: 37.2,
            high_max: 38.3,
            severe_high_max: 39.1
          },
          absoluteMin: 30.0,
          absoluteMax: 45.0
        }
      }
    },
    oxygen_saturation: {
      measurementType: 'oxygen_saturation',
      name: '血氧飽和度',
      unit: '%',
      icon: Zap,
      color: 'purple',
      parameters: {
        oxygen_saturation: {
          name: '血氧飽和度',
          boundaries: {
            severe_low_max: 85,
            low_max: 95,  // 匹配數據庫中的min值
            normal_max: 100, // 匹配數據庫中的max值
            high_max: 100,
            severe_high_max: 100
          },
          absoluteMin: 0,
          absoluteMax: 100
        }
      }
    }
  }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setCurrentUser(user)
    loadAbnormalRanges()
  }, [])

  const loadAbnormalRanges = async () => {
    setLoading(true)
    try {
      const response = await apiService.getAbnormalRanges()
      const ranges = Array.isArray(response) ? response : (response.data || [])
      console.log('📥 從API載入的異常範圍:', ranges)
      
      // 將API資料轉換為分界點格式
      const boundariesData = { ...defaultBoundaries }
      ranges.forEach(range => {
        if (boundariesData[range.measurementType]) {
          boundariesData[range.measurementType].apiData = range
          // 如果有API資料，嘗試從正常範圍推導分界點
          if (range.normalRange) {
            // 後端到前端的參數名映射
            const backendToFrontendMapping = {
              'systolic': 'systolic',
              'diastolic': 'diastolic',
              'heartRate': 'rate',
              'temperature': 'temperature',
              'oxygenSaturation': 'oxygen_saturation'
            }
            
            Object.keys(range.normalRange).forEach(backendParam => {
              const frontendParam = backendToFrontendMapping[backendParam] || backendParam
              if (boundariesData[range.measurementType].parameters[frontendParam]) {
                const normalRange = range.normalRange[backendParam]
                const abnormalRange = range.abnormalRanges?.[backendParam]
                
                if (abnormalRange) {
                  // 如果有完整的異常範圍，從異常範圍反推分界點
                  console.log(`📊 從異常範圍載入 ${range.measurementType}.${backendParam}:`, abnormalRange)
                  
                  // 從異常範圍反推分界點
                  const boundaries = {}
                  
                  // 從異常範圍反推分界點
                  // 嚴重偏低上限 = severeLow.max
                  if (abnormalRange.severeLow?.max !== undefined) {
                    boundaries.severe_low_max = abnormalRange.severeLow.max
                  }
                  
                  // 偏低上限 = low.max = 正常下限
                  if (abnormalRange.low?.max !== undefined) {
                    boundaries.low_max = abnormalRange.low.max
                  } else if (normalRange.min !== undefined) {
                    boundaries.low_max = normalRange.min
                  }
                  
                  // 正常上限 = normal.max
                  if (normalRange.max !== undefined) {
                    boundaries.normal_max = normalRange.max
                  }
                  
                  // 偏高上限 = high.max
                  if (abnormalRange.high?.max !== undefined) {
                    boundaries.high_max = abnormalRange.high.max
                  } else {
                    boundaries.high_max = normalRange.max || boundaries.normal_max
                  }
                  
                  // 嚴重偏高上限 = severeHigh.max
                  if (abnormalRange.severeHigh?.max !== undefined) {
                    boundaries.severe_high_max = abnormalRange.severeHigh.max
                  } else {
                    boundaries.severe_high_max = boundaries.high_max || boundaries.normal_max
                  }
                  
                  // 確保所有分界點都有值，使用預設值填補
                  const defaultBoundaries = boundariesData[range.measurementType].parameters[frontendParam].boundaries
                  boundaries.severe_low_max = boundaries.severe_low_max ?? defaultBoundaries.severe_low_max
                  boundaries.low_max = boundaries.low_max ?? defaultBoundaries.low_max
                  boundaries.normal_max = boundaries.normal_max ?? defaultBoundaries.normal_max
                  boundaries.high_max = boundaries.high_max ?? defaultBoundaries.high_max
                  boundaries.severe_high_max = boundaries.severe_high_max ?? defaultBoundaries.severe_high_max
                  
                  // 更新分界點
                  Object.assign(boundariesData[range.measurementType].parameters[frontendParam].boundaries, boundaries)
                  
                  console.log(`✅ 反推的分界點:`, boundaries)
                } else {
                  // 如果沒有異常範圍，只使用正常範圍
                  boundariesData[range.measurementType].parameters[frontendParam].boundaries.low_max = normalRange.min
                  boundariesData[range.measurementType].parameters[frontendParam].boundaries.normal_max = normalRange.max
                  console.log(`🔄 僅載入正常範圍 ${range.measurementType}.${backendParam} -> ${frontendParam}:`, normalRange)
                }
              } else {
                console.warn(`⚠️ 找不到前端參數 ${frontendParam} 在 ${range.measurementType}`)
              }
            })
          }
        } else {
          console.warn(`⚠️ 找不到測量類型 ${range.measurementType} 的配置`)
        }
      })
      
      console.log('🎯 最終的分界點數據:', boundariesData)
      setAbnormalRanges(boundariesData)
    } catch (error) {
      console.error('載入異常範圍設定失敗:', error)
      setAbnormalRanges(defaultBoundaries)
    } finally {
      setLoading(false)
    }
  }

  // 根據分界點生成完整的範圍
  const generateRangesFromBoundaries = (boundaries, absoluteMin, absoluteMax) => {
    const ranges = {}
    
    ranges.severe_low = [absoluteMin, boundaries.severe_low_max]
    ranges.low = [boundaries.severe_low_max, boundaries.low_max]
    ranges.normal = [boundaries.low_max, boundaries.normal_max]
    ranges.high = [boundaries.normal_max, boundaries.high_max]
    ranges.severe_high = [boundaries.high_max, boundaries.severe_high_max]
    ranges.critical = [boundaries.severe_high_max, absoluteMax]
    
    return ranges
  }

  const handleBoundaryChange = (measurementType, parameter, boundaryKey, value) => {
    setAbnormalRanges(prev => ({
      ...prev,
      [measurementType]: {
        ...prev[measurementType],
        parameters: {
          ...prev[measurementType].parameters,
          [parameter]: {
            ...prev[measurementType].parameters[parameter],
            boundaries: {
              ...prev[measurementType].parameters[parameter].boundaries,
              [boundaryKey]: parseFloat(value) || 0
            }
          }
        }
      }
    }))
  }

  const resetToDefaults = (measurementType, parameter) => {
    setAbnormalRanges(prev => ({
      ...prev,
      [measurementType]: {
        ...prev[measurementType],
        parameters: {
          ...prev[measurementType].parameters,
          [parameter]: {
            ...prev[measurementType].parameters[parameter],
            boundaries: { ...defaultBoundaries[measurementType].parameters[parameter].boundaries }
          }
        }
      }
    }))
  }

  const validateBoundaries = (boundaries) => {
    const orderedKeys = ['severe_low_max', 'low_max', 'normal_max', 'high_max', 'severe_high_max']
    const errors = []
    
    for (let i = 0; i < orderedKeys.length - 1; i++) {
      const current = boundaries[orderedKeys[i]]
      const next = boundaries[orderedKeys[i + 1]]
      
      if (current >= next) {
        errors.push(`${getBoundaryLabel(orderedKeys[i])} 必須小於 ${getBoundaryLabel(orderedKeys[i + 1])}`)
      }
    }
    
    return errors
  }

  const getBoundaryLabel = (boundaryKey) => {
    const labels = {
      severe_low_max: '嚴重偏低上限',
      low_max: '偏低上限',
      normal_max: '正常上限',
      high_max: '偏高上限',
      severe_high_max: '嚴重偏高上限'
    }
    return labels[boundaryKey] || boundaryKey
  }

  const getRangeColor = (rangeType) => {
    const colors = {
      critical: 'bg-red-500',
      severe_high: 'bg-red-400',
      high: 'bg-orange-400',
      normal: 'bg-green-500',
      low: 'bg-yellow-400',
      severe_low: 'bg-orange-500'
    }
    return colors[rangeType] || 'bg-gray-400'
  }

  const getRangeLabel = (rangeType) => {
    const labels = {
      critical: '危急',
      severe_high: '嚴重偏高',
      high: '偏高',
      normal: '正常',
      low: '偏低',
      severe_low: '嚴重偏低'
    }
    return labels[rangeType] || rangeType
  }

  const saveAllSettings = async () => {
    setSaving(true)
    try {
      for (const [measurementType, config] of Object.entries(abnormalRanges)) {
        console.log(`🔧 處理 ${measurementType} 的設定...`, config)
        
        const normalRange = {}
        
        // 參數名稱映射：前端參數名 -> 後端期望的參數名
        const parameterMapping = {
          'systolic': 'systolic',
          'diastolic': 'diastolic',
          'rate': 'heartRate',
          'temperature': 'temperature',
          'oxygen_saturation': 'oxygenSaturation'
        }
        
        console.log(`📋 ${measurementType} 的參數:`, Object.keys(config.parameters))
        
        const abnormalRanges = {}
        
        Object.entries(config.parameters).forEach(([parameter, paramConfig]) => {
          const backendParamName = parameterMapping[parameter] || parameter
          const boundaries = paramConfig.boundaries
          const absoluteMin = paramConfig.absoluteMin || 0
          const absoluteMax = paramConfig.absoluteMax || 1000
          
          // 正常範圍
          const normalRangeData = {
            min: parseFloat(boundaries.low_max),
            max: parseFloat(boundaries.normal_max)
          }
          normalRange[backendParamName] = normalRangeData
          
          // 異常範圍
          const abnormalRangeData = {
            severeLow: {
              min: absoluteMin,
              max: parseFloat(boundaries.severe_low_max)
            },
            low: {
              min: parseFloat(boundaries.severe_low_max),
              max: parseFloat(boundaries.low_max)
            },
            high: {
              min: parseFloat(boundaries.normal_max),
              max: parseFloat(boundaries.high_max)
            },
            severeHigh: {
              min: parseFloat(boundaries.high_max),
              max: parseFloat(boundaries.severe_high_max)
            },
            critical: {
              min: parseFloat(boundaries.severe_high_max),
              max: absoluteMax
            }
          }
          abnormalRanges[backendParamName] = abnormalRangeData
          
          console.log(`📊 ${parameter} -> ${backendParamName}:`)
          console.log('  正常範圍:', normalRangeData)
          console.log('  異常範圍:', abnormalRangeData)
        })

        // 創建和更新使用不同的數據格式
        if (config.apiData && config.apiData._id) {
          // 更新時不包含 measurementType
          const updateData = {
            name: config.name,
            normalRange,
            abnormalRanges,
            unit: config.unit,
            description: `${config.name}的異常範圍設定`,
            isActive: true
          }
          console.log(`🔄 更新 ${measurementType} (ID: ${config.apiData._id}):`, updateData)
          await apiService.updateAbnormalRange(config.apiData._id, updateData)
        } else {
          // 創建時包含 measurementType
          const createData = {
            measurementType,
            name: config.name,
            normalRange,
            abnormalRanges,
            unit: config.unit,
            description: `${config.name}的異常範圍設定`,
            isActive: true
          }
          console.log(`✨ 創建 ${measurementType}:`, createData)
          await apiService.createAbnormalRange(createData)
        }
        
        console.log(`✅ ${measurementType} 處理完成`)
      }

      setMessage('✅ 異常範圍設定已成功儲存！')
      setTimeout(() => setMessage(''), 3000)
      
      // 重新載入設定以確保同步
      await loadAbnormalRanges()
    } catch (error) {
      console.error('儲存異常範圍設定失敗:', error)
      console.error('錯誤詳情:', error.response?.data || error.message)
      setMessage(`❌ 儲存設定失敗: ${error.response?.data?.message || error.message}`)
      setTimeout(() => setMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const renderMeasurementConfig = (measurementType, config) => {
    const IconComponent = config.icon
    
    return (
      <Card key={measurementType} className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg shadow-xl shadow-gray-500/10 hover:shadow-2xl hover:shadow-gray-500/15 transition-all duration-300 group border-0 ring-1 ring-white/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-800 flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br from-${config.color}-100 to-${config.color}-50 shadow-sm group-hover:shadow-md transition-all duration-300`}>
              <IconComponent className={`h-6 w-6 text-${config.color}-600 group-hover:scale-110 transition-transform duration-300`} />
            </div>
            {config.name}
            <Badge variant="outline" className="ml-auto bg-white/80 backdrop-blur-sm shadow-sm border-0 ring-1 ring-gray-200/50">
              {config.unit}
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-600">
            設定 {config.name} 的關鍵分界點，系統將自動生成完整的異常範圍
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(config.parameters).map(([parameter, paramConfig]) => {
            const ranges = generateRangesFromBoundaries(
              paramConfig.boundaries,
              paramConfig.absoluteMin,
              paramConfig.absoluteMax
            )
            const validationErrors = validateBoundaries(paramConfig.boundaries)
            
            return (
              <div key={parameter} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-700">{paramConfig.name}</h4>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => resetToDefaults(measurementType, parameter)}
                      className="px-3 py-1 text-xs bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white/90 shadow-sm hover:shadow-md transition-all duration-200 border-0 ring-1 ring-gray-200/50 hover:ring-gray-300/60"
                    >
                      <RotateCcw className="h-3 w-3 mr-1 inline" />
                      重置預設
                    </button>
                    <div className="text-sm text-gray-500">
                      正常範圍: {ranges.normal[0]} - {ranges.normal[1]} {config.unit}
                    </div>
                  </div>
                </div>
                
                {/* 範圍視覺化 - 美化版本 */}
                <div className="relative">
                  <div className="flex h-10 rounded-xl overflow-hidden bg-gradient-to-r from-gray-50 to-white shadow-lg backdrop-blur-sm">
                    {Object.entries(ranges).map(([rangeType, values]) => {
                      const totalRange = paramConfig.absoluteMax - paramConfig.absoluteMin
                      const width = ((values[1] - values[0]) / totalRange) * 100
                      return (
                        <div
                          key={rangeType}
                          className={`${getRangeColor(rangeType)} flex items-center justify-center text-white text-xs font-medium transition-all duration-300 hover:scale-105 hover:z-10 relative group shadow-sm`}
                          style={{ width: `${width}%` }}
                        >
                          {width > 12 && getRangeLabel(rangeType)}
                          {/* 懸停提示 */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                            {values[0]}-{values[1]} {config.unit}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                    <span>{paramConfig.absoluteMin}</span>
                    <span>{paramConfig.absoluteMax}</span>
                  </div>
                </div>

                {/* 分界點設定 - 美化版本 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(paramConfig.boundaries).map(([boundaryKey, value]) => (
                    <div key={boundaryKey} className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        {getBoundaryLabel(boundaryKey)}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={value}
                          onChange={(e) => handleBoundaryChange(measurementType, parameter, boundaryKey, e.target.value)}
                          step={measurementType === 'temperature' ? 0.1 : 1}
                          min={paramConfig.absoluteMin}
                          max={paramConfig.absoluteMax}
                          className="w-20 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg focus:bg-white/90 border-0 ring-1 ring-gray-200/50 focus:ring-blue-400/50"
                        />
                        <span className="text-sm text-gray-500 font-medium">{config.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 生成的範圍預覽 - 美化版本 */}
                <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 backdrop-blur-sm rounded-xl p-5 shadow-sm">
                  <h5 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    生成的範圍預覽
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    {Object.entries(ranges).map(([rangeType, values]) => (
                      <div key={rangeType} className="flex items-center gap-2 p-2 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-white/80 transition-all duration-200 group">
                        <div className={`w-3 h-3 rounded-full ${getRangeColor(rangeType)} shadow-sm group-hover:scale-110 transition-transform duration-200`}></div>
                        <span className="text-gray-700 font-medium">
                          {getRangeLabel(rangeType)}: {values[0]}-{values[1]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 驗證錯誤 - 美化版本 */}
                {validationErrors.length > 0 && (
                  <div className="bg-gradient-to-br from-red-50/80 to-pink-50/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-red-800 text-sm font-semibold mb-3">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">!</div>
                      設定錯誤
                    </div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto w-32 h-32">
            <div className="animate-spin rounded-full h-32 w-32 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 p-1">
              <div className="bg-white rounded-full h-full w-full flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-gray-600">載入設定中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* 背景裝飾元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-200/20 to-green-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* 標題 */}
      <MedicalHeader 
        title="異常範圍設定"
        subtitle="設定關鍵分界點，系統自動生成完整的異常檢測範圍"
        icon={Settings}
        showBackButton={true}
        user={currentUser}
        onBack={() => navigate('/medical')}
      />

      {/* 主要內容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        {/* 說明資訊 */}
        <div className="mb-8">
          <Alert className="bg-gradient-to-br from-blue-50/90 to-blue-100/70 backdrop-blur-lg shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/15 transition-all duration-300 border-0 ring-1 ring-blue-200/30">
            <Settings className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>分界點設定</strong> - 只需設定幾個關鍵分界點，系統將自動生成完整的異常範圍。這種方式更直觀，確保範圍邏輯正確。
            </AlertDescription>
          </Alert>
        </div>

        {/* 配置卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {Object.entries(abnormalRanges).map(([measurementType, config]) => 
            renderMeasurementConfig(measurementType, config)
          )}
        </div>

        {/* 儲存按鈕 */}
        <div className="flex justify-center">
          <Button
            onClick={saveAllSettings}
            disabled={saving}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Save className={`h-5 w-5 mr-2 ${saving ? 'animate-spin' : ''}`} />
            {saving ? '儲存中...' : '儲存所有設定'}
          </Button>
        </div>

        {/* 訊息提示 - 美化版本 */}
        {message && (
          <div className="fixed bottom-4 right-4 bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg rounded-xl shadow-2xl shadow-gray-500/20 p-4 max-w-sm z-50 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-700 font-medium">{message}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 