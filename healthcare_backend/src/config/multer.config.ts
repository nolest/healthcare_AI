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
        
        console.log(`[${new Date().toISOString()}] Upload destination (${businessType}):`, uploadPath);
        console.log(`[${new Date().toISOString()}] User from request:`, {
          id: (req as any).user?.id,
          _id: (req as any).user?._id,
          username: (req as any).user?.username
        });
        console.log(`[${new Date().toISOString()}] Process CWD:`, process.cwd());
        console.log(`[${new Date().toISOString()}] Node ENV:`, process.env.NODE_ENV);
        
        // 如果文件夹不存在则创建
        if (!existsSync(uploadPath)) {
          console.log(`[${new Date().toISOString()}] Creating directory:`, uploadPath);
          mkdirSync(uploadPath, { recursive: true });
          console.log(`[${new Date().toISOString()}] Directory created successfully`);
        } else {
          console.log(`[${new Date().toISOString()}] Directory already exists`);
        }
        
        // 验证目录是否可写
        try {
          const testFile = join(uploadPath, '.write-test');
          require('fs').writeFileSync(testFile, 'test');
          require('fs').unlinkSync(testFile);
          console.log(`[${new Date().toISOString()}] Directory write test passed`);
        } catch (writeError) {
          console.error(`[${new Date().toISOString()}] Directory write test failed:`, writeError);
          throw new Error(`Upload directory is not writable: ${uploadPath}`);
        }
        
        cb(null, uploadPath);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error creating upload directory:`, error);
        console.error(`[${new Date().toISOString()}] Error stack:`, error.stack);
        cb(error, null);
      }
    },
    filename: (req, file, cb) => {
      try {
        // 使用统一的文件名生成工具
        const filename = generateUniformFilename(file.originalname);
        
        console.log(`[${new Date().toISOString()}] Generated filename:`, filename);
        console.log(`[${new Date().toISOString()}] Original filename:`, file.originalname);
        console.log(`[${new Date().toISOString()}] File mimetype:`, file.mimetype);
        console.log(`[${new Date().toISOString()}] File size:`, file.size);
        
        cb(null, filename);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error generating filename:`, error);
        console.error(`[${new Date().toISOString()}] Error stack:`, error.stack);
        cb(error, null);
      }
    },
  }),
  fileFilter: (req, file, cb) => {
    try {
      console.log(`[${new Date().toISOString()}] File filter - mimetype:`, file.mimetype);
      console.log(`[${new Date().toISOString()}] File filter - originalname:`, file.originalname);
      console.log(`[${new Date().toISOString()}] File filter - size:`, file.size);
      
      // 只允许图片文件
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        console.log(`[${new Date().toISOString()}] File filter passed`);
        cb(null, true);
      } else {
        const error = new Error(`只允许上传图片文件 (JPEG, PNG, GIF, WebP)，当前文件类型: ${file.mimetype}`);
        console.error(`[${new Date().toISOString()}] File filter error:`, error.message);
        cb(error, false);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] File filter error:`, error);
      console.error(`[${new Date().toISOString()}] Error stack:`, error.stack);
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