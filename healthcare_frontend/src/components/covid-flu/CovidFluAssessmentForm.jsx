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
  AlertTriangle, 
  Activity,
  Info,
  Loader2,
  CheckCircle
} from 'lucide-react'
import ImageUpload from '../ui/ImageUpload.jsx'
import apiService from '../../services/api.js'

// 综合症状清单（COVID-19和流感）
const allSymptoms = [
  { id: 'fever', label: '發燒', severity: 'high' },
  { id: 'cough', label: '咳嗽', severity: 'high' },
  { id: 'shortness_breath', label: '呼吸困難或氣促', severity: 'high' },
  { id: 'loss_taste_smell', label: '味覺或嗅覺喪失', severity: 'high' },
  { id: 'body_aches', label: '肌肉或身體疼痛', severity: 'high' },
  { id: 'fatigue', label: '疲勞', severity: 'medium' },
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
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [selectedRiskFactors, setSelectedRiskFactors] = useState([])
  const [temperature, setTemperature] = useState('')
  const [symptomOnset, setSymptomOnset] = useState('')
  const [exposureHistory, setExposureHistory] = useState('')
  const [travelHistory, setTravelHistory] = useState('')
  const [contactHistory, setContactHistory] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [loading, setLoading] = useState(false)
  
  // 图片上传相关状态
  const [selectedImages, setSelectedImages] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

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

  // 处理图片变更
  const handleImagesChange = (images, previewUrls) => {
    setSelectedImages(images)
  }

  const calculateRiskScore = () => {
    let score = 0
    
    // 症狀評分
    selectedSymptoms.forEach(symptomId => {
      const symptom = allSymptoms.find(s => s.id === symptomId)
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
    setError(null)
    setSuccess(false)

    try {
      const riskScore = calculateRiskScore()
      const riskLevel = getRiskLevel(riskScore)
      const recommendations = getRecommendations(riskLevel, riskScore)

      console.log('📊 开始提交COVID评估数据:', {
        selectedSymptoms,
        selectedRiskFactors,
        temperature,
        riskScore,
        riskLevel,
        hasImages: selectedImages.length > 0
      })

      // 根据是否有图片选择不同的提交方式
      if (selectedImages.length > 0) {
        // 有图片时使用FormData
        setIsUploading(true)
        setUploadProgress(0)

        const formDataToSubmit = new FormData()
        
        // 添加评估数据
        formDataToSubmit.append('symptoms', JSON.stringify(selectedSymptoms))
        formDataToSubmit.append('riskFactors', JSON.stringify(selectedRiskFactors))
        if (temperature) formDataToSubmit.append('temperature', temperature)
        formDataToSubmit.append('symptomOnset', symptomOnset)
        formDataToSubmit.append('exposureHistory', exposureHistory)
        formDataToSubmit.append('travelHistory', travelHistory)
        formDataToSubmit.append('contactHistory', contactHistory)
        formDataToSubmit.append('additionalNotes', additionalNotes)
        formDataToSubmit.append('riskScore', riskScore.toString())
        formDataToSubmit.append('riskLevel', riskLevel.level)
        formDataToSubmit.append('riskLevelLabel', riskLevel.label)
        formDataToSubmit.append('recommendations', JSON.stringify(recommendations))

        // 添加图片文件
        selectedImages.forEach((image, index) => {
          formDataToSubmit.append('images', image)
        })

        console.log('📤 提交带图片的评估数据...')
        // 提交評估結果到後端API（带图片）
        const result = await apiService.submitCovidAssessmentWithImages(
          formDataToSubmit,
          (progress) => {
            setUploadProgress(progress)
          }
        )
        console.log('✅ COVID assessment with images submitted:', result)
        
        setSuccess(true)
        if (onAssessmentComplete) {
          onAssessmentComplete(result)
        }
      } else {
        // 无图片时使用普通JSON
        const assessmentData = {
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

        console.log('📤 提交不带图片的评估数据...')
        // 提交評估結果到後端API
        const result = await apiService.submitCovidAssessment(assessmentData)
        console.log('✅ COVID assessment submitted:', result)
        
        setSuccess(true)
        if (onAssessmentComplete) {
          onAssessmentComplete(result)
        }
      }
    } catch (error) {
      console.error('❌ Assessment error:', error)
      setError(error.message || '提交評估時發生錯誤，請稍後再試')
    } finally {
      setLoading(false)
      setIsUploading(false)
      setUploadProgress(0)
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
    setSelectedImages([])
    setUploadProgress(0)
    setIsUploading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg border-0 shadow-2xl">
        <CardContent className="p-8">
          <form className="space-y-8">
            
            {/* 症狀檢查 */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl shadow-sm">
                  <Activity className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
                    症狀檢查
                  </h3>
                  <p className="text-gray-600/80 text-sm">
                    請勾選您目前出現的症狀
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 rounded-2xl shadow-inner">
                {allSymptoms.map((symptom) => (
                  <div key={symptom.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-colors duration-200">
                    <Checkbox
                      id={symptom.id}
                      checked={selectedSymptoms.includes(symptom.id)}
                      onCheckedChange={(checked) => handleSymptomChange(symptom.id, checked)}
                      className="focus:ring-purple-500"
                    />
                    <Label htmlFor={symptom.id} className="flex items-center gap-2 cursor-pointer">
                      {symptom.label}
                      <Badge variant={symptom.severity === 'high' ? 'destructive' : symptom.severity === 'medium' ? 'default' : 'secondary'} className="text-xs">
                        {symptom.severity === 'high' ? '高' : symptom.severity === 'medium' ? '中' : '低'}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* 風險因子 */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl shadow-sm">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                    風險因子評估
                  </h3>
                  <p className="text-gray-600/80 text-sm">
                    請勾選適用於您的風險因子
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-2xl shadow-inner">
                {riskFactors.map((factor) => (
                  <div key={factor.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-colors duration-200">
                    <Checkbox
                      id={factor.id}
                      checked={selectedRiskFactors.includes(factor.id)}
                      onCheckedChange={(checked) => handleRiskFactorChange(factor.id, checked)}
                      className="focus:ring-amber-500"
                    />
                    <Label htmlFor={factor.id} className="flex items-center gap-2 cursor-pointer">
                      {factor.label}
                      <Badge variant="outline" className="text-xs">
                        權重: {factor.weight}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* 詳細信息 */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl shadow-sm">
                  <Info className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent">
                    詳細信息
                  </h3>
                  <p className="text-gray-600/80 text-sm">
                    提供更多詳細信息以便更準確的評估
                  </p>
                </div>
              </div>
              
              <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-2xl shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="temperature" className="text-sm font-medium text-gray-700">當前體溫 (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder="例如: 37.5"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      disabled={loading || isUploading}
                      className="h-11 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="onset" className="text-sm font-medium text-gray-700">症狀開始時間</Label>
                    <Select value={symptomOnset} onValueChange={setSymptomOnset}>
                      <SelectTrigger className="h-11 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300">
                        <SelectValue placeholder="選擇時間" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-lg">
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
                  <Label htmlFor="exposure" className="text-sm font-medium text-gray-700">接觸史</Label>
                  <Select value={exposureHistory} onValueChange={setExposureHistory}>
                    <SelectTrigger className="h-11 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300">
                      <SelectValue placeholder="選擇接觸情況" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-lg">
                      <SelectItem value="none">無已知接觸</SelectItem>
                      <SelectItem value="suspected">疑似接觸</SelectItem>
                      <SelectItem value="confirmed">確診接觸</SelectItem>
                      <SelectItem value="community">社區傳播風險</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travel" className="text-sm font-medium text-gray-700">旅行史</Label>
                  <Textarea
                    id="travel"
                    placeholder="請描述最近14天的旅行經歷..."
                    value={travelHistory}
                    onChange={(e) => setTravelHistory(e.target.value)}
                    disabled={loading || isUploading}
                    rows={3}
                    className="bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-sm font-medium text-gray-700">密切接觸史</Label>
                  <Textarea
                    id="contact"
                    placeholder="請描述與他人的密切接觸情況..."
                    value={contactHistory}
                    onChange={(e) => setContactHistory(e.target.value)}
                    disabled={loading || isUploading}
                    rows={3}
                    className="bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">其他備註</Label>
                  <Textarea
                    id="notes"
                    placeholder="其他相關信息..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    disabled={loading || isUploading}
                    rows={3}
                    className="bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 resize-none"
                  />
                </div>

                {/* 图片上传区域 */}
                <ImageUpload
                  selectedImages={selectedImages}
                  onImagesChange={handleImagesChange}
                  disabled={loading}
                  uploading={isUploading}
                  uploadProgress={uploadProgress}
                  accentColor="purple"
                  label="症狀相關圖片"
                  description="支持 JPG、PNG、GIF、WebP 格式"
                />
              </div>
            </div>

            {/* 状态消息 */}
            {error && (
              <Alert className="border-0 bg-gradient-to-br from-red-50/80 to-pink-50/80 rounded-2xl shadow-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-0 bg-gradient-to-br from-green-50/80 to-emerald-50/80 rounded-2xl shadow-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  評估提交成功！正在為您跳轉到結果頁面...
                </AlertDescription>
              </Alert>
            )}

            {/* 提交按鈕 */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="button"
                onClick={handleSubmitAssessment} 
                disabled={loading || isUploading || selectedSymptoms.length === 0}
                className="flex-1 h-12 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0"
              >
                <div className="flex items-center justify-center">
                  {loading || isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      {isUploading ? '上傳中...' : '評估中...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      開始評估
                    </>
                  )}
                </div>
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={resetAssessment}
                disabled={loading || isUploading}
                className="bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                重置
              </Button>
            </div>

            {selectedSymptoms.length === 0 && (
              <Alert className="border-0 bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-2xl shadow-lg">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  請至少選擇一個症狀才能進行評估。
                </AlertDescription>
              </Alert>
            )}

          </form>
        </CardContent>
      </Card>
    </div>
  )
} 