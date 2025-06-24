import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Heart, Activity, Thermometer, Droplets, RefreshCw, Calendar } from 'lucide-react'
import mockDataStore from '../utils/mockDataStore.js'

export default function MeasurementHistory({ measurements: propMeasurements, onRefresh }) {
  const [measurements, setMeasurements] = useState([])
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  // 如果有传入的measurements属性，使用它；否则从mockDataStore获取
  useEffect(() => {
    if (propMeasurements) {
      console.log('Using measurements from props:', propMeasurements.length)
      setMeasurements(propMeasurements)
    } else {
      loadMeasurements()
    }
  }, [propMeasurements])

  // 加載測量數據
  const loadMeasurements = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
    
    if (!currentUser.username) {
      console.log('No current user found')
      setMeasurements([])
      return
    }
    
    // 使用mockDataStore獲取當前用戶的測量記錄
    const userMeasurements = mockDataStore.getMeasurementsByUserId(currentUser.username)
    console.log('Loading measurements for user:', currentUser.username, 'Found:', userMeasurements.length)
    
    setMeasurements(userMeasurements)
  }

  // 組件掛載時加載數據（仅在没有传入measurements时）
  useEffect(() => {
    if (!propMeasurements) {
      loadMeasurements()
      
      // 監聽數據變化
      mockDataStore.addListener(loadMeasurements)
      
      // 清理監聽器
      return () => {
        mockDataStore.removeListener(loadMeasurements)
      }
    }
  }, [propMeasurements])

  // 刷新數據
  const handleRefresh = () => {
    if (!propMeasurements) {
      loadMeasurements()
    }
    if (onRefresh) {
      onRefresh()
    }
  }

  const getMeasurementIcon = (type) => {
    switch (type) {
      case 'blood_pressure':
        return <Heart className="h-5 w-5" />
      case 'heart_rate':
        return <Activity className="h-5 w-5" />
      case 'temperature':
        return <Thermometer className="h-5 w-5" />
      case 'oxygen_saturation':
        return <Droplets className="h-5 w-5" />
      default:
        return <Activity className="h-5 w-5" />
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

  const filteredMeasurements = measurements.filter(measurement => {
    if (filter === 'all') return true
    if (filter === 'abnormal') return measurement.is_abnormal
    return measurement.measurement_type === filter
  })

  const sortedMeasurements = [...filteredMeasurements].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.measured_at) - new Date(a.measured_at)
    }
    if (sortBy === 'type') {
      return a.measurement_type.localeCompare(b.measurement_type)
    }
    return 0
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>測量歷史記錄</CardTitle>
              <CardDescription>查看您的所有測量數據</CardDescription>
            </div>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 過濾和排序控制 */}
          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="篩選類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="abnormal">異常值</SelectItem>
                  <SelectItem value="blood_pressure">血壓</SelectItem>
                  <SelectItem value="heart_rate">心率</SelectItem>
                  <SelectItem value="temperature">體溫</SelectItem>
                  <SelectItem value="oxygen_saturation">血氧飽和度</SelectItem>
                  <SelectItem value="blood_glucose">血糖</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">按日期</SelectItem>
                  <SelectItem value="type">按類型</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 測量記錄列表 */}
          {sortedMeasurements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">暫無測量記錄</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedMeasurements.map((measurement) => (
                <Card key={measurement.id} className={`${measurement.is_abnormal ? 'border-red-200 bg-red-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${measurement.is_abnormal ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          {getMeasurementIcon(measurement.measurement_type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{getMeasurementLabel(measurement.measurement_type)}</h3>
                          <p className="text-2xl font-bold">{formatMeasurementValue(measurement)}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {new Date(measurement.measured_at).toLocaleString('zh-TW')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {measurement.is_abnormal && (
                          <Badge variant="destructive" className="mb-2">異常</Badge>
                        )}
                        {measurement.location && (
                          <p className="text-sm text-gray-500">{measurement.location}</p>
                        )}
                        {measurement.device_id && (
                          <p className="text-xs text-gray-400">設備: {measurement.device_id}</p>
                        )}
                      </div>
                    </div>
                    {measurement.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600">
                          <strong>備註：</strong>{measurement.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

