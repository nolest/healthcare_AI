import { extname } from 'path';

/**
 * 生成统一的文件名格式
 * @param originalName 原始文件名（可选）
 * @param extension 文件扩展名（可选，如果不提供则从原始文件名提取）
 * @returns 格式化的文件名：aihs_时间戳_随机数.扩展名
 */
export function generateUniformFilename(originalName?: string, extension?: string): string {
  const timestamp = Date.now();
  const randomNumber = Math.round(Math.random() * 1E9);
  
  // 确定文件扩展名
  let ext = extension;
  if (!ext && originalName) {
    ext = extname(originalName);
  }
  if (!ext) {
    ext = '.png'; // 默认扩展名
  }
  
  // 确保扩展名以点开头
  if (!ext.startsWith('.')) {
    ext = '.' + ext;
  }
  
  return `aihs_${timestamp}_${randomNumber}${ext}`;
}

/**
 * 从aihs格式的文件名中提取信息
 * @param filename aihs格式的文件名
 * @returns 解析后的信息对象
 */
export function parseAihsFilename(filename: string): {
  isAihsFormat: boolean;
  timestamp?: number;
  randomNumber?: number;
  extension?: string;
  createdAt?: Date;
} {
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
 * @param filename 文件名
 * @returns 是否符合格式
 */
export function isAihsFilename(filename: string): boolean {
  return parseAihsFilename(filename).isAihsFormat;
}

/**
 * 生成文件的显示名称（用于前端显示）
 * @param filename aihs格式的文件名
 * @param fallbackName 备用显示名称
 * @returns 用户友好的显示名称
 */
export function getDisplayFilename(filename: string, fallbackName?: string): string {
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