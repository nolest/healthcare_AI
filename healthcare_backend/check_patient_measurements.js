const mongoose = require('mongoose');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/healthcare_local');

// 定义 Schema
const userSchema = new mongoose.Schema({}, { strict: false });
const measurementSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);
const Measurement = mongoose.model('Measurement', measurementSchema);

async function checkPatientMeasurements() {
  try {
    console.log('🔍 检查患者p001的测量记录...\n');

    // 1. 查找用户p001
    const patient = await User.findOne({ username: 'p001' });
    if (!patient) {
      console.log('❌ 未找到用户p001');
      process.exit(1);
    }

    console.log('✅ 找到患者p001:');
    console.log({
      _id: patient._id,
      username: patient.username,
      fullName: patient.fullName,
      email: patient.email,
      role: patient.role
    });

    // 2. 查找该患者的测量记录
    console.log('\n🔍 查找测量记录...');
    const measurements = await Measurement.find({ userId: patient._id });
    
    console.log(`📊 找到 ${measurements.length} 条测量记录\n`);

    if (measurements.length === 0) {
      console.log('❌ 该患者没有测量记录');
      
      // 检查是否有其他用户的测量记录
      console.log('\n🔍 检查所有测量记录的userId...');
      const allMeasurements = await Measurement.find({}).limit(5);
      allMeasurements.forEach((m, index) => {
        console.log(`测量记录${index + 1}: userId = ${m.userId} (类型: ${typeof m.userId})`);
      });
    } else {
      // 显示测量记录详情
      measurements.forEach((measurement, index) => {
        console.log(`📋 测量记录 ${index + 1}:`);
        console.log(`  ID: ${measurement._id}`);
        console.log(`  用户ID: ${measurement.userId}`);
        console.log(`  收缩压: ${measurement.systolic || '未测量'}`);
        console.log(`  舒张压: ${measurement.diastolic || '未测量'}`);
        console.log(`  心率: ${measurement.heartRate || '未测量'} bpm`);
        console.log(`  体温: ${measurement.temperature || '未测量'} °C`);
        console.log(`  血氧: ${measurement.oxygenSaturation || '未测量'} %`);
        console.log(`  血糖: ${measurement.bloodSugar || '未测量'} mg/dL`);
        console.log(`  异常: ${measurement.isAbnormal ? '是' : '否'}`);
        console.log(`  异常原因: ${measurement.abnormalReasons ? measurement.abnormalReasons.join(', ') : '无'}`);
        console.log(`  状态: ${measurement.status || '未设置'}`);
        console.log(`  测量时间: ${measurement.measurementTime || measurement.createdAt}`);
        console.log('');
      });
    }

    console.log('✅ 检查完成');
    process.exit(0);

  } catch (error) {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  }
}

checkPatientMeasurements(); 