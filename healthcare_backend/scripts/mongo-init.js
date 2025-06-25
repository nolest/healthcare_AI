// MongoDB Docker 容器初始化脚本
// 这个脚本会在 MongoDB 容器首次启动时执行

print('🏥 初始化医疗 AI 项目数据库...');

// 切换到目标数据库
db = db.getSiblingDB('healthcare_local');

// 创建用户集合并添加索引
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });

// 创建测量数据集合并添加索引
db.measurements.createIndex({ "userId": 1 });
db.measurements.createIndex({ "createdAt": -1 });
db.measurements.createIndex({ "status": 1 });
db.measurements.createIndex({ "isAbnormal": 1 });

// 创建诊断集合并添加索引
db.diagnoses.createIndex({ "patientId": 1 });
db.diagnoses.createIndex({ "doctorId": 1 });
db.diagnoses.createIndex({ "measurementId": 1 });
db.diagnoses.createIndex({ "createdAt": -1 });
db.diagnoses.createIndex({ "status": 1 });

// 创建 COVID 评估集合并添加索引
db.covidassessments.createIndex({ "userId": 1 });
db.covidassessments.createIndex({ "riskLevel": 1 });
db.covidassessments.createIndex({ "createdAt": -1 });

// 创建医疗记录集合并添加索引
db.medical_records.createIndex({ "patientId": 1 });
db.medical_records.createIndex({ "doctorId": 1 });
db.medical_records.createIndex({ "recordType": 1 });
db.medical_records.createIndex({ "createdAt": -1 });

// 创建处方集合并添加索引
db.prescriptions.createIndex({ "patientId": 1 });
db.prescriptions.createIndex({ "doctorId": 1 });
db.prescriptions.createIndex({ "diagnosisId": 1 });
db.prescriptions.createIndex({ "status": 1 });

// 创建预约集合并添加索引
db.appointments.createIndex({ "patientId": 1 });
db.appointments.createIndex({ "doctorId": 1 });
db.appointments.createIndex({ "appointmentDate": 1 });
db.appointments.createIndex({ "status": 1 });

print('✅ 数据库索引创建完成');
print('💡 提示: 启动应用后运行数据库初始化脚本创建默认用户'); 