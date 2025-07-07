import { useState, useEffect } from 'react'
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
import i18n from '../../utils/i18n.js'

// 综合症状清单（COVID-19和流感）
const allSymptoms = [
  { id: 'fever', severity: 'high' },
  { id: 'cough', severity: 'high' },
  { id: 'shortness_breath', severity: 'high' },
  { id: 'loss_taste_smell', severity: 'high' },
  { id: 'body_aches', severity: 'high' },
  { id: 'fatigue', severity: 'medium' },
  { id: 'headache', severity: 'medium' },
  { id: 'sore_throat', severity: 'medium' },
  { id: 'runny_nose', severity: 'medium' },
  { id: 'chills', severity: 'medium' },
  { id: 'nausea', severity: 'low' },
  { id: 'diarrhea', severity: 'low' }
]

// 風險因子
const riskFactors = [
  { id: 'age_65_plus', weight: 3 },
  { id: 'chronic_lung', weight: 3 },
  { id: 'heart_disease', weight: 3 },
  { id: 'diabetes', weight: 2 },
  { id: 'obesity', weight: 2 },
  { id: 'immunocompromised', weight: 3 },
  { id: 'pregnancy', weight: 2 },
  { id: 'smoking', weight: 2 },
  { id: 'kidney_disease', weight: 2 },
  { id: 'liver_disease', weight: 2 }
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
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())
  
  // 图片上传相关状态
  const [selectedImages, setSelectedImages] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    
    return () => {
      i18n.removeListener(handleLanguageChange)
    }
  }, [])

  const t = (key, params = {}) => {
    language; // 确保组件依赖于language状态
    return i18n.t(key, params)
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
    const temp = temperature ? Number(temperature) : 0
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
    if (score >= 12) return { level: 'very_high', color: 'bg-red-600' }
    if (score >= 8) return { level: 'high', color: 'bg-red-500' }
    if (score >= 5) return { level: 'medium', color: 'bg-yellow-500' }
    if (score >= 2) return { level: 'low', color: 'bg-green-500' }
    return { level: 'very_low', color: 'bg-green-400' }
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
        recommendations.testing.push({
          key: 'immediate_pcr',
          category: 'testing',
          priority: 'high',
          type: 'action'
        })
        recommendations.testing.push({
          key: 'rapid_antigen_supplement',
          category: 'testing',
          priority: 'medium',
          type: 'action'
        })
        recommendations.isolation.push({
          key: 'immediate_until_negative',
          category: 'isolation',
          priority: 'high',
          type: 'action'
        })
        recommendations.isolation.push({
          key: 'avoid_contact',
          category: 'isolation',
          priority: 'high',
          type: 'action'
        })
        recommendations.monitoring.push({
          key: 'close_symptom_monitoring',
          category: 'monitoring',
          priority: 'high',
          type: 'action'
        })
        recommendations.monitoring.push({
          key: 'daily_temperature',
          category: 'monitoring',
          priority: 'high',
          type: 'action'
        })
        recommendations.medical.push({
          key: 'immediate_contact',
          category: 'medical',
          priority: 'high',
          type: 'action'
        })
        recommendations.medical.push({
          key: 'breathing_difficulty_emergency',
          category: 'medical',
          priority: 'critical',
          type: 'warning'
        })
        break

      case 'high':
        recommendations.testing.push({
          key: 'within_24_hours',
          category: 'testing',
          priority: 'high',
          type: 'action'
        })
        recommendations.testing.push({
          key: 'rapid_antigen_initial',
          category: 'testing',
          priority: 'medium',
          type: 'action'
        })
        recommendations.isolation.push({
          key: 'until_test_negative',
          category: 'isolation',
          priority: 'high',
          type: 'action'
        })
        recommendations.isolation.push({
          key: 'separate_household',
          category: 'isolation',
          priority: 'medium',
          type: 'action'
        })
        recommendations.monitoring.push({
          key: 'symptom_monitoring',
          category: 'monitoring',
          priority: 'high',
          type: 'action'
        })
        recommendations.monitoring.push({
          key: 'temperature_twice_daily',
          category: 'monitoring',
          priority: 'medium',
          type: 'action'
        })
        recommendations.medical.push({
          key: 'contact_provider',
          category: 'medical',
          priority: 'medium',
          type: 'action'
        })
        recommendations.medical.push({
          key: 'symptom_worsening_alert',
          category: 'medical',
          priority: 'medium',
          type: 'warning'
        })
        break

      case 'medium':
        recommendations.testing.push({
          key: 'within_48_hours',
          category: 'testing',
          priority: 'medium',
          type: 'action'
        })
        recommendations.testing.push({
          key: 'home_test_option',
          category: 'testing',
          priority: 'low',
          type: 'action'
        })
        recommendations.isolation.push({
          key: 'precautionary_isolation',
          category: 'isolation',
          priority: 'medium',
          type: 'action'
        })
        recommendations.monitoring.push({
          key: 'daily_symptom_check',
          category: 'monitoring',
          priority: 'medium',
          type: 'action'
        })
        recommendations.monitoring.push({
          key: 'temperature_daily',
          category: 'monitoring',
          priority: 'low',
          type: 'action'
        })
        recommendations.medical.push({
          key: 'consult_if_worsening',
          category: 'medical',
          priority: 'low',
          type: 'action'
        })
        recommendations.prevention.push({
          key: 'wear_mask',
          category: 'prevention',
          priority: 'medium',
          type: 'action'
        })
        break

      case 'low':
        recommendations.testing.push({
          key: 'consider_testing',
          category: 'testing',
          priority: 'low',
          type: 'action'
        })
        recommendations.monitoring.push({
          key: 'symptom_awareness',
          category: 'monitoring',
          priority: 'low',
          type: 'action'
        })
        recommendations.prevention.push({
          key: 'frequent_handwashing',
          category: 'prevention',
          priority: 'medium',
          type: 'action'
        })
        recommendations.prevention.push({
          key: 'good_hygiene',
          category: 'prevention',
          priority: 'medium',
          type: 'action'
        })
        break

      case 'very_low':
        recommendations.prevention.push({
          key: 'maintain_hygiene',
          category: 'prevention',
          priority: 'low',
          type: 'action'
        })
        recommendations.prevention.push({
          key: 'stay_informed',
          category: 'prevention',
          priority: 'low',
          type: 'action'
        })
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
        if (temperature) formDataToSubmit.append('temperature', Number(temperature).toString())
        formDataToSubmit.append('symptomOnset', symptomOnset)
        formDataToSubmit.append('exposureHistory', exposureHistory)
        formDataToSubmit.append('travelHistory', travelHistory)
        formDataToSubmit.append('contactHistory', contactHistory)
        formDataToSubmit.append('additionalNotes', additionalNotes)
        formDataToSubmit.append('riskScore', riskScore.toString())
        formDataToSubmit.append('riskLevel', riskLevel.level)
        formDataToSubmit.append('riskLevelLabel', riskLevel.level)
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
          temperature: temperature ? Number(temperature) : null,
          symptomOnset: symptomOnset,
          exposureHistory: exposureHistory,
          travelHistory: travelHistory,
          contactHistory: contactHistory,
          additionalNotes: additionalNotes,
          riskScore: riskScore,
          riskLevel: riskLevel.level,
          riskLevelLabel: riskLevel.level,
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
                    {t('covid_assessment_form.symptom_check')}
                  </h3>
                  <p className="text-gray-600/80 text-sm">
                    {t('covid_assessment_form.symptom_check_desc')}
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
                      {t(`covid_assessment_form.symptoms.${symptom.id}`)}
                      <Badge variant={symptom.severity === 'high' ? 'destructive' : symptom.severity === 'medium' ? 'default' : 'secondary'} className="text-xs">
                        {t(`covid_assessment_form.severity.${symptom.severity}`)}
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
                    {t('covid_assessment_form.risk_factor_assessment')}
                  </h3>
                  <p className="text-gray-600/80 text-sm">
                    {t('covid_assessment_form.risk_factor_assessment_desc')}
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
                      {t(`covid_assessment_form.risk_factors.${factor.id}`)}
                      <Badge variant="outline" className="text-xs">
                        {t('covid_assessment_form.weight')}: {factor.weight}
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
                    {t('covid_assessment_form.detailed_info')}
                  </h3>
                  <p className="text-gray-600/80 text-sm">
                    {t('covid_assessment_form.detailed_info_desc')}
                  </p>
                </div>
              </div>
              
              <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-2xl shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="temperature" className="text-sm font-medium text-gray-700">{t('covid_assessment_form.current_temperature')}</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder={t('covid_assessment_form.temperature_placeholder')}
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      disabled={loading || isUploading}
                      className="h-11 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="onset" className="text-sm font-medium text-gray-700">{t('covid_assessment_form.symptom_onset')}</Label>
                    <Select value={symptomOnset} onValueChange={setSymptomOnset}>
                      <SelectTrigger className="h-11 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300">
                        <SelectValue placeholder={t('covid_assessment_form.select_time')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-lg">
                        <SelectItem value="today">{t('covid_assessment_form.onset_time.today')}</SelectItem>
                        <SelectItem value="yesterday">{t('covid_assessment_form.onset_time.yesterday')}</SelectItem>
                        <SelectItem value="2-3_days">{t('covid_assessment_form.onset_time.2-3_days')}</SelectItem>
                        <SelectItem value="4-7_days">{t('covid_assessment_form.onset_time.4-7_days')}</SelectItem>
                        <SelectItem value="1-2_weeks">{t('covid_assessment_form.onset_time.1-2_weeks')}</SelectItem>
                        <SelectItem value="more_than_2_weeks">{t('covid_assessment_form.onset_time.more_than_2_weeks')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exposure" className="text-sm font-medium text-gray-700">{t('covid_assessment_form.exposure_history')}</Label>
                  <Select value={exposureHistory} onValueChange={setExposureHistory}>
                    <SelectTrigger className="h-11 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300">
                      <SelectValue placeholder={t('covid_assessment_form.select_exposure')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-lg">
                      <SelectItem value="none">{t('covid_assessment_form.exposure.none')}</SelectItem>
                      <SelectItem value="suspected">{t('covid_assessment_form.exposure.suspected')}</SelectItem>
                      <SelectItem value="confirmed">{t('covid_assessment_form.exposure.confirmed')}</SelectItem>
                      <SelectItem value="community">{t('covid_assessment_form.exposure.community')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travel" className="text-sm font-medium text-gray-700">{t('covid_assessment_form.travel_history')}</Label>
                  <Textarea
                    id="travel"
                    placeholder={t('covid_assessment_form.travel_placeholder')}
                    value={travelHistory}
                    onChange={(e) => setTravelHistory(e.target.value)}
                    disabled={loading || isUploading}
                    rows={3}
                    className="bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-sm font-medium text-gray-700">{t('covid_assessment_form.contact_history')}</Label>
                  <Textarea
                    id="contact"
                    placeholder={t('covid_assessment_form.contact_placeholder')}
                    value={contactHistory}
                    onChange={(e) => setContactHistory(e.target.value)}
                    disabled={loading || isUploading}
                    rows={3}
                    className="bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">{t('covid_assessment_form.additional_notes')}</Label>
                  <Textarea
                    id="notes"
                    placeholder={t('covid_assessment_form.notes_placeholder')}
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
                  label={t('covid_assessment_form.symptom_images')}
                  description={t('covid_assessment_form.image_description')}
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
                  {t('covid_assessment_form.assessment_success')}
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
                      {isUploading ? t('covid_assessment_form.uploading') : t('covid_assessment_form.assessing')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {t('covid_assessment_form.start_assessment')}
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
                {t('covid_assessment_form.reset')}
              </Button>
            </div>

            {selectedSymptoms.length === 0 && (
              <Alert className="border-0 bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-2xl shadow-lg">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  {t('covid_assessment_form.select_at_least_one')}
                </AlertDescription>
              </Alert>
            )}

          </form>
        </CardContent>
      </Card>
    </div>
  )
} 