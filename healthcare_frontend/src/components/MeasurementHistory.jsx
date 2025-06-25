import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Heart, Activity, Thermometer, Droplets, RefreshCw, Calendar } from 'lucide-react'
import apiService from '../services/api.js'

export default function MeasurementHistory({ measurements: propMeasurements, onRefresh }) {
  const [measurements, setMeasurements] = useState([])
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 如果有传入的measurements属性，使用它；否则从API获取
  useEffect(() => {
    if (propMeasurements) {
      console.log('Using measurements from props:', propMeasurements.length)
      setMeasurements(propMeasurements)
    } else {
      loadMeasurements()
    }
  }, [propMeasurements])

  // 加載測量數據
  const loadMeasurements = async () => {
    if (!apiService.isAuthenticated()) {
      console.log('User not authenticated')
      setMeasurements([])
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const userMeasurements = await apiService.getMyMeasurements()
      console.log('Loading measurements from API:', userMeasurements.length)
      setMeasurements(userMeasurements)
    } catch (error) {
      console.error('Error loading measurements:', error)
      setError('加載測量記錄失敗')
      setMeasurements([])
    } finally {
      setLoading(false)
    }
  }

  // 刷新數據
  const handleRefresh = async () => {
    if (!propMeasurements) {
      await loadMeasurements()
    }
    if (onRefresh) {
      onRefresh()
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
    
    return values.join(' | ')
  }

  const getStatusBadge = (measurement) => {
    if (measurement.isAbnormal) {
      return <Badge variant="destructive">異常</Badge>
    }
    
    switch (measurement.status) {
      case 'pending':
        return <Badge variant="secondary">待處理</Badge>
      case 'processed':
        return <Badge variant="outline">已處理</Badge>
      case 'reviewed':
        return <Badge variant="default">已審核</Badge>
      default:
        return <Badge variant="secondary">未知</Badge>
    }
  }

  const filteredMeasurements = measurements.filter(measurement => {
    if (filter === 'all') return true
    if (filter === 'abnormal') return measurement.isAbnormal
    if (filter === 'pending') return measurement.status === 'pending'
    return true
  })

  const sortedMeasurements = [...filteredMeasurements].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt || b.measurementTime) - new Date(a.createdAt || a.measurementTime)
    }
    if (sortBy === 'status') {
      return a.status.localeCompare(b.status)
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
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

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
                  <SelectItem value="pending">待處理</SelectItem>
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
                  <SelectItem value="status">按狀態</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 測量記錄列表 */}
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">加載中...</p>
            </div>
          ) : sortedMeasurements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">暫無測量記錄</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedMeasurements.map((measurement) => (
                <Card key={measurement._id} className={`${measurement.isAbnormal ? 'border-red-200 bg-red-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${measurement.isAbnormal ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          <Heart className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">生理指標測量</h3>
                          <p className="text-sm text-gray-600 mt-1">{formatMeasurementValue(measurement)}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {new Date(measurement.createdAt || measurement.measurementTime).toLocaleString('zh-TW')}
                            </span>
                          </div>
                          {measurement.notes && (
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>備註:</strong> {measurement.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(measurement)}
                      </div>
                    </div>
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



