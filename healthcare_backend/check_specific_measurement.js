const mongoose = require('mongoose');

// 连接到数据库
mongoose.connect('mongodb://localhost:27017/healthcare_local');

// 定义Schema
const measurementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  systolic: Number,
  diastolic: Number,
  heartRate: Number,
  temperature: Number,
  oxygenSaturation: Number,
  notes: String,
  imagePaths: [String],
  status: { type: String, default: 'pending' },
  isAbnormal: { type: Boolean, default: false },
  abnormalReasons: [String],
  measurementTime: Date
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  username: String,
  fullName: String,
  email: String,
  phone: String,
  role: String
}, { timestamps: true });

const Measurement = mongoose.model('Measurement', measurementSchema);
const User = mongoose.model('User', userSchema);

async function checkSpecificMeasurement() {
  try {
    console.log('🔍 开始检查测量数据...\n');
    
    // 检查总体统计
    const totalCount = await Measurement.countDocuments();
    const abnormalCount = await Measurement.countDocuments({ isAbnormal: true });
    const pendingAbnormalCount = await Measurement.countDocuments({ isAbnormal: true, status: 'pending' });
    
    console.log('=== 📊 测量数据统计 ===');
    console.log(`总测量记录数: ${totalCount}`);
    console.log(`异常记录数: ${abnormalCount}`);
    console.log(`待处理异常记录数: ${pendingAbnormalCount}`);
    console.log('');
    
    // 查找您提到的特定记录
    console.log('=== 🎯 查找特定记录 (ID: 68641799340a6d50d55a6922) ===');
    try {
      const specificRecord = await Measurement.findById('68641799340a6d50d55a6922').populate('userId');
      if (specificRecord) {
        console.log('✅ 找到特定记录:');
        console.log(`记录ID: ${specificRecord._id}`);
        console.log(`用户ID: ${specificRecord.userId?._id || specificRecord.userId}`);
        console.log(`用户名: ${specificRecord.userId?.username || '未知'}`);
        console.log(`收缩压: ${specificRecord.systolic}`);
        console.log(`舒张压: ${specificRecord.diastolic}`);
        console.log(`心率: ${specificRecord.heartRate || '无'}`);
        console.log(`体温: ${specificRecord.temperature || '无'}`);
        console.log(`血氧: ${specificRecord.oxygenSaturation || '无'}`);
        console.log(`状态: ${specificRecord.status}`);
        console.log(`是否异常: ${specificRecord.isAbnormal}`);
        console.log(`异常原因: ${specificRecord.abnormalReasons?.join(', ') || '无'}`);
        console.log(`创建时间: ${specificRecord.createdAt}`);
        console.log(`更新时间: ${specificRecord.updatedAt}`);
        console.log(`备注: ${specificRecord.notes || '无'}`);
      } else {
        console.log('❌ 未找到ID为 68641799340a6d50d55a6922 的记录');
      }
    } catch (error) {
      console.log('❌ 查找特定记录时出错:', error.message);
    }
    console.log('');
    
    // 查找最近的异常记录（待处理）
    console.log('=== 🔥 最近的待处理异常记录 ===');
    const recentAbnormal = await Measurement.find({ 
      isAbnormal: true, 
      status: 'pending' 
    })
    .populate('userId', 'username fullName role')
    .sort({ createdAt: -1 })
    .limit(10);
    
    if (recentAbnormal.length === 0) {
      console.log('❌ 没有找到待处理的异常记录！');
    } else {
      console.log(`找到 ${recentAbnormal.length} 条待处理异常记录:`);
      recentAbnormal.forEach((record, index) => {
        console.log(`\n${index + 1}. 记录详情:`);
        console.log(`   ID: ${record._id}`);
        console.log(`   用户: ${record.userId?.username || '未知'} (${record.userId?.fullName || ''})`);
        console.log(`   用户ID: ${record.userId?._id || record.userId}`);
        console.log(`   收缩压/舒张压: ${record.systolic || '无'}/${record.diastolic || '无'}`);
        console.log(`   心率: ${record.heartRate || '无'}`);
        console.log(`   体温: ${record.temperature || '无'}`);
        console.log(`   血氧: ${record.oxygenSaturation || '无'}`);
        console.log(`   状态: ${record.status}`);
        console.log(`   异常: ${record.isAbnormal}`);
        console.log(`   异常原因: ${record.abnormalReasons?.join(', ') || '无'}`);
        console.log(`   创建时间: ${record.createdAt}`);
      });
    }
    console.log('');
    
    // 查找所有异常记录（不限状态）
    console.log('=== 📋 所有异常记录统计 ===');
    const allAbnormal = await Measurement.find({ isAbnormal: true })
      .populate('userId', 'username fullName')
      .sort({ createdAt: -1 });
    
    console.log(`总异常记录数: ${allAbnormal.length}`);
    
    const statusStats = {};
    allAbnormal.forEach(record => {
      statusStats[record.status] = (statusStats[record.status] || 0) + 1;
    });
    
    console.log('按状态分组:');
    Object.entries(statusStats).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} 条`);
    });
    
    // 检查用户ID为 685c3c147e21318b24b0c3a4 的所有记录
    console.log('\n=== 👤 特定用户 (685c3c147e21318b24b0c3a4) 的记录 ===');
    const userMeasurements = await Measurement.find({ 
      userId: '685c3c147e21318b24b0c3a4' 
    })
    .populate('userId', 'username fullName')
    .sort({ createdAt: -1 });
    
    console.log(`该用户总测量记录数: ${userMeasurements.length}`);
    
    if (userMeasurements.length > 0) {
      const userAbnormal = userMeasurements.filter(m => m.isAbnormal);
      const userPending = userMeasurements.filter(m => m.isAbnormal && m.status === 'pending');
      
      console.log(`异常记录数: ${userAbnormal.length}`);
      console.log(`待处理异常记录数: ${userPending.length}`);
      
      if (userPending.length > 0) {
        console.log('\n待处理异常记录:');
        userPending.forEach((record, index) => {
          console.log(`   ${index + 1}. ID: ${record._id}`);
          console.log(`      收缩压/舒张压: ${record.systolic || '无'}/${record.diastolic || '无'}`);
          console.log(`      状态: ${record.status}, 异常: ${record.isAbnormal}`);
          console.log(`      创建时间: ${record.createdAt}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 检查过程中出错:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ 数据库连接已关闭');
  }
}

checkSpecificMeasurement(); 