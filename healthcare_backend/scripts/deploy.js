const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 医疗 AI 项目 - 自动部署脚本');
console.log('===============================');

function runCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} 完成`);
  } catch (error) {
    console.error(`❌ ${description} 失败:`, error.message);
    process.exit(1);
  }
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description} 存在`);
    return true;
  } else {
    console.log(`⚠️ ${description} 不存在`);
    return false;
  }
}

async function deploy() {
  console.log('\n🔍 检查环境...');
  
  // 检查必要文件
  const envExists = checkFile('.env', '环境配置文件');
  const packageExists = checkFile('package.json', 'package.json');
  
  if (!packageExists) {
    console.error('❌ 缺少 package.json 文件');
    process.exit(1);
  }
  
  if (!envExists) {
    console.log('\n📝 创建默认 .env 文件...');
    const defaultEnv = `MONGODB_URI=mongodb://127.0.0.1:27017/healthcare_local
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development`;
    
    fs.writeFileSync('.env', defaultEnv);
    console.log('✅ 默认 .env 文件已创建，请根据需要修改配置');
  }
  
  // 安装依赖
  runCommand('npm install', '安装项目依赖');
  
  // 初始化数据库
  console.log('\n🗄️ 初始化数据库...');
  runCommand('node scripts/init-database.js', '创建数据库表和索引');
  
  // 生成示例数据（可选）
  console.log('\n🌱 是否生成示例数据？');
  try {
    runCommand('node scripts/seed-sample-data.js', '生成示例数据');
  } catch (error) {
    console.log('⚠️ 示例数据生成失败，继续部署...');
  }
  
  // 构建项目
  runCommand('npm run build', '构建项目');
  
  // 检查数据库状态
  runCommand('node scripts/check-database.js', '检查数据库状态');
  
  console.log('\n🎉 部署完成！');
  console.log('\n📝 后续操作:');
  console.log('1. 启动开发服务器: npm run start:dev');
  console.log('2. 启动生产服务器: npm run start:prod');
  console.log('3. 访问 API 文档: http://localhost:3000/api');
  console.log('4. 测试 API: npm run test:api');
  
  console.log('\n👤 默认账户:');
  console.log('- 管理员: admin / admin123');
  console.log('- 医生: doctor001 / doctor123');
  console.log('- 患者: patient001 / patient123');
}

// 运行部署
deploy().catch(console.error); 