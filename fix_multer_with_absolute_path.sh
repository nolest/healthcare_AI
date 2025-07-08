#!/bin/bash

# 修复multer配置，使用绝对路径
echo "🔧 修复multer配置，使用绝对路径..."

cd /home/ubuntu/code/healthcare_AI/healthcare_backend

# 1. 备份原始配置
echo "💾 备份原始配置..."
cp src/config/multer.config.ts src/config/multer.config.ts.backup

# 2. 创建新的multer配置，使用绝对路径
echo "📝 创建新的multer配置..."
cat > src/config/multer.config.ts << 'EOF'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync, accessSync, constants } from 'fs';
import { generateUniformFilename } from '../utils/filename.utils';

// 创建通用的multer配置工厂函数
export const createMulterConfig = (businessType: 'measurement' | 'covid' = 'measurement'): MulterOptions => ({
  storage: diskStorage({
    destination: (req, file, cb) => {
      try {
        // 根据用户ID和业务类型创建文件夹
        const userId = (req as any).user?._id || (req as any).user?.id || 'temp';
        
        // 使用绝对路径，确保在Docker容器中正确工作
        const baseUploadPath = '/app/uploads/pic/' + businessType;
        const uploadPath = join(baseUploadPath, String(userId));
        
        console.log(`[${new Date().toISOString()}] 📁 Upload destination (${businessType}):`, uploadPath);
        console.log(`[${new Date().toISOString()}] 👤 User from request:`, {
          id: (req as any).user?.id,
          _id: (req as any).user?._id,
          username: (req as any).user?.username
        });
        
        // 确保基础上传目录存在
        if (!existsSync(baseUploadPath)) {
          console.log(`[${new Date().toISOString()}] 🔧 Creating base directory:`, baseUploadPath);
          mkdirSync(baseUploadPath, { recursive: true, mode: 0o755 });
        }
        
        // 确保用户特定目录存在
        if (!existsSync(uploadPath)) {
          console.log(`[${new Date().toISOString()}] 🔧 Creating user directory:`, uploadPath);
          mkdirSync(uploadPath, { recursive: true, mode: 0o755 });
          console.log(`[${new Date().toISOString()}] ✅ Directory created successfully`);
        } else {
          console.log(`[${new Date().toISOString()}] ✅ Directory already exists`);
        }
        
        // 验证目录权限
        try {
          accessSync(uploadPath, constants.R_OK | constants.W_OK);
          console.log(`[${new Date().toISOString()}] ✅ Directory permissions OK`);
        } catch (permError) {
          console.error(`[${new Date().toISOString()}] ❌ Directory permission error:`, permError);
          // 尝试修复权限
          try {
            require('fs').chmodSync(uploadPath, 0o755);
            console.log(`[${new Date().toISOString()}] ✅ Directory permissions fixed`);
          } catch (chmodError) {
            console.error(`[${new Date().toISOString()}] ❌ Failed to fix permissions:`, chmodError);
            throw new Error(`Upload directory permission denied: ${uploadPath}`);
          }
        }
        
        // 验证目录是否可写
        try {
          const testFile = join(uploadPath, '.write-test-' + Date.now());
          require('fs').writeFileSync(testFile, 'test');
          require('fs').unlinkSync(testFile);
          console.log(`[${new Date().toISOString()}] ✅ Directory write test passed`);
        } catch (writeError) {
          console.error(`[${new Date().toISOString()}] ❌ Directory write test failed:`, writeError);
          throw new Error(`Upload directory is not writable: ${uploadPath}. Error: ${writeError.message}`);
        }
        
        cb(null, uploadPath);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Error in multer destination:`, error);
        console.error(`[${new Date().toISOString()}] ❌ Error stack:`, error.stack);
        cb(error, null);
      }
    },
    filename: (req, file, cb) => {
      try {
        // 使用统一的文件名生成工具
        const filename = generateUniformFilename(file.originalname);
        
        console.log(`[${new Date().toISOString()}] 📝 Generated filename:`, filename);
        console.log(`[${new Date().toISOString()}] 📄 Original filename:`, file.originalname);
        console.log(`[${new Date().toISOString()}] 📊 File mimetype:`, file.mimetype);
        console.log(`[${new Date().toISOString()}] 📏 File size:`, file.size);
        
        cb(null, filename);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Error generating filename:`, error);
        console.error(`[${new Date().toISOString()}] ❌ Error stack:`, error.stack);
        cb(error, null);
      }
    },
  }),
  fileFilter: (req, file, cb) => {
    try {
      console.log(`[${new Date().toISOString()}] 🔍 File filter - mimetype:`, file.mimetype);
      console.log(`[${new Date().toISOString()}] 🔍 File filter - originalname:`, file.originalname);
      console.log(`[${new Date().toISOString()}] 🔍 File filter - size:`, file.size);
      
      // 只允许图片文件
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
      if (allowedMimes.includes(file.mimetype)) {
        console.log(`[${new Date().toISOString()}] ✅ File filter passed`);
        cb(null, true);
      } else {
        const error = new Error(`只允许上传图片文件 (JPEG, PNG, GIF, WebP)，当前文件类型: ${file.mimetype}`);
        console.error(`[${new Date().toISOString()}] ❌ File filter error:`, error.message);
        cb(error, false);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ File filter error:`, error);
      console.error(`[${new Date().toISOString()}] ❌ Error stack:`, error.stack);
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
EOF

# 3. 停止容器
echo "🛑 停止容器..."
docker-compose down

# 4. 确保uploads目录存在并有正确权限
echo "📁 确保uploads目录存在..."
mkdir -p uploads/pic/measurement
mkdir -p uploads/pic/covid
chmod -R 755 uploads/
chown -R ubuntu:ubuntu uploads/

# 5. 重新构建容器（确保新配置生效）
echo "🔄 重新构建容器..."
docker-compose build --no-cache healthcare-api

# 6. 启动容器
echo "🚀 启动容器..."
docker-compose up -d

# 7. 等待容器启动
echo "⏳ 等待容器启动..."
sleep 20

# 8. 检查容器状态
echo "📊 检查容器状态..."
docker-compose ps

# 9. 测试容器内的目录创建
echo "🧪 测试容器内的目录创建..."
docker exec healthcare-api mkdir -p /app/uploads/pic/measurement/test_user_$(date +%s)
docker exec healthcare-api ls -la /app/uploads/pic/measurement/

# 10. 查看后端日志
echo "📋 查看后端日志..."
docker-compose logs healthcare-api --tail=30

echo "✅ multer配置修复完成！"
echo "🌐 请访问 http://43.134.141.188:6886/ 测试图片上传功能"
echo "📋 如果仍有问题，请运行: docker-compose logs healthcare-api -f" 