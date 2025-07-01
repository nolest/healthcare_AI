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

const Measurement = mongoose.model('Measurement', measurementSchema);

async function fixMeasurementRecord() {
  try {
    console.log('🔧 开始修复测量记录...\n');
    
    // 查找特定记录
    const recordId = '68641799340a6d50d55a6922';
    const record = await Measurement.findById(recordId);
    
    if (!record) {
      console.log(`❌ 未找到ID为 ${recordId} 的记录`);
      return;
    }
    
    console.log('📋 当前记录状态:');
    console.log(`   ID: ${record._id}`);
    console.log(`   用户ID: ${record.userId}`);
    console.log(`   收缩压: ${record.systolic}`);
    console.log(`   舒张压: ${record.diastolic}`);
    console.log(`   状态: ${record.status}`);
    console.log(`   异常: ${record.isAbnormal}`);
    console.log(`   异常原因: ${record.abnormalReasons?.join(', ') || '无'}`);
    
    // 检查是否需要修复
    let needsUpdate = false;
    const updates = {};
    const abnormalReasons = [];
    
    // 检查收缩压异常
    if (record.systolic && (record.systolic < 90 || record.systolic > 140)) {
      needsUpdate = true;
      if (record.systolic < 90) {
        abnormalReasons.push(`收缩压过低 (${record.systolic} < 90)`);
      } else {
        abnormalReasons.push(`收缩压过高 (${record.systolic} > 140)`);
      }
    }
    
    // 检查舒张压异常
    if (record.diastolic && (record.diastolic < 60 || record.diastolic > 90)) {
      needsUpdate = true;
      if (record.diastolic < 60) {
        abnormalReasons.push(`舒张压过低 (${record.diastolic} < 60)`);
      } else {
        abnormalReasons.push(`舒张压过高 (${record.diastolic} > 90)`);
      }
    }
    
    if (needsUpdate) {
      updates.isAbnormal = true;
      updates.abnormalReasons = abnormalReasons;
      
      // 确保状态为pending
      if (record.status !== 'pending') {
        updates.status = 'pending';
      }
      
      console.log('\n🔧 需要更新的字段:');
      console.log(`   isAbnormal: ${record.isAbnormal} → ${updates.isAbnormal}`);
      console.log(`   abnormalReasons: [${record.abnormalReasons?.join(', ') || '无'}] → [${updates.abnormalReasons.join(', ')}]`);
      if (updates.status) {
        console.log(`   status: ${record.status} → ${updates.status}`);
      }
      
      // 执行更新
      const updatedRecord = await Measurement.findByIdAndUpdate(
        recordId,
        updates,
        { new: true }
      );
      
      console.log('\n✅ 记录已成功更新!');
      console.log('📋 更新后的记录状态:');
      console.log(`   异常: ${updatedRecord.isAbnormal}`);
      console.log(`   异常原因: ${updatedRecord.abnormalReasons.join(', ')}`);
      console.log(`   状态: ${updatedRecord.status}`);
      
    } else {
      console.log('\n✅ 记录已经是正确的异常状态，无需更新');
    }
    
    // 验证修复结果
    console.log('\n🔍 验证修复结果...');
    const abnormalCount = await Measurement.countDocuments({ 
      isAbnormal: true, 
      status: 'pending' 
    });
    console.log(`当前待处理异常记录数: ${abnormalCount}`);
    
    // 查找该用户的所有待处理异常记录
    const userAbnormalRecords = await Measurement.find({
      userId: record.userId,
      isAbnormal: true,
      status: 'pending'
    });
    
    console.log(`用户 ${record.userId} 的待处理异常记录数: ${userAbnormalRecords.length}`);
    
    if (userAbnormalRecords.length > 0) {
      console.log('该用户的待处理异常记录:');
      userAbnormalRecords.forEach((r, index) => {
        console.log(`   ${index + 1}. ID: ${r._id}, 收缩压: ${r.systolic}, 舒张压: ${r.diastolic}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ 数据库连接已关闭');
  }
}

fixMeasurementRecord(); 