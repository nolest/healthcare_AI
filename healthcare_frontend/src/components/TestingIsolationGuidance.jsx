import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  TestTube, 
  Home, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Heart,
  Info,
  Stethoscope,
  Activity
} from 'lucide-react'
import i18n from '../utils/i18n.js'

export default function TestingIsolationGuidance({ riskLevel = 'medium', assessmentResult, user }) {
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    i18n.addListener(handleLanguageChange)
    return () => i18n.removeListener(handleLanguageChange)
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 页面标题 - 参考医疗人员页面样式 */}
      <div className="mb-8 text-left">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
          {i18n.t('pages.testing_isolation.title')}
        </h2>
        <p className="text-gray-700/80 text-lg">
          {i18n.t('pages.testing_isolation.subtitle')}
        </p>
      </div>

      {/* 1. 检测建议 */}
      <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/60 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-blue-500/15 relative overflow-hidden">
        {/* 装饰性背景效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/15 to-transparent rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl shadow-blue-500/30">
              <TestTube className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
                {i18n.t('pages.testing_isolation.testing_title')}
              </h3>
              <p className="text-blue-700/70 mt-1">
                {i18n.t('pages.testing_isolation.testing_subtitle')}
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50/50 backdrop-blur-sm">
              <Clock className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-800 font-medium">
                {i18n.t('pages.testing_isolation.testing_alert')}
              </AlertDescription>
            </Alert>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h4 className="font-bold text-blue-800 mb-4 text-lg">{i18n.t('pages.testing_isolation.recommended_tests')}</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-blue-800">{i18n.t('pages.testing_isolation.pcr_test')}</span>
                    <p className="text-sm text-blue-700/70 mt-1">{i18n.t('pages.testing_isolation.pcr_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-blue-800">{i18n.t('pages.testing_isolation.antigen_test')}</span>
                    <p className="text-sm text-blue-700/70 mt-1">{i18n.t('pages.testing_isolation.antigen_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-blue-800">{i18n.t('pages.testing_isolation.continuous_testing')}</span>
                    <p className="text-sm text-blue-700/70 mt-1">{i18n.t('pages.testing_isolation.continuous_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 隔离指导 */}
      <div className="bg-gradient-to-br from-green-50/80 to-green-100/60 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-green-500/15 relative overflow-hidden">
        {/* 装饰性背景效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-200/15 to-transparent rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl shadow-green-500/30">
              <Home className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                {i18n.t('pages.testing_isolation.isolation_title')}
              </h3>
              <p className="text-green-700/70 mt-1">
                {i18n.t('pages.testing_isolation.isolation_subtitle')}
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h4 className="font-bold text-green-800 mb-4 text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {i18n.t('pages.testing_isolation.isolation_period')}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">{i18n.t('pages.testing_isolation.standard_label')}</Badge>
                  <span className="text-green-800">{i18n.t('pages.testing_isolation.standard_isolation')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">{i18n.t('pages.testing_isolation.high_risk_label')}</Badge>
                  <span className="text-green-800">{i18n.t('pages.testing_isolation.high_risk_isolation')}</span>
                </div>
                <p className="text-sm text-green-700/70 mt-2">
                  {i18n.t('pages.testing_isolation.isolation_note')}
                </p>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h4 className="font-bold text-green-800 mb-4 text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {i18n.t('pages.testing_isolation.prevention_measures')}
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-800">{i18n.t('pages.testing_isolation.reduce_activities')}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-800">{i18n.t('pages.testing_isolation.wear_mask')}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-800">{i18n.t('pages.testing_isolation.ventilation')}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-800">{i18n.t('pages.testing_isolation.keep_distance')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 症状监测 */}
      <div className="bg-gradient-to-br from-purple-50/80 to-purple-100/60 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-purple-500/15 relative overflow-hidden">
        {/* 装饰性背景效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/15 to-transparent rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl shadow-purple-500/30">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
                {i18n.t('pages.testing_isolation.monitoring_title')}
              </h3>
              <p className="text-purple-700/70 mt-1">
                {i18n.t('pages.testing_isolation.monitoring_subtitle')}
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <Alert className="border-red-200 bg-red-50/50 backdrop-blur-sm">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800 font-medium">
                {i18n.t('pages.testing_isolation.emergency_alert')}
              </AlertDescription>
            </Alert>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h4 className="font-bold text-purple-800 mb-4 text-lg">{i18n.t('pages.testing_isolation.daily_monitoring')}</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-purple-800">{i18n.t('pages.testing_isolation.temperature_check')}</span>
                      <p className="text-xs text-purple-700/70">{i18n.t('pages.testing_isolation.temperature_freq')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-purple-800">{i18n.t('pages.testing_isolation.symptom_record')}</span>
                      <p className="text-xs text-purple-700/70">{i18n.t('pages.testing_isolation.symptom_desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-purple-800">{i18n.t('pages.testing_isolation.oxygen_monitoring')}</span>
                      <p className="text-xs text-purple-700/70">{i18n.t('pages.testing_isolation.oxygen_desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h4 className="font-bold text-red-800 mb-4 text-lg">{i18n.t('pages.testing_isolation.emergency_indicators')}</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-800">{i18n.t('pages.testing_isolation.breathing_difficulty')}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-800">{i18n.t('pages.testing_isolation.high_fever')}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-800">{i18n.t('pages.testing_isolation.low_oxygen')}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-800">{i18n.t('pages.testing_isolation.confusion')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 康复指导 */}
      <div className="bg-gradient-to-br from-teal-50/80 to-teal-100/60 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-teal-500/15 relative overflow-hidden">
        {/* 装饰性背景效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-200/15 to-transparent rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-xl shadow-teal-500/30">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-600 bg-clip-text text-transparent">
                {i18n.t('pages.testing_isolation.recovery_title')}
              </h3>
              <p className="text-teal-700/70 mt-1">
                {i18n.t('pages.testing_isolation.recovery_subtitle')}
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h4 className="font-bold text-teal-800 mb-4 text-lg">{i18n.t('pages.testing_isolation.recovery_criteria')}</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-teal-800">{i18n.t('pages.testing_isolation.no_fever')}</span>
                    <p className="text-xs text-teal-700/70">{i18n.t('pages.testing_isolation.fever_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-teal-800">{i18n.t('pages.testing_isolation.symptoms_improved')}</span>
                    <p className="text-xs text-teal-700/70">{i18n.t('pages.testing_isolation.symptoms_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-teal-800">{i18n.t('pages.testing_isolation.negative_tests')}</span>
                    <p className="text-xs text-teal-700/70">{i18n.t('pages.testing_isolation.tests_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h4 className="font-bold text-teal-800 mb-4 text-lg">{i18n.t('pages.testing_isolation.recovery_advice')}</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Activity className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-teal-800">{i18n.t('pages.testing_isolation.gradual_activity')}</span>
                    <p className="text-xs text-teal-700/70">{i18n.t('pages.testing_isolation.avoid_exercise')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-teal-800">{i18n.t('pages.testing_isolation.adequate_rest')}</span>
                    <p className="text-xs text-teal-700/70">{i18n.t('pages.testing_isolation.sleep_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-teal-800">{i18n.t('pages.testing_isolation.continue_mask')}</span>
                    <p className="text-xs text-teal-700/70">{i18n.t('pages.testing_isolation.mask_duration')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Stethoscope className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-teal-800">{i18n.t('pages.testing_isolation.regular_checkup')}</span>
                    <p className="text-xs text-teal-700/70">{i18n.t('pages.testing_isolation.checkup_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 专业提醒 */}
      <div className="mt-12">
        <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-emerald-500/15 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-200/20 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-start">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20 mr-6 mt-1 flex-shrink-0">
                <Info className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent mb-4">
                  {i18n.t('pages.testing_isolation.professional_reminder')}
                </h3>
                <ul className="text-emerald-800/90 space-y-3">
                  <li className="flex items-center group">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover:text-emerald-700 transition-colors duration-200">
                      {i18n.t('pages.testing_isolation.guidance_reference')}
                    </span>
                  </li>
                  <li className="flex items-center group">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover:text-emerald-700 transition-colors duration-200">
                      {i18n.t('pages.testing_isolation.emergency_contact')}
                    </span>
                  </li>
                  <li className="flex items-center group">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover:text-emerald-700 transition-colors duration-200">
                      {i18n.t('pages.testing_isolation.follow_guidelines')}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

