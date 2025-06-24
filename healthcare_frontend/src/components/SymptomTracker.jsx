import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  Thermometer, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Clock,
  Activity
} from 'lucide-react'

export default function SymptomTracker({ user, assessmentHistory = [] }) {
  const [symptoms, setSymptoms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSymptomHistory()
  }, [user])

  const loadSymptomHistory = async () => {
    try {
      // 從localStorage獲取症狀追蹤數據
      const storedSymptoms = localStorage.getItem('symptom_tracking')
      if (storedSymptoms) {
        const allSymptoms = JSON.parse(storedSymptoms)
        const userSymptoms = allSymptoms.filter(s => s.user_id === user.username)
        setSymptoms(userSymptoms)
      }
    } catch (error) {
      console.error('Error loading symptom history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSymptomTrend = (symptomId) => {
    const recentSymptoms = symptoms
      .filter(s => s.symptoms.includes(symptomId))
      .sort((a, b) => new Date(b.assessed_at) - new Date(a.assessed_at))
      .slice(0, 3)

    if (recentSymptoms.length < 2) return 'stable'

    const latest = recentSymptoms[0]
    const previous = recentSymptoms[1]

    if (latest.risk_score > previous.risk_score) return 'worsening'
    if (latest.risk_score < previous.risk_score) return 'improving'
    return 'stable'
  }

  const getTemperatureTrend = () => {
    const recentTemps = symptoms
      .filter(s => s.temperature)
      .sort((a, b) => new Date(b.assessed_at) - new Date(a.assessed_at))
      .slice(0, 5)
      .map(s => s.temperature)

    if (recentTemps.length < 2) return { trend: 'stable', data: recentTemps }

    const latest = recentTemps[0]
    const average = recentTemps.slice(1).reduce((a, b) => a + b, 0) / (recentTemps.length - 1)

    return {
      trend: latest > average + 0.5 ? 'rising' : latest < average - 0.5 ? 'falling' : 'stable',
      data: recentTemps,
      latest: latest,
      average: average.toFixed(1)
    }
  }

  const getRiskTrend = () => {
    const recentRisks = symptoms
      .sort((a, b) => new Date(b.assessed_at) - new Date(a.assessed_at))
      .slice(0, 5)
      .map(s => s.risk_score)

    if (recentRisks.length < 2) return { trend: 'stable', data: recentRisks }

    const latest = recentRisks[0]
    const previous = recentRisks[1]

    return {
      trend: latest > previous ? 'increasing' : latest < previous ? 'decreasing' : 'stable',
      data: recentRisks,
      latest: latest,
      change: latest - previous
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">載入中...</div>
        </CardContent>
      </Card>
    )
  }

  if (symptoms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            症狀追蹤
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暫無症狀追蹤數據</p>
            <p className="text-sm">完成評估後，追蹤數據將顯示在這裡</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const temperatureTrend = getTemperatureTrend()
  const riskTrend = getRiskTrend()
  const latestAssessment = symptoms[symptoms.length - 1]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            症狀追蹤概覽
          </CardTitle>
          <CardDescription>
            追蹤您的症狀變化和健康趨勢
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 體溫趨勢 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Thermometer className="h-5 w-5" />
              體溫趨勢
            </CardTitle>
          </CardHeader>
          <CardContent>
            {temperatureTrend.data.length > 0 ? (
              <div className="space-y-3">
                <div className="text-2xl font-bold">
                  {temperatureTrend.latest}°C
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      temperatureTrend.trend === 'rising' ? 'destructive' :
                      temperatureTrend.trend === 'falling' ? 'default' : 'secondary'
                    }
                  >
                    {temperatureTrend.trend === 'rising' ? '上升' :
                     temperatureTrend.trend === 'falling' ? '下降' : '穩定'}
                  </Badge>
                  {temperatureTrend.average && (
                    <span className="text-sm text-gray-500">
                      平均: {temperatureTrend.average}°C
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  基於最近 {temperatureTrend.data.length} 次測量
                </div>
              </div>
            ) : (
              <div className="text-gray-500">暫無體溫數據</div>
            )}
          </CardContent>
        </Card>

        {/* 風險評分趨勢 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5" />
              風險趨勢
            </CardTitle>
          </CardHeader>
          <CardContent>
            {riskTrend.data.length > 0 ? (
              <div className="space-y-3">
                <div className="text-2xl font-bold">
                  {riskTrend.latest} 分
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      riskTrend.trend === 'increasing' ? 'destructive' :
                      riskTrend.trend === 'decreasing' ? 'default' : 'secondary'
                    }
                  >
                    {riskTrend.trend === 'increasing' ? '上升' :
                     riskTrend.trend === 'decreasing' ? '下降' : '穩定'}
                  </Badge>
                  {riskTrend.change !== 0 && (
                    <span className="text-sm text-gray-500">
                      {riskTrend.change > 0 ? '+' : ''}{riskTrend.change}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  基於最近 {riskTrend.data.length} 次評估
                </div>
              </div>
            ) : (
              <div className="text-gray-500">暫無風險數據</div>
            )}
          </CardContent>
        </Card>

        {/* 最新評估 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              最新評估
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestAssessment ? (
              <div className="space-y-3">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${latestAssessment.risk_level.color} text-white`}>
                  {latestAssessment.risk_level.label}
                </div>
                <div className="text-sm text-gray-600">
                  {latestAssessment.assessment_type === 'covid' ? 'COVID-19' : '流感'} 評估
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(latestAssessment.assessed_at).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">暫無評估記錄</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 症狀歷史 */}
      <Card>
        <CardHeader>
          <CardTitle>評估歷史</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {symptoms.slice(-5).reverse().map((assessment, index) => (
              <div key={assessment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {assessment.assessment_type === 'covid' ? 'COVID-19' : '流感'}
                    </Badge>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${assessment.risk_level.color} text-white`}>
                      {assessment.risk_level.label}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(assessment.assessed_at).toLocaleString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">症狀數量:</span>
                    <span className="ml-1 font-medium">{assessment.symptoms.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">風險評分:</span>
                    <span className="ml-1 font-medium">{assessment.risk_score}</span>
                  </div>
                  {assessment.temperature && (
                    <div>
                      <span className="text-gray-500">體溫:</span>
                      <span className="ml-1 font-medium">{assessment.temperature}°C</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">接觸史:</span>
                    <span className="ml-1 font-medium">
                      {assessment.exposure_history === 'confirmed' ? '確診接觸' :
                       assessment.exposure_history === 'suspected' ? '疑似接觸' :
                       assessment.exposure_history === 'community' ? '社區接觸' : '無'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 健康建議 */}
      {latestAssessment && latestAssessment.risk_level.level !== 'very_low' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            根據您的最新評估結果，建議您密切關注症狀變化。如症狀惡化或出現新症狀，請及時進行新的評估或諮詢醫療專業人員。
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

