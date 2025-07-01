import { Injectable } from '@nestjs/common';
import { appConfig } from '../config/app.config';

@Injectable()
export class ImageUrlService {
  /**
   * 根据相对路径生成完整的图片URL
   * @param relativePath 相对路径，例如："/uploads/pic/userId/filename.png"
   * @returns 完整的图片URL
   */
  getFullImageUrl(relativePath: string): string {
    if (!relativePath) return '';
    
    // 如果已经是完整URL，直接返回
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    
    // 确保路径以 / 开头
    const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    
    return `${appConfig.staticUrl}${normalizedPath}`;
  }

  /**
   * 根据用户ID和文件名生成完整的图片URL
   * @param userId 用户ID
   * @param filename 文件名
   * @param businessType 业务类型 'measurement' | 'covid'
   * @returns 完整的图片URL
   */
  getImageUrl(userId: string, filename: string, businessType: 'measurement' | 'covid' = 'measurement'): string {
    const relativePath = `/uploads/pic/${businessType}/${userId}/${filename}`;
    return this.getFullImageUrl(relativePath);
  }

  /**
   * 从完整路径中提取业务类型
   * @param fullPath 完整路径
   * @returns 业务类型
   */
  extractBusinessTypeFromPath(fullPath: string): 'measurement' | 'covid' | null {
    const match = fullPath.match(/\/uploads\/pic\/(measurement|covid)\//);
    return match ? match[1] as 'measurement' | 'covid' : null;
  }

  /**
   * 批量处理图片路径数组
   * @param imagePaths 图片路径数组
   * @returns 完整URL数组
   */
  getFullImageUrls(imagePaths: string[]): string[] {
    if (!imagePaths || !Array.isArray(imagePaths)) return [];
    
    return imagePaths.map(path => this.getFullImageUrl(path));
  }

  /**
   * 获取静态资源基础URL
   * @returns 静态资源基础URL
   */
  getStaticBaseUrl(): string {
    return appConfig.staticUrl;
  }

  /**
   * 获取当前环境配置信息
   * @returns 环境配置信息
   */
  getEnvironmentInfo() {
    return {
      environment: appConfig.environment,
      staticUrl: appConfig.staticUrl,
      apiUrl: appConfig.apiUrl,
      frontendUrl: appConfig.frontendUrl,
    };
  }
} 