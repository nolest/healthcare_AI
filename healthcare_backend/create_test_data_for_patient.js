const mongoose = require('mongoose');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/healthcare_local');

// 定义 Schema
const userSchema = new mongoose.Schema({}, { strict: false });
const measurementSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);
const Measurement = mongoose.model('Measurement', measurementSchema);

async function createTestDataForPatient() {
  try {
    console.log('🔍 查找患者p001...\n');

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
      email: patient.email
    });

    // 2. 创建测试测量数据
    console.log('\n📊 创建测试测量数据...');
    
    const testMeasurements = [
      {
        userId: patient._id,
        systolic: 145,
        diastolic: 95,
        heartRate: 88,
        temperature: 36.8,
        oxygenSaturation: 98,
        bloodSugar: 110,
        isAbnormal: true,
        abnormalReasons: ['收縮壓偏高', '舒張壓偏高'],
        status: 'pending',
        measurementTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
        location: '家中自测',
        notes: '早晨测量，空腹状态'
      },
      {
        userId: patient._id,
        systolic: 138,
        diastolic: 88,
        heartRate: 75,
        temperature: 37.2,
        oxygenSaturation: 99,
        bloodSugar: 95,
        isAbnormal: true,
        abnormalReasons: ['收縮壓偏高', '體溫偏高'],
        status: 'pending',
        measurementTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前
        location: '诊所',
        notes: '下午测量，餐后2小时'
      },
      {
        userId: patient._id,
        systolic: 125,
        diastolic: 82,
        heartRate: 72,
        temperature: 36.5,
        oxygenSaturation: 98,
        bloodSugar: 88,
        isAbnormal: false,
        abnormalReasons: [],
        status: 'pending',
        measurementTime: new Date(), // 现在
        location: '医院',
        notes: '常规检查，状态良好'
      }
    ];

    // 3. 插入测量数据
    for (let i = 0; i < testMeasurements.length; i++) {
      const measurement = new Measurement(testMeasurements[i]);
      const saved = await measurement.save();
      console.log(`✅ 创建测量记录 ${i + 1}: ${saved._id}`);
    }

    console.log('\n🎉 测试数据创建完成！');
    console.log(`为患者 ${patient.fullName} (${patient.username}) 创建了 ${testMeasurements.length} 条测量记录`);

    // 4. 验证数据
    console.log('\n🔍 验证创建的数据...');
    const createdMeasurements = await Measurement.find({ userId: patient._id });
    console.log(`找到 ${createdMeasurements.length} 条测量记录`);

    createdMeasurements.forEach((m, index) => {
      console.log(`记录 ${index + 1}: ${m.systolic}/${m.diastolic} mmHg, 心率: ${m.heartRate}, 异常: ${m.isAbnormal ? '是' : '否'}`);
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ 创建测试数据失败:', error);
    process.exit(1);
  }
}

createTestDataForPatient(); 