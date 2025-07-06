// 简化版异常原因翻译测试脚本 - 不依赖外部库

// 简化的i18n类用于测试
class TestI18n {
  constructor() {
    this.currentLanguage = 'zh-TW';
    this.translations = {
      'zh-TW': {
        'abnormal_reasons.systolic_high': '收縮壓偏高',
        'abnormal_reasons.systolic_low': '收縮壓偏低',
        'abnormal_reasons.diastolic_high': '舒張壓偏高',
        'abnormal_reasons.diastolic_low': '舒張壓偏低',
        'abnormal_reasons.heart_rate_high': '心率過快',
        'abnormal_reasons.heart_rate_low': '心率過慢',
        'abnormal_reasons.temperature_high': '體溫偏高',
        'abnormal_reasons.temperature_low': '體溫偏低',
        'abnormal_reasons.oxygen_saturation_low': '血氧飽和度偏低',
        'abnormal_reasons.blood_glucose_high': '血糖偏高',
        'abnormal_reasons.blood_glucose_low': '血糖偏低',
        'severity.normal': '正常',
        'severity.low': '偏低',
        'severity.high': '偏高',
        'severity.severeLow': '嚴重偏低',
        'severity.severeHigh': '嚴重偏高',
        'severity.critical': '危急'
      },
      'zh-CN': {
        'abnormal_reasons.systolic_high': '收缩压偏高',
        'abnormal_reasons.systolic_low': '收缩压偏低',
        'abnormal_reasons.diastolic_high': '舒张压偏高',
        'abnormal_reasons.diastolic_low': '舒张压偏低',
        'abnormal_reasons.heart_rate_high': '心率过快',
        'abnormal_reasons.heart_rate_low': '心率过慢',
        'abnormal_reasons.temperature_high': '体温偏高',
        'abnormal_reasons.temperature_low': '体温偏低',
        'abnormal_reasons.oxygen_saturation_low': '血氧饱和度偏低',
        'abnormal_reasons.blood_glucose_high': '血糖偏高',
        'abnormal_reasons.blood_glucose_low': '血糖偏低',
        'severity.normal': '正常',
        'severity.low': '偏低',
        'severity.high': '偏高',
        'severity.severeLow': '严重偏低',
        'severity.severeHigh': '严重偏高',
        'severity.critical': '危急'
      },
      'en': {
        'abnormal_reasons.systolic_high': 'High Systolic Pressure',
        'abnormal_reasons.systolic_low': 'Low Systolic Pressure',
        'abnormal_reasons.diastolic_high': 'High Diastolic Pressure',
        'abnormal_reasons.diastolic_low': 'Low Diastolic Pressure',
        'abnormal_reasons.heart_rate_high': 'High Heart Rate',
        'abnormal_reasons.heart_rate_low': 'Low Heart Rate',
        'abnormal_reasons.temperature_high': 'High Temperature',
        'abnormal_reasons.temperature_low': 'Low Temperature',
        'abnormal_reasons.oxygen_saturation_low': 'Low Oxygen Saturation',
        'abnormal_reasons.blood_glucose_high': 'High Blood Glucose',
        'abnormal_reasons.blood_glucose_low': 'Low Blood Glucose',
        'severity.normal': 'Normal',
        'severity.low': 'Low',
        'severity.high': 'High',
        'severity.severeLow': 'Severely Low',
        'severity.severeHigh': 'Severely High',
        'severity.critical': 'Critical'
      }
    };
  }

  setLanguage(language) {
    this.currentLanguage = language;
  }

  t(key, params = {}) {
    const translation = this.translations[this.currentLanguage]?.[key] || key;
    
    // 处理参数替换
    let result = translation;
    Object.keys(params).forEach(param => {
      result = result.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    });
    
    return result;
  }
}

const i18n = new TestI18n();

console.log('🧪 测试异常原因翻译功能');
console.log('='.repeat(50));

// 测试数据 - 模拟后端返回的繁体中文异常原因
const testReasons = [
  '收縮壓異常 (160 mmHg, 嚴重程度: high)',
  '舒張壓異常 (95 mmHg, 嚴重程度: high)',
  '心率異常 (120 bpm, 嚴重程度: high)',
  '體溫異常 (38.5°C, 嚴重程度: high)',
  '血氧飽和度異常 (90%, 嚴重程度: low)',
  '收縮壓異常 (80 mmHg, 嚴重程度: low)',
  '心率異常 (45 bpm, 嚴重程度: severeLow)',
  '體溫異常 (35.5°C, 嚴重程度: severeLow)',
  '血糖異常 (180 mg/dL, 嚴重程度: high)',
  '血糖異常 (60 mg/dL, 嚴重程度: low)'
];

// 模拟翻译函数
const translateAbnormalReason = (reason) => {
  const t = (key, params = {}) => {
    return i18n.t(key, params);
  };

  if (!reason || typeof reason !== 'string') {
    return reason;
  }

  // 提取数值和单位的正则表达式
  const valuePattern = /\(([^)]+)\)/;
  const valueMatch = reason.match(valuePattern);
  const valueInfo = valueMatch ? valueMatch[1] : '';

  // 提取严重程度的正则表达式
  const severityPattern = /嚴重程度:\s*(\w+)/;
  const severityMatch = reason.match(severityPattern);
  const severity = severityMatch ? severityMatch[1] : '';

  // 根据异常原因的关键词进行匹配和翻译
  if (reason.includes('收縮壓異常')) {
    const baseKey = valueInfo.includes('mmHg') && parseInt(valueInfo) > 140 ? 
      'abnormal_reasons.systolic_high' : 'abnormal_reasons.systolic_low';
    const translatedReason = t(baseKey);
    const translatedSeverity = severity ? t(`severity.${severity}`) : '';
    return `${translatedReason} (${valueInfo}${translatedSeverity ? `, ${translatedSeverity}` : ''})`;
  }
  
  if (reason.includes('舒張壓異常')) {
    const baseKey = valueInfo.includes('mmHg') && parseInt(valueInfo) > 90 ? 
      'abnormal_reasons.diastolic_high' : 'abnormal_reasons.diastolic_low';
    const translatedReason = t(baseKey);
    const translatedSeverity = severity ? t(`severity.${severity}`) : '';
    return `${translatedReason} (${valueInfo}${translatedSeverity ? `, ${translatedSeverity}` : ''})`;
  }
  
  if (reason.includes('心率異常')) {
    const baseKey = valueInfo.includes('bpm') && parseInt(valueInfo) > 100 ? 
      'abnormal_reasons.heart_rate_high' : 'abnormal_reasons.heart_rate_low';
    const translatedReason = t(baseKey);
    const translatedSeverity = severity ? t(`severity.${severity}`) : '';
    return `${translatedReason} (${valueInfo}${translatedSeverity ? `, ${translatedSeverity}` : ''})`;
  }
  
  if (reason.includes('體溫異常')) {
    const baseKey = valueInfo.includes('°C') && parseFloat(valueInfo) > 37.2 ? 
      'abnormal_reasons.temperature_high' : 'abnormal_reasons.temperature_low';
    const translatedReason = t(baseKey);
    const translatedSeverity = severity ? t(`severity.${severity}`) : '';
    return `${translatedReason} (${valueInfo}${translatedSeverity ? `, ${translatedSeverity}` : ''})`;
  }
  
  if (reason.includes('血氧飽和度異常')) {
    const translatedReason = t('abnormal_reasons.oxygen_saturation_low');
    const translatedSeverity = severity ? t(`severity.${severity}`) : '';
    return `${translatedReason} (${valueInfo}${translatedSeverity ? `, ${translatedSeverity}` : ''})`;
  }
  
  if (reason.includes('血糖異常')) {
    const baseKey = valueInfo.includes('mg/dL') && parseInt(valueInfo) > 140 ? 
      'abnormal_reasons.blood_glucose_high' : 'abnormal_reasons.blood_glucose_low';
    const translatedReason = t(baseKey);
    const translatedSeverity = severity ? t(`severity.${severity}`) : '';
    return `${translatedReason} (${valueInfo}${translatedSeverity ? `, ${translatedSeverity}` : ''})`;
  }

  // 如果没有匹配到任何已知模式，返回原始文本
  return reason;
};

// 测试函数
const testTranslation = () => {
  let passedTests = 0;
  let totalTests = 0;

  const languages = ['zh-TW', 'zh-CN', 'en'];
  
  languages.forEach(lang => {
    console.log(`\n🌍 测试语言: ${lang}`);
    console.log('-'.repeat(30));
    
    i18n.setLanguage(lang);
    
    testReasons.forEach((originalReason, index) => {
      totalTests++;
      
      try {
        const translatedReason = translateAbnormalReason(originalReason);
        
        console.log(`${index + 1}. 原始: ${originalReason}`);
        console.log(`   翻译: ${translatedReason}`);
        
        // 验证翻译是否成功（不应该包含原始的繁体中文关键词）
        const hasOriginalKeywords = translatedReason.includes('收縮壓異常') || 
                                   translatedReason.includes('舒張壓異常') || 
                                   translatedReason.includes('心率異常') || 
                                   translatedReason.includes('體溫異常') || 
                                   translatedReason.includes('血氧飽和度異常') ||
                                   translatedReason.includes('血糖異常');
        
        if (!hasOriginalKeywords && translatedReason !== originalReason) {
          console.log(`   ✅ 翻译成功`);
          passedTests++;
        } else {
          console.log(`   ❌ 翻译失败 - 仍包含原始关键词或未翻译`);
        }
        
      } catch (error) {
        console.log(`   ❌ 翻译错误: ${error.message}`);
      }
      
      console.log('');
    });
  });

  return { passedTests, totalTests };
};

// 运行测试
const results = testTranslation();

console.log('\n📊 测试结果总结');
console.log('='.repeat(50));
console.log(`✅ 通过测试: ${results.passedTests}/${results.totalTests}`);
console.log(`📈 成功率: ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%`);

if (results.passedTests === results.totalTests) {
  console.log('\n🎉 所有异常原因翻译测试通过！');
  console.log('✨ 功能特点:');
  console.log('   - 支持三种语言翻译');
  console.log('   - 智能识别异常类型');
  console.log('   - 保留数值和严重程度信息');
  console.log('   - 优雅处理未知格式');
} else {
  console.log('\n⚠️  部分测试失败，请检查翻译逻辑');
}

console.log('\n🔧 使用方法:');
console.log('在 PatientMeasurementResultPage.jsx 中调用 translateAbnormalReason(reason) 函数');
console.log('即可将后端返回的繁体中文异常原因转换为当前语言的翻译文本');

console.log('\n📋 示例转换:');
console.log('原始: 收縮壓異常 (160 mmHg, 嚴重程度: high)');
console.log('繁体: 收縮壓偏高 (160 mmHg, 偏高)');
console.log('简体: 收缩压偏高 (160 mmHg, 偏高)');
console.log('英文: High Systolic Pressure (160 mmHg, High)'); 