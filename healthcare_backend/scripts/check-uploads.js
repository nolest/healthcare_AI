const fs = require('fs');
const path = require('path');

function checkUploadsDirectory() {
  console.log('🔍 检查uploads目录...');
  
  const baseDir = process.cwd();
  const uploadsPath = path.join(baseDir, 'uploads');
  const picPath = path.join(uploadsPath, 'pic');
  const measurementPath = path.join(picPath, 'measurement');
  const covidPath = path.join(picPath, 'covid');
  
  console.log('📁 基础目录:', baseDir);
  console.log('📁 uploads路径:', uploadsPath);
  
  const directories = [
    { path: uploadsPath, name: 'uploads' },
    { path: picPath, name: 'pic' },
    { path: measurementPath, name: 'measurement' },
    { path: covidPath, name: 'covid' }
  ];
  
  directories.forEach(({ path: dirPath, name }) => {
    try {
      if (fs.existsSync(dirPath)) {
        const stats = fs.statSync(dirPath);
        console.log(`✅ ${name}: 存在 (权限: ${(stats.mode & parseInt('777', 8)).toString(8)})`);
        
        // 测试写入权限
        try {
          const testFile = path.join(dirPath, '.write-test');
          fs.writeFileSync(testFile, 'test');
          fs.unlinkSync(testFile);
          console.log(`✅ ${name}: 可写`);
        } catch (writeError) {
          console.log(`❌ ${name}: 不可写 -`, writeError.message);
        }
      } else {
        console.log(`❌ ${name}: 不存在`);
        // 尝试创建
        try {
          fs.mkdirSync(dirPath, { recursive: true });
          console.log(`✅ ${name}: 已创建`);
        } catch (createError) {
          console.log(`❌ ${name}: 创建失败 -`, createError.message);
        }
      }
    } catch (error) {
      console.log(`❌ ${name}: 检查失败 -`, error.message);
    }
  });
  
  console.log('🔍 检查完成');
}

if (require.main === module) {
  checkUploadsDirectory();
}

module.exports = { checkUploadsDirectory }; 