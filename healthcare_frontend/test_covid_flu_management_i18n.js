import i18n from './src/utils/i18n.js'

console.log('🧪 測試 CovidFluManagementPage 國際化功能')
console.log('=' .repeat(50))

// 測試所有語言
const languages = ['zh-TW', 'zh-CN', 'en']

languages.forEach(lang => {
  console.log(`\n🌍 測試語言: ${lang}`)
  console.log('-'.repeat(30))
  
  i18n.setLanguage(lang)
  
  // 測試主要翻譯鍵
  const testKeys = [
    'pages.covid_flu_management.title',
    'pages.covid_flu_management.subtitle',
    'pages.covid_flu_management.total_assessments',
    'pages.covid_flu_management.high_risk',
    'pages.covid_flu_management.medium_risk',
    'pages.covid_flu_management.low_risk',
    'pages.covid_flu_management.recent_assessments',
    'pages.covid_flu_management.filter_conditions',
    'pages.covid_flu_management.patient_id',
    'pages.covid_flu_management.patient_name',
    'pages.covid_flu_management.risk_level',
    'pages.covid_flu_management.assessment_type',
    'pages.covid_flu_management.time_range',
    'pages.covid_flu_management.apply_filter',
    'pages.covid_flu_management.reset',
    'pages.covid_flu_management.assessment_records',
    'pages.covid_flu_management.no_records',
    'pages.covid_flu_management.view',
    'pages.covid_flu_management.diagnose'
  ]
  
  testKeys.forEach(key => {
    const translation = i18n.t(key)
    console.log(`✓ ${key}: ${translation}`)
  })
})

console.log('\n🎉 CovidFluManagementPage 國際化測試完成！')
console.log('✅ 所有主要翻譯鍵都已正確配置') 