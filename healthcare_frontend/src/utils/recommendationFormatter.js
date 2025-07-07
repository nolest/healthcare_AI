import i18n from './i18n.js'

/**
 * COVID评估建议格式化工具
 * 处理后端返回的结构化建议数据，进行国际化转换
 */
class RecommendationFormatter {
  
  /**
   * 格式化单个建议项
   * @param {Object} recommendation - 结构化建议对象
   * @returns {string} 格式化后的建议文本
   */
  static formatSingle(recommendation) {
    if (!recommendation || typeof recommendation !== 'object') {
      return recommendation || ''
    }

    const { type, category, priority, key, params = {} } = recommendation
    
    // 构建翻译键
    const translationKey = `covid_recommendations.${category}.${key}`
    
    // 获取翻译文本
    const translatedText = i18n.t(translationKey, params)
    
    // 如果没有找到翻译，返回原始文本或键名
    if (translatedText === translationKey && recommendation.text) {
      return recommendation.text
    }
    
    return translatedText
  }

  /**
   * 格式化建议列表
   * @param {Array} recommendations - 建议数组
   * @returns {Array} 格式化后的建议文本数组
   */
  static formatList(recommendations) {
    if (!Array.isArray(recommendations)) {
      return []
    }

    return recommendations.map(rec => this.formatSingle(rec))
  }

  /**
   * 格式化完整的建议对象
   * @param {Object} recommendations - 包含各类建议的对象
   * @returns {Object} 格式化后的建议对象
   */
  static formatAll(recommendations) {
    if (!recommendations || typeof recommendations !== 'object') {
      return {}
    }

    const formatted = {}
    
    // 处理各个类别的建议
    const categories = ['testing', 'isolation', 'medical', 'prevention', 'monitoring']
    
    categories.forEach(category => {
      if (recommendations[category]) {
        formatted[category] = this.formatList(recommendations[category])
      }
    })

    return formatted
  }

  /**
   * 智能格式化 - 自动检测数据格式
   * @param {*} recommendations - 建议数据
   * @returns {Object} 格式化后的建议对象
   */
  static smartFormat(recommendations) {
    if (!recommendations) {
      return {}
    }

    // 如果是字符串，尝试解析为JSON
    if (typeof recommendations === 'string') {
      try {
        recommendations = JSON.parse(recommendations)
      } catch (e) {
        console.warn('Failed to parse recommendations JSON:', e)
        return {}
      }
    }

    // 如果不是对象，返回空对象
    if (typeof recommendations !== 'object') {
      return {}
    }

    // 检查是否为结构化数据
    const hasStructuredData = Object.values(recommendations).some(category => 
      Array.isArray(category) && category.some(item => 
        typeof item === 'object' && item.key
      )
    )

    if (hasStructuredData) {
      // 处理结构化数据
      return this.formatAll(recommendations)
    } else {
      // 处理旧格式数据（字符串数组）
      return this.formatLegacyData(recommendations)
    }
  }

  /**
   * 处理旧格式数据（向后兼容）
   * @param {Object} recommendations - 旧格式建议对象
   * @returns {Object} 格式化后的建议对象
   */
  static formatLegacyData(recommendations) {
    const formatted = {}
    
    Object.keys(recommendations).forEach(category => {
      if (Array.isArray(recommendations[category])) {
        formatted[category] = recommendations[category].map(text => {
          // 尝试翻译常见的建议文本
          const translatedText = this.translateLegacyText(text)
          return translatedText || text
        })
      }
    })

    return formatted
  }

  /**
   * 翻译旧格式的建议文本
   * @param {string} text - 原始文本
   * @returns {string} 翻译后的文本
   */
  static translateLegacyText(text) {
    // 常见建议文本的映射
    const textMappings = {
      '立即进行PCR检测': 'covid_recommendations.testing.immediate_pcr',
      '考虑快速抗原检测作为补充': 'covid_recommendations.testing.rapid_antigen_supplement',
      '建议在24小时内进行检测': 'covid_recommendations.testing.within_24_hours',
      '可考虑快速抗原检测': 'covid_recommendations.testing.consider_rapid_antigen',
      '考虑进行检测': 'covid_recommendations.testing.consider_testing',
      
      '立即开始隔离，直到获得阴性检测结果': 'covid_recommendations.isolation.immediate_until_negative',
      '隔离期间避免与他人接触': 'covid_recommendations.isolation.avoid_contact',
      '开始预防性隔离': 'covid_recommendations.isolation.preventive_isolation',
      '避免与高风险人群接触': 'covid_recommendations.isolation.avoid_high_risk_contact',
      '减少外出和社交活动': 'covid_recommendations.isolation.reduce_social_activity',
      
      '密切监测症状变化': 'covid_recommendations.monitoring.close_symptom_monitoring',
      '每日测量体温': 'covid_recommendations.monitoring.daily_temperature',
      '监测症状发展': 'covid_recommendations.monitoring.symptom_development',
      '记录体温变化': 'covid_recommendations.monitoring.record_temperature',
      '观察症状变化': 'covid_recommendations.monitoring.observe_symptoms',
      '继续观察症状': 'covid_recommendations.monitoring.continue_observation',
      
      '立即联系医疗机构': 'covid_recommendations.medical.immediate_contact',
      '如出现呼吸困难，立即就医': 'covid_recommendations.medical.breathing_difficulty_emergency',
      '联系医疗提供者咨询': 'covid_recommendations.medical.contact_provider',
      
      '佩戴口罩': 'covid_recommendations.prevention.wear_mask',
      '勤洗手': 'covid_recommendations.prevention.frequent_handwashing',
      '保持良好卫生习惯': 'covid_recommendations.prevention.good_hygiene',
      '充足休息': 'covid_recommendations.prevention.adequate_rest',
      '多喝水': 'covid_recommendations.prevention.drink_water'
    }

    const translationKey = textMappings[text]
    if (translationKey) {
      return i18n.t(translationKey)
    }

    return null
  }

  /**
   * 检查是否为结构化建议数据
   * @param {*} data - 要检查的数据
   * @returns {boolean} 是否为结构化数据
   */
  static isStructuredData(data) {
    if (!data || typeof data !== 'object') {
      return false
    }

    return Object.values(data).some(category => 
      Array.isArray(category) && category.some(item => 
        typeof item === 'object' && item.key
      )
    )
  }
}

export default RecommendationFormatter 