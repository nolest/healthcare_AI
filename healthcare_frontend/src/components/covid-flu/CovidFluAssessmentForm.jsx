import { useState } from 'react'
import { Button } from '../ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx'
import { Badge } from '../ui/badge.jsx'
import { Alert, AlertDescription } from '../ui/alert.jsx'
import { Checkbox } from '../ui/checkbox.jsx'
import { Input } from '../ui/input.jsx'
import { Label } from '../ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx'
import { Textarea } from '../ui/textarea.jsx'
import { 
  Thermometer, 
  AlertTriangle, 
  Shield, 
  Activity,
  Info
} from 'lucide-react'
import apiService from '../../services/api.js'

// COVID-19和流感症状清单
const covidSymptoms = [
  { id: 'fever', label: '發燒 (≥37.5°C)', severity: 'high' },
  { id: 'cough', label: '咳嗽', severity: 'high' },
  { id: 'shortness_breath', label: '呼吸困難或氣促', severity: 'high' },
  { id: 'loss_taste_smell', label: '味覺或嗅覺喪失', severity: 'high' },
  { id: 'fatigue', label: '疲勞', severity: 'medium' },
  { id: 'body_aches', label: '肌肉或身體疼痛', severity: 'medium' },
  { id: 'headache', label: '頭痛', severity: 'medium' },
  { id: 'sore_throat', label: '喉嚨痛', severity: 'medium' },
  { id: 'runny_nose', label: '流鼻涕或鼻塞', severity: 'low' },
  { id: 'nausea', label: '噁心或嘔吐', severity: 'low' },
  { id: 'diarrhea', label: '腹瀉', severity: 'low' }
]

const fluSymptoms = [
  { id: 'fever', label: '發燒 (≥38°C)', severity: 'high' },
  { id: 'cough', label: '咳嗽', severity: 'high' },
  { id: 'body_aches', label: '肌肉或身體疼痛', severity: 'high' },
  { id: 'fatigue', label: '疲勞', severity: 'high' },
  { id: 'headache', label: '頭痛', severity: 'medium' },
  { id: 'sore_throat', label: '喉嚨痛', severity: 'medium' },
  { id: 'runny_nose', label: '流鼻涕或鼻塞', severity: 'medium' },
  { id: 'chills', label: '寒顫', severity: 'medium' },
  { id: 'nausea', label: '噁心或嘔吐', severity: 'low' },
  { id: 'diarrhea', label: '腹瀉', severity: 'low' }
]

// 風險因子
const riskFactors = [
  { id: 'age_65_plus', label: '65歲或以上', weight: 3 },
  { id: 'chronic_lung', label: '慢性肺病', weight: 3 },
  { id: 'heart_disease', label: '心臟病', weight: 3 },
  { id: 'diabetes', label: '糖尿病', weight: 2 },
  { id: 'obesity', label: '肥胖 (BMI ≥30)', weight: 2 },
  { id: 'immunocompromised', label: '免疫功能低下', weight: 3 },
  { id: 'pregnancy', label: '懷孕', weight: 2 },
  { id: 'smoking', label: '吸煙', weight: 2 },
  { id: 'kidney_disease', label: '腎臟疾病', weight: 2 },
  { id: 'liver_disease', label: '肝臟疾病', weight: 2 }
]

export default function CovidFluAssessmentForm({ user, onAssessmentComplete }) {
  const [assessmentType, setAssessmentType] = useState('covid')
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [selectedRiskFactors, setSelectedRiskFactors] = useState([])
  const [temperature, setTemperature] = useState('')
  const [symptomOnset, setSymptomOnset] = useState('')
  const [exposureHistory, setExposureHistory] = useState('')
  const [travelHistory, setTravelHistory] = useState('')
  const [contactHistory, setContactHistory] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSymptomChange = (symptomId, checked) => {
    if (checked) {
      setSelectedSymptoms([...selectedSymptoms, symptomId])
    } else {
      setSelectedSymptoms(selectedSymptoms.filter(id => id !== symptomId))
    }
  }

  const handleRiskFactorChange = (factorId, checked) => {
    if (checked) {
      setSelectedRiskFactors([...selectedRiskFactors, factorId])
    } else {
      setSelectedRiskFactors(selectedRiskFactors.filter(id => id !== factorId))
    }
  }

  const calculateRiskScore = () => {
    let score = 0
    
    // 症狀評分
    const symptoms = assessmentType === 'covid' ? covidSymptoms : fluSymptoms
    selectedSymptoms.forEach(symptomId => {
      const symptom = symptoms.find(s => s.id === symptomId)
      if (symptom) {
        switch (symptom.severity) {
          case 'high': score += 3; break
          case 'medium': score += 2; break
          case 'low': score += 1; break
        }
      }
    })

    // 風險因子評分
    selectedRiskFactors.forEach(factorId => {
      const factor = riskFactors.find(f => f.id === factorId)
      if (factor) {
        score += factor.weight
      }
    })

    // 體溫評分
    const temp = parseFloat(temperature)
    if (temp >= 39) score += 3
    else if (temp >= 38) score += 2
    else if (temp >= 37.5) score += 1

    // 接觸史評分
    if (exposureHistory === 'confirmed') score += 4
    else if (exposureHistory === 'suspected') score += 2
    else if (exposureHistory === 'community') score += 1

    return score
  }

  const getRiskLevel = (score) => {
    if (score >= 12) return { level: 'very_high', label: '極高風險', color: 'bg-red-600' }
    if (score >= 8) return { level: 'high', label: '高風險', color: 'bg-red-500' }
    if (score >= 5) return { level: 'medium', label: '中等風險', color: 'bg-yellow-500' }
    if (score >= 2) return { level: 'low', label: '低風險', color: 'bg-green-500' }
    return { level: 'very_low', label: '極低風險', color: 'bg-green-400' }
  }

  const getRecommendations = (riskLevel, score) => {
    const recommendations = {
      testing: [],
      isolation: [],
      monitoring: [],
      medical: [],
      prevention: []
    }

    switch (riskLevel.level) {
      case 'very_high':
        recommendations.testing.push('立即進行PCR檢測')
        recommendations.testing.push('考慮快速抗原檢測作為補充')
        recommendations.isolation.push('立即開始隔離，直到獲得陰性檢測結果')
        recommendations.isolation.push('隔離期間避免與他人接觸')
        recommendations.monitoring.push('密切監測症狀變化')
        recommendations.monitoring.push('每日測量體溫')
        recommendations.medical.push('立即聯繫醫療機構')
        recommendations.medical.push('如出現呼吸困難，立即就醫')
        break

      case 'high':
        recommendations.testing.push('建議在24小時內進行檢測')
        recommendations.testing.push('可考慮快速抗原檢測')
        recommendations.isolation.push('開始預防性隔離')
        recommendations.isolation.push('避免與高風險人群接觸')
        recommendations.monitoring.push('監測症狀發展')
        recommendations.monitoring.push('記錄體溫變化')
        recommendations.medical.push('聯繫醫療提供者諮詢')
        break

      case 'medium':
        recommendations.testing.push('考慮進行檢測')
        recommendations.isolation.push('減少外出和社交活動')
        recommendations.monitoring.push('觀察症狀變化')
        recommendations.prevention.push('佩戴口罩')
        recommendations.prevention.push('勤洗手')
        break

      case 'low':
      case 'very_low':
        recommendations.monitoring.push('繼續觀察症狀')
        recommendations.prevention.push('保持良好衛生習慣')
        recommendations.prevention.push('充足休息')
        recommendations.prevention.push('多喝水')
        break
    }

    return recommendations
  }

  const handleSubmitAssessment = async () => {
    setLoading(true)

    try {
      const riskScore = calculateRiskScore()
      const riskLevel = getRiskLevel(riskScore)
      const recommendations = getRecommendations(riskLevel, riskScore)

      const assessmentData = {
        assessmentType: assessmentType,
        symptoms: selectedSymptoms,
        riskFactors: selectedRiskFactors,
        temperature: parseFloat(temperature) || null,
        symptomOnset: symptomOnset,
        exposureHistory: exposureHistory,
        travelHistory: travelHistory,
        contactHistory: contactHistory,
        additionalNotes: additionalNotes,
        riskScore: riskScore,
        riskLevel: riskLevel.level,
        riskLevelLabel: riskLevel.label,
        recommendations: recommendations
      }

      // 提交評估結果到後端API
      const result = await apiService.submitCovidAssessment(assessmentData)
      console.log('COVID assessment submitted:', result)
      
      if (onAssessmentComplete) {
        onAssessmentComplete(result)
      }
    } catch (error) {
      console.error('Assessment error:', error)
      // 可以添加錯誤處理，比如顯示錯誤消息
    } finally {
      setLoading(false)
    }
  }

  const resetAssessment = () => {
    setSelectedSymptoms([])
    setSelectedRiskFactors([])
    setTemperature('')
    setSymptomOnset('')
    setExposureHistory('')
    setTravelHistory('')
    setContactHistory('')
    setAdditionalNotes('')
  }

  const currentSymptoms = assessmentType === 'covid' ? covidSymptoms : fluSymptoms

  return (
    <div className="space-y-6">
      {/* 評估類型選擇 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">選擇評估類型</CardTitle>
          <CardDescription>
            請根據您的症狀選擇相應的評估類型
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={assessmentType === 'covid' ? 'default' : 'outline'}
              onClick={() => setAssessmentType('covid')}
              className="h-20 flex flex-col gap-2"
            >
              <Shield className="h-6 w-6" />
              COVID-19 評估
            </Button>
            <Button
              variant={assessmentType === 'flu' ? 'default' : 'outline'}
              onClick={() => setAssessmentType('flu')}
              className="h-20 flex flex-col gap-2"
            >
              <Thermometer className="h-6 w-6" />
              流感評估
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 症狀檢查 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            症狀檢查
          </CardTitle>
          <CardDescription>
            請勾選您目前出現的症狀
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentSymptoms.map((symptom) => (
              <div key={symptom.id} className="flex items-center space-x-3">
                <Checkbox
                  id={symptom.id}
                  checked={selectedSymptoms.includes(symptom.id)}
                  onCheckedChange={(checked) => handleSymptomChange(symptom.id, checked)}
                />
                <Label htmlFor={symptom.id} className="flex items-center gap-2">
                  {symptom.label}
                  <Badge variant={symptom.severity === 'high' ? 'destructive' : symptom.severity === 'medium' ? 'default' : 'secondary'} className="text-xs">
                    {symptom.severity === 'high' ? '高' : symptom.severity === 'medium' ? '中' : '低'}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 風險因子 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            風險因子評估
          </CardTitle>
          <CardDescription>
            請勾選適用於您的風險因子
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskFactors.map((factor) => (
              <div key={factor.id} className="flex items-center space-x-3">
                <Checkbox
                  id={factor.id}
                  checked={selectedRiskFactors.includes(factor.id)}
                  onCheckedChange={(checked) => handleRiskFactorChange(factor.id, checked)}
                />
                <Label htmlFor={factor.id} className="flex items-center gap-2">
                  {factor.label}
                  <Badge variant="outline" className="text-xs">
                    權重: {factor.weight}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 詳細信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            詳細信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">當前體溫 (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="例如: 37.5"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="onset">症狀開始時間</Label>
              <Select value={symptomOnset} onValueChange={setSymptomOnset}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇時間" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">今天</SelectItem>
                  <SelectItem value="yesterday">昨天</SelectItem>
                  <SelectItem value="2-3_days">2-3天前</SelectItem>
                  <SelectItem value="4-7_days">4-7天前</SelectItem>
                  <SelectItem value="1-2_weeks">1-2週前</SelectItem>
                  <SelectItem value="more_than_2_weeks">超過2週</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exposure">接觸史</Label>
            <Select value={exposureHistory} onValueChange={setExposureHistory}>
              <SelectTrigger>
                <SelectValue placeholder="選擇接觸情況" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">無已知接觸</SelectItem>
                <SelectItem value="suspected">疑似接觸</SelectItem>
                <SelectItem value="confirmed">確診接觸</SelectItem>
                <SelectItem value="community">社區傳播風險</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="travel">旅行史</Label>
            <Textarea
              id="travel"
              placeholder="請描述最近14天的旅行經歷..."
              value={travelHistory}
              onChange={(e) => setTravelHistory(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">密切接觸史</Label>
            <Textarea
              id="contact"
              placeholder="請描述與他人的密切接觸情況..."
              value={contactHistory}
              onChange={(e) => setContactHistory(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">其他備註</Label>
            <Textarea
              id="notes"
              placeholder="其他相關信息..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 提交按鈕 */}
      <div className="flex gap-4">
        <Button 
          onClick={handleSubmitAssessment} 
          disabled={loading || selectedSymptoms.length === 0}
          className="flex-1"
        >
          {loading ? '評估中...' : '開始評估'}
        </Button>
        <Button variant="outline" onClick={resetAssessment}>
          重置
        </Button>
      </div>

      {selectedSymptoms.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            請至少選擇一個症狀才能進行評估。
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 