/**
 * 解析aihs格式的文件名
 * @param {string} filename aihs格式的文件名
 * @returns {object} 解析后的信息对象
 */
export function parseAihsFilename(filename) {
  // 匹配 aihs_时间戳_随机数.扩展名 的格式
  const match = filename.match(/^aihs_(\d+)_(\d+)(\..+)?$/);
  
  if (!match) {
    return { isAihsFormat: false };
  }
  
  const [, timestampStr, randomNumberStr, extension] = match;
  const timestamp = parseInt(timestampStr, 10);
  const randomNumber = parseInt(randomNumberStr, 10);
  
  return {
    isAihsFormat: true,
    timestamp,
    randomNumber,
    extension: extension || '',
    createdAt: new Date(timestamp),
  };
}

/**
 * 验证文件名是否符合aihs格式
 * @param {string} filename 文件名
 * @returns {boolean} 是否符合格式
 */
export function isAihsFilename(filename) {
  return parseAihsFilename(filename).isAihsFormat;
}

/**
 * 生成文件的显示名称（用于前端显示）
 * @param {string} filename aihs格式的文件名
 * @param {string} fallbackName 备用显示名称
 * @returns {string} 用户友好的显示名称
 */
export function getDisplayFilename(filename, fallbackName) {
  const parsed = parseAihsFilename(filename);
  
  if (parsed.isAihsFormat && parsed.createdAt) {
    const dateStr = parsed.createdAt.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    return `症状图片_${dateStr}${parsed.extension}`;
  }
  
  return fallbackName || filename;
}

/**
 * 从文件路径中提取文件名
 * @param {string} path 文件路径
 * @returns {string} 文件名
 */
export function getFilenameFromPath(path) {
  if (!path) return '';
  return path.split('/').pop() || path;
}

/**
 * 获取文件的友好显示名称（从完整路径）
 * @param {string} path 文件路径
 * @param {string} fallbackName 备用显示名称
 * @returns {string} 用户友好的显示名称
 */
export function getDisplayFilenameFromPath(path, fallbackName) {
  const filename = getFilenameFromPath(path);
  return getDisplayFilename(filename, fallbackName);
} 