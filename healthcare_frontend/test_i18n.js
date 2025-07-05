// 测试国际化功能
import i18n from './src/utils/i18n.js'

console.log('=== 国际化功能测试 ===')

// 测试默认语言
console.log('当前语言:', i18n.getCurrentLanguage())

// 测试可用语言
console.log('可用语言:', i18n.getAvailableLanguages())

// 测试翻译功能
console.log('\n=== 繁体中文翻译测试 ===')
i18n.setLanguage('zh-TW')
console.log('app.title:', i18n.t('app.title'))
console.log('auth.login:', i18n.t('auth.login'))
console.log('auth.register:', i18n.t('auth.register'))
console.log('features.smart_measurement:', i18n.t('features.smart_measurement'))

console.log('\n=== 简体中文翻译测试 ===')
i18n.setLanguage('zh-CN')
console.log('app.title:', i18n.t('app.title'))
console.log('auth.login:', i18n.t('auth.login'))
console.log('auth.register:', i18n.t('auth.register'))
console.log('features.smart_measurement:', i18n.t('features.smart_measurement'))

console.log('\n=== 英文翻译测试 ===')
i18n.setLanguage('en')
console.log('app.title:', i18n.t('app.title'))
console.log('auth.login:', i18n.t('auth.login'))
console.log('auth.register:', i18n.t('auth.register'))
console.log('features.smart_measurement:', i18n.t('features.smart_measurement'))

// 测试参数替换
console.log('\n=== 参数替换测试 ===')
i18n.setLanguage('zh-TW')
console.log('diagnosis.create_for:', i18n.t('diagnosis.create_for', { name: '張三' }))

i18n.setLanguage('en')
console.log('diagnosis.create_for:', i18n.t('diagnosis.create_for', { name: 'John' }))

// 测试不存在的键
console.log('\n=== 不存在的键测试 ===')
console.log('不存在的键:', i18n.t('non.existent.key'))

console.log('\n=== 测试完成 ===') 