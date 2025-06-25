import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { 
  Thermometer, 
  AlertTriangle, 
  Shield, 
  Activity,
  Clock,
  Users,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'
import apiService from '../services/api.js'
import i18n from '../utils/i18n'

// COVID-19和流感症狀清單
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

export default function CovidFluAssessment({ user, onAssessmentComplete, onBack }) {
  const [activeTab, setActiveTab] = useState('assessment')
  const [assessmentType, setAssessmentType] = useState('covid')
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [selectedRiskFactors, setSelectedRiskFactors] = useState([])
  const [temperature, setTemperature] = useState('')
  const [symptomOnset, setSymptomOnset] = useState('')
  const [exposureHistory, setExposureHistory] = useState('')
  const [travelHistory, setTravelHistory] = useState('')
  const [contactHistory, setContactHistory] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())
  const [assessmentHistory, setAssessmentHistory] = useState([])

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    
    // 加載用戶的評估歷史記錄
    loadAssessmentHistory()
    
    return () => {
      i18n.removeListener(handleLanguageChange)
    }
  }, [user])

  // 加載評估歷史記錄
  const loadAssessmentHistory = async () => {
    try {
      const assessments = await apiService.getMyCovidAssessments()
      setAssessmentHistory(assessments)
      
      // 如果有評估記錄，設置最新的評估結果
      if (assessments.length > 0) {
        const latestAssessment = assessments[assessments.length - 1]
        setAssessmentResult(latestAssessment)
      }
    } catch (error) {
      console.error('Error loading assessment history:', error)
      setAssessmentHistory([])
    }
  }

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
        recommendations.testing.push('建議進行檢測')
        recommendations.isolation.push('考慮居家隔離')
        recommendations.isolation.push('減少外出和社交活動')
        recommendations.monitoring.push('自我監測症狀')
        recommendations.medical.push('如症狀惡化，聯繫醫療機構')
        break

      case 'low':
        recommendations.testing.push('可考慮進行檢測')
        recommendations.isolation.push('注意個人衛生')
        recommendations.monitoring.push('觀察症狀變化')
        recommendations.medical.push('如症狀持續或惡化，尋求醫療建議')
        break

      case 'very_low':
        recommendations.monitoring.push('繼續觀察')
        recommendations.prevention.push('保持良好的個人衛生習慣')
        break
    }

    // 通用預防建議
    recommendations.prevention.push('勤洗手或使用酒精消毒劑')
    recommendations.prevention.push('佩戴口罩')
    recommendations.prevention.push('保持社交距離')
    recommendations.prevention.push('避免觸摸面部')
    recommendations.prevention.push('保持室內通風')

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
      
      // 更新本地狀態
      setAssessmentResult(result)
      setAssessmentHistory([...assessmentHistory, result])
      setActiveTab('result')

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
    setAssessmentResult(null)
    setActiveTab('assessment')
  }

  const currentSymptoms = assessmentType === 'covid' ? covidSymptoms : fluSymptoms

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                COVID-19 和流感評估
              </CardTitle>
              <CardDescription>
                專業的症狀評估和風險分析，提供個人化的健康建議
              </CardDescription>
            </div>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                返回
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessment">症狀評估</TabsTrigger>
          <TabsTrigger value="result" disabled={!assessmentResult && assessmentHistory.length === 0}>評估結果</TabsTrigger>
          <TabsTrigger value="history">歷史記錄</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6">
          {/* 評估類型選擇 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">選擇評估類型</CardTitle>
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
                請選擇您目前出現的症狀
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentSymptoms.map((symptom) => (
                  <div key={symptom.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={symptom.id}
                      checked={selectedSymptoms.includes(symptom.id)}
                      onCheckedChange={(checked) => handleSymptomChange(symptom.id, checked)}
                    />
                    <Label htmlFor={symptom.id} className="flex-1">
                      {symptom.label}
                      <Badge 
                        variant="outline" 
                        className={`ml-2 ${
                          symptom.severity === 'high' ? 'border-red-500 text-red-600' :
                          symptom.severity === 'medium' ? 'border-yellow-500 text-yellow-600' :
                          'border-green-500 text-green-600'
                        }`}
                      >
                        {symptom.severity === 'high' ? '高' : 
                         symptom.severity === 'medium' ? '中' : '低'}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 體溫測量 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                體溫測量
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                請選擇適用於您的風險因子
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {riskFactors.map((factor) => (
                  <div key={factor.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={factor.id}
                      checked={selectedRiskFactors.includes(factor.id)}
                      onCheckedChange={(checked) => handleRiskFactorChange(factor.id, checked)}
                    />
                    <Label htmlFor={factor.id} className="flex-1">
                      {factor.label}
                      <Badge variant="outline" className="ml-2">
                        權重: {factor.weight}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 接觸史和旅行史 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                接觸史和旅行史
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptom-onset">症狀開始時間</Label>
                <Input
                  id="symptom-onset"
                  type="date"
                  value={symptomOnset}
                  onChange={(e) => setSymptomOnset(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exposure">接觸史</Label>
                <Select value={exposureHistory} onValueChange={setExposureHistory}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇接觸史類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">無已知接觸</SelectItem>
                    <SelectItem value="community">社區接觸</SelectItem>
                    <SelectItem value="suspected">疑似病例接觸</SelectItem>
                    <SelectItem value="confirmed">確診病例接觸</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="travel">近期旅行史</Label>
                <Textarea
                  id="travel"
                  placeholder="請描述過去14天的旅行史..."
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
        </TabsContent>

        <TabsContent value="result" className="space-y-6">
          {assessmentResult && (
            <>
              {/* 風險等級 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6" />
                    評估結果
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className={`inline-flex items-center px-6 py-3 rounded-full text-white font-semibold ${assessmentResult.risk_level.color}`}>
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      {assessmentResult.risk_level.label}
                    </div>
                    <p className="text-gray-600">
                      風險評分: {assessmentResult.risk_score} 分
                    </p>
                    <p className="text-sm text-gray-500">
                      評估時間: {new Date(assessmentResult.assessed_at).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 建議措施 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 檢測建議 */}
                {assessmentResult.recommendations.testing.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-600">
                        <Activity className="h-5 w-5" />
                        檢測建議
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {assessmentResult.recommendations.testing.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* 隔離建議 */}
                {assessmentResult.recommendations.isolation.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-600">
                        <Shield className="h-5 w-5" />
                        隔離建議
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {assessmentResult.recommendations.isolation.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* 監測建議 */}
                {assessmentResult.recommendations.monitoring.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <Clock className="h-5 w-5" />
                        監測建議
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {assessmentResult.recommendations.monitoring.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* 醫療建議 */}
                {assessmentResult.recommendations.medical.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <Phone className="h-5 w-5" />
                        醫療建議
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {assessmentResult.recommendations.medical.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* 預防措施 */}
              {assessmentResult.recommendations.prevention.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-600">
                      <Shield className="h-5 w-5" />
                      預防措施
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {assessmentResult.recommendations.prevention.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  此評估結果僅供參考，不能替代專業醫療診斷。如有疑慮，請諮詢醫療專業人員。
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button onClick={resetAssessment} className="flex-1">
                  進行新評估
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('history')}>
                  查看歷史記錄
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>評估歷史記錄</CardTitle>
              <CardDescription>
                您的COVID-19和流感評估歷史
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assessmentHistory.length > 0 ? (
                <div className="space-y-4">
                  {assessmentHistory.map((assessment, index) => (
                    <Card key={assessment.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => {
                            setAssessmentResult(assessment)
                            setActiveTab('result')
                          }}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">
                                {assessment.assessment_type === 'covid' ? 'COVID-19' : '流感'}
                              </Badge>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs text-white ${assessment.risk_level.color}`}>
                                {assessment.risk_level.label}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              風險評分: {assessment.risk_score} 分
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(assessment.assessed_at).toLocaleString()}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            查看詳情
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>暫無歷史記錄</p>
                  <p className="text-sm">完成評估後，記錄將顯示在這裡</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

