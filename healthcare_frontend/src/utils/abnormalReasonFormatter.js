import i18n from './i18n.js'

/**
 * 异常原因格式化工具
 * 处理后端返回的结构化异常数据，生成国际化的异常原因文本
 */
class AbnormalReasonFormatter {
  /**
   * 格式化单个异常原因
   * @param {Object} reason - 结构化异常原因对象
   * @param {string} reason.type - 异常类型 (如 'systolic_pressure', 'heart_rate')
   * @param {number} reason.value - 异常值
   * @param {string} reason.unit - 单位
   * @param {string} reason.severity - 严重程度 (如 'low', 'medium', 'high', 'critical')
   * @param {Object} reason.normalRange - 正常范围 {min, max}
   * @param {boolean} reason.isHigh - 是否偏高
   * @returns {string} 格式化后的异常原因文本
   */
  static formatSingle(reason) {
    if (!reason || typeof reason !== 'object') {
      return reason?.toString() || ''
    }

    try {
      // 确定异常方向（偏高或偏低）
      const direction = reason.isHigh ? 'high' : 'low'
      
      // 构建异常类型翻译键
      const typeKey = `abnormal_reasons.${reason.type}_${direction}`

      // 构建严重程度翻译键
      const severityKey = `severity.${reason.severity}`

      // 获取翻译文本
      const translatedType = i18n.t(typeKey)
      const translatedSeverity = i18n.t(severityKey)
      const severityLabel = i18n.t('abnormal_reasons.severity_label')

      // 如果翻译键不存在，使用备用格式
      if (translatedType === typeKey) {
        console.warn(`Missing translation for abnormal reason type: ${typeKey}`)
        return `${reason.type} abnormal (${reason.value} ${reason.unit}, ${severityLabel}: ${translatedSeverity})`
      }

      // 构建完整的异常原因文本
      return `${translatedType} (${reason.value} ${reason.unit}, ${severityLabel}: ${translatedSeverity})`
    } catch (error) {
      console.error('Error formatting abnormal reason:', error)
      return reason.toString()
    }
  }

  /**
   * 格式化异常原因数组
   * @param {Array} reasons - 异常原因数组
   * @returns {Array} 格式化后的异常原因文本数组
   */
  static formatMultiple(reasons) {
    if (!Array.isArray(reasons)) {
      return []
    }

    return reasons.map(reason => this.formatSingle(reason))
  }

  /**
   * 检查是否为结构化数据
   * @param {*} reason - 异常原因数据
   * @returns {boolean} 是否为结构化数据
   */
  static isStructuredData(reason) {
    return reason &&
           typeof reason === 'object' && 
           typeof reason.type === 'string' &&
           typeof reason.value === 'number' &&
           typeof reason.unit === 'string' &&
           typeof reason.severity === 'string'
  }

  /**
   * 智能格式化：处理结构化数据
   * @param {*} reason - 异常原因数据（应该是结构化对象）
   * @returns {string} 格式化后的文本
   */
  static smartFormat(reason) {
    // 检查是否为结构化数据
    if (this.isStructuredData(reason)) {
      return this.formatSingle(reason)
    }

    // 如果不是结构化数据，可能是旧数据或无效数据
    console.warn('Received non-structured abnormal reason data:', reason)
    return reason?.toString() || ''
  }

  /**
   * 批量智能格式化
   * @param {Array} reasons - 异常原因数组
   * @returns {Array} 格式化后的文本数组
   */
  static smartFormatMultiple(reasons) {
    if (!Array.isArray(reasons)) {
      return []
    }

    return reasons.map(reason => this.smartFormat(reason))
  }
}

export default AbnormalReasonFormatter 