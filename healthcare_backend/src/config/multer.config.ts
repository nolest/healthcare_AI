import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { generateUniformFilename } from '../utils/filename.utils';

// 创建通用的multer配置工厂函数
export const createMulterConfig = (businessType: 'measurement' | 'covid' = 'measurement'): MulterOptions => ({
  storage: diskStorage({
    destination: (req, file, cb) => {
      try {
        // 根据用户ID和业务类型创建文件夹
        const userId = (req as any).user?._id || (req as any).user?.id || 'temp';
        const uploadPath = join(process.cwd(), 'uploads', 'pic', businessType, String(userId));
        
        console.log(`Upload destination (${businessType}):`, uploadPath);
        console.log('User from request:', (req as any).user);
        
        // 如果文件夹不存在则创建
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
      } catch (error) {
        console.error('Error creating upload directory:', error);
        cb(error, null);
      }
    },
    filename: (req, file, cb) => {
      try {
        // 使用统一的文件名生成工具
        const filename = generateUniformFilename(file.originalname);
        
        console.log('Generated filename:', filename);
        console.log('Original filename:', file.originalname);
        cb(null, filename);
      } catch (error) {
        console.error('Error generating filename:', error);
        cb(error, null);
      }
    },
  }),
  fileFilter: (req, file, cb) => {
    try {
      console.log('File filter - mimetype:', file.mimetype);
      // 只允许图片文件
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        const error = new Error('只允许上传图片文件 (JPEG, PNG, GIF, WebP)');
        console.error('File filter error:', error.message);
        cb(error, false);
      }
    } catch (error) {
      console.error('File filter error:', error);
      cb(error, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 限制
    files: 5, // 最多5个文件
  },
});

// 向后兼容的默认配置（用于measurement）
export const multerConfig: MulterOptions = createMulterConfig('measurement'); 