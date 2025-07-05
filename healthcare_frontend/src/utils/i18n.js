// 國際化系統
class I18n {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'zh-TW'
    this.listeners = []
    this.translations = {
      'zh-TW': {
        // 通用
        'common.loading': '載入中...',
        'common.save': '保存',
        'common.cancel': '取消',
        'common.confirm': '確認',
        'common.delete': '刪除',
        'common.edit': '編輯',
        'common.add': '添加',
        'common.search': '搜索',
        'common.back': '返回',
        'common.next': '下一步',
        'common.previous': '上一步',
        'common.submit': '提交',
        'common.close': '關閉',
        'common.yes': '是',
        'common.no': '否',
        
        // 系統標題
        'app.title': 'Remote Health Care System',
        'app.subtitle': '智能診斷點 遠程醫療服務',
        'app.description': '在辦公大樓、機場、保險公司等場所，患者可獨立進行基本生命體徵測量，並通過遠程醫療平台由專業醫護人員進行評估和診斷。',
        
        // 功能特色
        'features.smart_measurement': '智能測量',
        'features.smart_measurement_desc': '支持血壓、心率、體溫、血氧等多種生命體徵的自動測量和記錄',
        'features.professional_diagnosis': '專業診斷',
        'features.professional_diagnosis_desc': '經驗豐富的醫護人員遠程評估測量結果，提供專業的診斷建議',
        'features.secure_reliable': '安全可靠',
        'features.secure_reliable_desc': '採用先進的數據加密技術，確保患者隱私和醫療數據的安全性',
        
        // 登錄註冊
        'auth.get_started': '開始使用',
        'auth.register_or_login': '註冊或登錄您的帳戶',
        'auth.login': '登錄',
        'auth.register': '註冊',
        'auth.username': '用戶名',
        'auth.password': '密碼',
        'auth.confirm_password': '確認密碼',
        'auth.full_name': '姓名',
        'auth.email': '電子郵箱',
        'auth.phone': '電話號碼',
        'auth.birth_date': '出生日期',
        'auth.gender': '性別',
        'auth.gender.male': '男',
        'auth.gender.female': '女',
        'auth.user_type': '用戶類型',
        'auth.user_type.patient': '患者',
        'auth.user_type.medical_staff': '醫護人員',
        'auth.placeholder.username': '請輸入用戶名',
        'auth.placeholder.password': '請輸入密碼',
        'auth.placeholder.confirm_password': '請再次輸入密碼',
        'auth.placeholder.full_name': '請輸入您的姓名',
        'auth.placeholder.email': '請輸入電子郵箱',
        'dashboard.patient.title': '患者控制台',
        'dashboard.medical_staff.title': '醫護人員控制台',
        'dashboard.tabs.overview': '概覽',
        'dashboard.tabs.new_measurement': '新測量',
        'dashboard.tabs.history': '歷史記錄',
        'dashboard.tabs.diagnoses': '診斷報告',
        'dashboard.tabs.pending': '待處理',
        'dashboard.tabs.patient_mgmt': '患者管理',
        'dashboard.tabs.diagnosis_eval': '診斷評估',
        
        // 統計卡片
        'dashboard.stats.total_diagnoses': '總診斷數',
        'dashboard.stats.pending_patients': '待處理患者',
        'dashboard.stats.follow_up_required': '需要追蹤',
        'dashboard.stats.patients_diagnosed': '診斷患者數',
        'dashboard.stats.total_measurements': '總測量次數',
        'dashboard.stats.abnormal_measurements': '異常測量',
        'dashboard.stats.diagnosis_reports': '診斷報告',
        'dashboard.stats.health_status': '健康狀態',
        
        // 風險等級
        'dashboard.risk.low': '低風險',
        'dashboard.risk.medium': '中風險',
        'dashboard.risk.high': '高風險',
        'dashboard.risk.critical': '緊急',
        
        // 健康狀態
        'dashboard.health.good': '良好',
        'dashboard.health.attention_needed': '需關注',
        
        // 其他內容
        'dashboard.risk_distribution': '風險等級分佈',
        'dashboard.recent_diagnoses': '最近診斷記錄',
        'dashboard.latest_measurements': '最新測量結果',
        'dashboard.no_diagnoses': '暫無診斷記錄',
        'dashboard.recent_30_days': '最近30天的診斷數據統計',
        
        // 患者管理
        'patient.management.title': '患者管理',
        'patient.management.description': '查看和管理患者信息',
        'patient.search_placeholder': '搜索患者姓名或ID...',
        'patient.loading': '載入患者列表中...',
        'patient.no_patients': '暫無患者記錄',
        'patient.id': 'ID',
        'patient.phone': '電話',
        'patient.latest_measurement': '最近測量',
        'patient.measurement_count': '測量次數',
        'patient.view_details': '查看詳情',
        'patient.abnormal': '有異常',
        'patient.default_name_001': '患者001',
        'patient.final_test': '最終測試',
        'patient.user': '用戶',
        
        'auth.no_account': '還沒有賬戶？',
        'auth.have_account': '已有賬戶？',
        'auth.create_account': '創建您的新賬戶',
        'auth.select_gender': '請選擇性別',
        'auth.password_mismatch': '密碼不匹配',
        'auth.register_note1': '請使用真實姓名註冊，以便醫護人員為您提供準確的診斷服務',
        'auth.register_note2': '患者賬戶可以進行健康測量、查看診斷報告和健康追蹤',
        'auth.register_note3': '醫護人員賬戶需要管理員審核後方可使用',
        'auth.username_required': '登錄賬號不能為空',
        'auth.username_format_error': '登錄賬號只能包含英文字母和數字',
        'auth.password_required': '密碼不能為空',
        'auth.password_min_length': '密碼至少需要6個字符',
        'auth.fullname_required': '姓名不能為空',
        'auth.email_required': '電子郵件不能為空',
        'auth.phone_required': '電話號碼不能為空',
        'auth.role_required': '請選擇用戶角色',
        'auth.birthdate_required': '出生日期不能為空',
        'auth.department_required': '科室不能為空',
        'auth.license_required': '執照號碼不能為空',
        'auth.email_format_error': '電子郵件格式不正確',
        'auth.register_failed': '註冊失敗',
        'auth.username_exists': '用戶名已存在',
        'auth.email_exists': '電子郵件已存在',
        'auth.select_user_type': '請選擇用戶角色',
        'auth.placeholder.department': '請輸入科室',
        'auth.placeholder.license_number': '請輸入執照號碼',
        'auth.register_terms': '註冊即表示您同意我們的服務條款和隱私政策',
        
        // 患者控制台
        'patient.dashboard': '患者控制台',
        'patient.overview': '概覽',
        'patient.add_measurement': '新增測量',
        'patient.measurement_history': '測量歷史',
        'patient.diagnosis_reports': '診斷報告',
        'patient.total_measurements': '總測量次數',
        'patient.abnormal_measurements': '異常測量',
        'patient.total_diagnoses': '診斷報告',
        'patient.health_status': '健康狀態',
        'patient.latest_measurements': '最新測量',
        'patient.no_measurements': '暫無測量記錄',
        'patient.no_diagnoses': '暫無診斷報告',
        
        // 測量相關
        'measurement.type': '測量類型',
        'measurement.blood_pressure': '血壓',
        'measurement.heart_rate': '心率',
        'measurement.temperature': '體溫',
        'measurement.oxygen_saturation': '血氧飽和度',
        'measurement.blood_glucose': '血糖',
        'measurement.systolic': '收縮壓',
        'measurement.diastolic': '舒張壓',
        'measurement.rate': '心率',
        'measurement.celsius': '體溫',
        'measurement.percentage': '血氧',
        'measurement.mg_dl': '血糖',
        'measurement.device_id': '設備ID',
        'measurement.location': '測量地點',
        'measurement.notes': '備註',
        'measurement.measured_at': '測量時間',
        'measurement.add_success': '測量記錄已成功添加！',
        'measurement.abnormal': '異常',
        'measurement.normal': '正常',
        
        // 醫護人員控制台
        'medical.dashboard': '醫護人員控制台',
        'medical.overview': '概覽',
        'medical.pending': '待處理',
        'medical.patient_management': '患者管理',
        'medical.diagnosis_evaluation': '診斷評估',
        'medical.total_diagnoses': '總診斷數',
        'medical.pending_patients': '待處理患者',
        'medical.follow_up_required': '需要追蹤',
        'medical.diagnosed_patients': '診斷患者數',
        'medical.risk_distribution': '風險等級分佈',
        'medical.risk_distribution_desc': '最近30天的診斷風險等級統計',
        'medical.recent_diagnoses': '最近診斷記錄',
        'medical.recent_diagnoses_desc': '您最近完成的診斷評估',
        'medical.no_diagnoses': '暫無診斷記錄',
        'medical.no_pending': '太好了！目前沒有待處理的患者。',
        'medical.pending_desc': '有異常測量數據但尚未診斷的患者列表',
        'medical.diagnose_now': '立即診斷',
        
        // 風險等級
        'risk.low': '低風險',
        'risk.medium': '中風險',
        'risk.high': '高風險',
        'risk.critical': '緊急',
        
        // 診斷相關
        'diagnosis.create_for': '為 {name} 創建診斷記錄',
        'diagnosis.patient_id': '患者ID',
        'diagnosis.related_measurements': '相關測量記錄',
        'diagnosis.related_measurements_desc': '選擇與此次診斷相關的測量記錄',
        'diagnosis.no_measurements': '暫無測量記錄',
        'diagnosis.conclusion': '診斷結論',
        'diagnosis.conclusion_required': '診斷結論 *',
        'diagnosis.conclusion_placeholder': '請輸入詳細的診斷結論...',
        'diagnosis.risk_level': '風險等級',
        'diagnosis.recommendations': '建議措施',
        'diagnosis.recommendations_selected': '已選建議：',
        'diagnosis.custom_recommendation': '添加自定義建議...',
        'diagnosis.follow_up_required': '需要後續追蹤',
        'diagnosis.follow_up_date': '追蹤日期',
        'diagnosis.save': '保存診斷記錄',
        'diagnosis.saving': '保存中...',
        'diagnosis.save_success': '診斷記錄已成功保存！',
        'diagnosis.save_error': '保存診斷記錄時發生錯誤，請重試',
        
        // 建議措施
        'recommendation.monitor_bp': '定期監測血壓',
        'recommendation.exercise': '保持適量運動',
        'recommendation.diet': '注意飲食均衡',
        'recommendation.reduce_salt': '減少鹽分攝入',
        'recommendation.quit_smoking': '戒煙限酒',
        'recommendation.sleep': '保持充足睡眠',
        'recommendation.regular_checkup': '定期複查',
        'recommendation.seek_medical': '及時就醫',
        'recommendation.medication': '服用處方藥物',
        'recommendation.monitor_glucose': '監測血糖',
        
        // 患者管理
        'patient.management': '患者管理',
        'patient.management_desc': '查看和管理患者信息',
        'patient.search_placeholder': '搜索患者姓名或ID...',
        'patient.no_patients': '暫無患者記錄',
        'patient.no_search_results': '未找到匹配的患者',
        'patient.view_details': '查看詳情',
        'patient.latest_measurement': '最近測量',
        'patient.has_abnormal': '有異常',
        'patient.loading': '載入患者列表中...',
        
        // 健康狀態
        'health.excellent': '優秀',
        'health.good': '良好',
        'health.fair': '一般',
        'health.poor': '需要關注',
        
        // 語言切換
        'language.switch': '語言',
        'language.zh-TW': '繁體中文',
        'language.zh-CN': '简体中文',
        'language.en': 'English',
        
        // 測試賬戶
        'test.accounts': '測試賬戶',
        'test.patient_account': '患者賬戶',
        'test.medical_account': '醫護人員賬戶',
        'test.username': '用戶名',
        'test.password': '密碼'
      },
      
      'zh-CN': {
        // 通用
        'common.loading': '加载中...',
        'common.save': '保存',
        'common.cancel': '取消',
        'common.confirm': '确认',
        'common.delete': '删除',
        'common.edit': '编辑',
        'common.add': '添加',
        'common.search': '搜索',
        'common.back': '返回',
        'common.next': '下一步',
        'common.previous': '上一步',
        'common.submit': '提交',
        'common.close': '关闭',
        'common.yes': '是',
        'common.no': '否',
        
        // 系统标题
        'app.title': 'Remote Health Care System',
        'app.subtitle': '智能诊断点 远程医疗服务',
        'app.description': '在办公大楼、机场、保险公司等场所，患者可独立进行基本生命体征测量，并通过远程医疗平台由专业医护人员进行评估和诊断。',
        
        // 功能特色
        'features.smart_measurement': '智能测量',
        'features.smart_measurement_desc': '支持血压、心率、体温、血氧等多种生命体征的自动测量和记录',
        'features.professional_diagnosis': '专业诊断',
        'features.professional_diagnosis_desc': '经验丰富的医护人员远程评估测量结果，提供专业的诊断建议',
        'features.secure_reliable': '安全可靠',
        'features.secure_reliable_desc': '采用先进的数据加密技术，确保患者隐私和医疗数据的安全性',
        
        // 登录注册
        'auth.get_started': '开始使用',
        'auth.register_or_login': '注册或登录您的账户',
        'auth.login': '登录',
        'auth.register': '注册',
        'auth.username': '用户名',
        'auth.password': '密码',
        'auth.confirm_password': '确认密码',
        'auth.full_name': '姓名',
        'auth.email': '电子邮箱',
        'auth.phone': '电话号码',
        'auth.birth_date': '出生日期',
        'auth.gender': '性别',
        'auth.gender.male': '男',
        'auth.gender.female': '女',
        'auth.user_type': '用户类型',
        'auth.user_type.patient': '患者',
        'auth.user_type.medical_staff': '医护人员',
        'auth.placeholder.username': '请输入用户名',
        'auth.placeholder.password': '请输入密码',
        'auth.placeholder.confirm_password': '请再次输入密码',
        'auth.placeholder.full_name': '请输入您的姓名',
        'auth.placeholder.email': '请输入电子邮箱',
        
        // 患者管理
        'patient.management.title': '患者管理',
        'patient.management.description': '查看和管理患者信息',
        'patient.search_placeholder': '搜索患者姓名或ID...',
        'patient.loading': '载入患者列表中...',
        'patient.no_patients': '暂无患者记录',
        'patient.id': 'ID',
        'patient.phone': '电话',
        'patient.latest_measurement': '最近测量',
        'patient.measurement_count': '测量次数',
        'patient.view_details': '查看详情',
        'patient.abnormal': '有异常',
        'patient.default_name_001': '患者001',
        'patient.final_test': '最终测试',
        'patient.user': '用户',
        
        'dashboard.patient.title': '患者控制台',
        'dashboard.medical_staff.title': '醫護人員控制台',
        'dashboard.tabs.overview': '概覽',
        'dashboard.tabs.new_measurement': '新測量',
        'dashboard.tabs.history': '歷史記錄',
        'dashboard.tabs.diagnoses': '診斷報告',
        'dashboard.tabs.pending': '待處理',
        'dashboard.tabs.patient_mgmt': '患者管理',
        'dashboard.tabs.diagnosis_eval': '诊断评估',
        
        // 统计卡片
        'dashboard.stats.total_diagnoses': '总诊断数',
        'dashboard.stats.pending_patients': '待处理患者',
        'dashboard.stats.follow_up_required': '需要追踪',
        'dashboard.stats.patients_diagnosed': '诊断患者数',
        'dashboard.stats.total_measurements': '总测量次数',
        'dashboard.stats.abnormal_measurements': '异常测量',
        'dashboard.stats.diagnosis_reports': '诊断报告',
        'dashboard.stats.health_status': '健康状态',
        
        // 风险等级
        'dashboard.risk.low': '低风险',
        'dashboard.risk.medium': '中风险',
        'dashboard.risk.high': '高风险',
        'dashboard.risk.critical': '紧急',
        
        // 健康状态
        'dashboard.health.good': '良好',
        'dashboard.health.attention_needed': '需关注',
        
        // 其他内容
        'dashboard.risk_distribution': '风险等级分布',
        'dashboard.recent_diagnoses': '最近诊断记录',
        'dashboard.latest_measurements': '最新测量结果',
        'dashboard.no_diagnoses': '暂无诊断记录',
        'dashboard.recent_30_days': '最近30天的诊断数据统计',
        
        'auth.placeholder.phone': '请输入电话号码',
        'auth.register_success': '注册成功！请使用您的账户登录',
        'auth.login_failed': '用户名不存在',
        'auth.logout': '登出',
        'auth.no_account': '还没有账户？',
        'auth.have_account': '已有账户？',
        'auth.create_account': '创建您的新账户',
        'auth.select_gender': '请选择性别',
        'auth.password_mismatch': '密码不匹配',
        'auth.register_note1': '请使用真实姓名注册，以便医护人员为您提供准确的诊断服务',
        'auth.register_note2': '患者账户可以进行健康测量、查看诊断报告和健康追踪',
        'auth.register_note3': '医护人员账户需要管理员审核后方可使用',
        'auth.username_required': '登录账号不能为空',
        'auth.username_format_error': '登录账号只能包含英文字母和数字',
        'auth.password_required': '密码不能为空',
        'auth.password_min_length': '密码至少需要6个字符',
        'auth.fullname_required': '姓名不能为空',
        'auth.email_required': '电子邮件不能为空',
        'auth.phone_required': '电话号码不能为空',
        'auth.role_required': '请选择用户角色',
        'auth.birthdate_required': '出生日期不能为空',
        'auth.department_required': '科室不能为空',
        'auth.license_required': '执照号码不能为空',
        'auth.email_format_error': '电子邮件格式不正确',
        'auth.register_failed': '注册失败',
        'auth.username_exists': '用户名已存在',
        'auth.email_exists': '电子邮件已存在',
        'auth.select_user_type': '请选择用户角色',
        'auth.placeholder.department': '请输入科室',
        'auth.placeholder.license_number': '请输入执照号码',
        'auth.register_terms': '注册即表示您同意我们的服务条款和隐私政策',
        
        // 患者控制台
        'patient.dashboard': '患者控制台',
        'patient.overview': '概览',
        'patient.add_measurement': '新增测量',
        'patient.measurement_history': '测量历史',
        'patient.diagnosis_reports': '诊断报告',
        'patient.total_measurements': '总测量次数',
        'patient.abnormal_measurements': '异常测量',
        'patient.total_diagnoses': '诊断报告',
        'patient.health_status': '健康状态',
        'patient.latest_measurements': '最新测量',
        'patient.no_measurements': '暂无测量记录',
        'patient.no_diagnoses': '暂无诊断报告',
        
        // 测量相关
        'measurement.type': '测量类型',
        'measurement.blood_pressure': '血压',
        'measurement.heart_rate': '心率',
        'measurement.temperature': '体温',
        'measurement.oxygen_saturation': '血氧饱和度',
        'measurement.blood_glucose': '血糖',
        'measurement.systolic': '收缩压',
        'measurement.diastolic': '舒张压',
        'measurement.rate': '心率',
        'measurement.celsius': '体温',
        'measurement.percentage': '血氧',
        'measurement.mg_dl': '血糖',
        'measurement.device_id': '设备ID',
        'measurement.location': '测量地点',
        'measurement.notes': '备注',
        'measurement.measured_at': '测量时间',
        'measurement.add_success': '测量记录已成功添加！',
        'measurement.abnormal': '异常',
        'measurement.normal': '正常',
        
        // 医护人员控制台
        'medical.dashboard': '医护人员控制台',
        'medical.overview': '概览',
        'medical.pending': '待处理',
        'medical.patient_management': '患者管理',
        'medical.diagnosis_evaluation': '诊断评估',
        'medical.total_diagnoses': '总诊断数',
        'medical.pending_patients': '待处理患者',
        'medical.follow_up_required': '需要追踪',
        'medical.diagnosed_patients': '诊断患者数',
        'medical.risk_distribution': '风险等级分布',
        'medical.risk_distribution_desc': '最近30天的诊断风险等级统计',
        'medical.recent_diagnoses': '最近诊断记录',
        'medical.recent_diagnoses_desc': '您最近完成的诊断评估',
        'medical.no_diagnoses': '暂无诊断记录',
        'medical.no_pending': '太好了！目前没有待处理的患者。',
        'medical.pending_desc': '有异常测量数据但尚未诊断的患者列表',
        'medical.diagnose_now': '立即诊断',
        
        // 风险等级
        'risk.low': '低风险',
        'risk.medium': '中风险',
        'risk.high': '高风险',
        'risk.critical': '紧急',
        
        // 诊断相关
        'diagnosis.create_for': '为 {name} 创建诊断记录',
        'diagnosis.patient_id': '患者ID',
        'diagnosis.related_measurements': '相关测量记录',
        'diagnosis.related_measurements_desc': '选择与此次诊断相关的测量记录',
        'diagnosis.no_measurements': '暂无测量记录',
        'diagnosis.conclusion': '诊断结论',
        'diagnosis.conclusion_required': '诊断结论 *',
        'diagnosis.conclusion_placeholder': '请输入详细的诊断结论...',
        'diagnosis.risk_level': '风险等级',
        'diagnosis.recommendations': '建议措施',
        'diagnosis.recommendations_selected': '已选建议：',
        'diagnosis.custom_recommendation': '添加自定义建议...',
        'diagnosis.follow_up_required': '需要后续追踪',
        'diagnosis.follow_up_date': '追踪日期',
        'diagnosis.save': '保存诊断记录',
        'diagnosis.saving': '保存中...',
        'diagnosis.save_success': '诊断记录已成功保存！',
        'diagnosis.save_error': '保存诊断记录时发生错误，请重试',
        
        // 建议措施
        'recommendation.monitor_bp': '定期监测血压',
        'recommendation.exercise': '保持适量运动',
        'recommendation.diet': '注意饮食均衡',
        'recommendation.reduce_salt': '减少盐分摄入',
        'recommendation.quit_smoking': '戒烟限酒',
        'recommendation.sleep': '保持充足睡眠',
        'recommendation.regular_checkup': '定期复查',
        'recommendation.seek_medical': '及时就医',
        'recommendation.medication': '服用处方药物',
        'recommendation.monitor_glucose': '监测血糖',
        
        // 患者管理
        'patient.management': '患者管理',
        'patient.management_desc': '查看和管理患者信息',
        'patient.search_placeholder': '搜索患者姓名或ID...',
        'patient.no_patients': '暂无患者记录',
        'patient.no_search_results': '未找到匹配的患者',
        'patient.view_details': '查看详情',
        'patient.latest_measurement': '最近测量',
        'patient.has_abnormal': '有异常',
        'patient.loading': '加载患者列表中...',
        
        // 健康状态
        'health.excellent': '优秀',
        'health.good': '良好',
        'health.fair': '一般',
        'health.poor': '需要关注',
        
        // 语言切换
        'language.switch': '语言',
        'language.zh-TW': '繁體中文',
        'language.zh-CN': '简体中文',
        'language.en': 'English',
        
        // 测试账户
        'test.accounts': '测试账户',
        'test.patient_account': '患者账户',
        'test.medical_account': '医护人员账户',
        'test.username': '用户名',
        'test.password': '密码'
      },
      
      'en': {
        // Common
        'common.loading': 'Loading...',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.confirm': 'Confirm',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.add': 'Add',
        'common.search': 'Search',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.previous': 'Previous',
        'common.submit': 'Submit',
        'common.close': 'Close',
        'common.yes': 'Yes',
        'common.no': 'No',
        
        // App Title
        'app.title': 'Remote Health Care System',
        'app.subtitle': 'Smart Diagnostic Points Remote Healthcare Services',
        'app.description': 'At office buildings, airports, insurance companies and other locations, patients can independently measure basic vital signs and receive professional evaluation and diagnosis from healthcare professionals through the telemedicine platform.',
        
        // Features
        'features.smart_measurement': 'Smart Measurement',
        'features.smart_measurement_desc': 'Supports automatic measurement and recording of various vital signs including blood pressure, heart rate, temperature, and blood oxygen',
        'features.professional_diagnosis': 'Professional Diagnosis',
        'features.professional_diagnosis_desc': 'Experienced healthcare professionals remotely evaluate measurement results and provide professional diagnostic recommendations',
        'features.secure_reliable': 'Secure & Reliable',
        'features.secure_reliable_desc': 'Uses advanced data encryption technology to ensure patient privacy and medical data security',
        
        // Authentication
        'auth.get_started': 'Get Started',
        'auth.register_or_login': 'Register or login to your account',
        'auth.login': 'Login',
        'auth.register': 'Register',
        'auth.username': 'Username',
        'auth.password': 'Password',
        'auth.confirm_password': 'Confirm Password',
        'auth.full_name': 'Full Name',
        'auth.email': 'Email',
        'auth.phone': 'Phone Number',
        'auth.birth_date': 'Birth Date',
        'auth.gender': 'Gender',
        'auth.gender.male': 'Male',
        'auth.gender.female': 'Female',
        'auth.user_type': 'User Type',
        'auth.user_type.patient': 'Patient',
        'auth.user_type.medical_staff': 'Medical Staff',
        'auth.placeholder.username': 'Enter username',
        'auth.placeholder.password': 'Enter password',
        'auth.placeholder.confirm_password': 'Confirm your password',
        'auth.placeholder.full_name': 'Enter your full name',
        'auth.placeholder.email': 'Enter email address',
        'dashboard.patient.title': 'Patient Dashboard',
        'dashboard.medical_staff.title': 'Medical Staff Dashboard',
        'dashboard.tabs.overview': 'Overview',
        'dashboard.tabs.new_measurement': 'New Measurement',
        'dashboard.tabs.history': 'History',
        'dashboard.tabs.diagnoses': 'Diagnoses',
        'dashboard.tabs.pending': 'Pending',
        'dashboard.tabs.patient_mgmt': 'Patients',
        'dashboard.tabs.diagnosis_eval': 'Diagnosis',
        
        // Statistics Cards
        'dashboard.stats.total_diagnoses': 'Total Diagnoses',
        'dashboard.stats.pending_patients': 'Pending Patients',
        'dashboard.stats.follow_up_required': 'Follow-up Required',
        'dashboard.stats.patients_diagnosed': 'Patients Diagnosed',
        'dashboard.stats.total_measurements': 'Total Measurements',
        'dashboard.stats.abnormal_measurements': 'Abnormal Measurements',
        'dashboard.stats.diagnosis_reports': 'Diagnosis Reports',
        'dashboard.stats.health_status': 'Health Status',
        
        // Risk Levels
        'dashboard.risk.low': 'Low Risk',
        'dashboard.risk.medium': 'Medium Risk',
        'dashboard.risk.high': 'High Risk',
        'dashboard.risk.critical': 'Critical',
        
        // Health Status
        'dashboard.health.good': 'Good',
        'dashboard.health.attention_needed': 'Attention Needed',
        
        // Other Content
        'dashboard.risk_distribution': 'Risk Level Distribution',
        'dashboard.recent_diagnoses': 'Recent Diagnoses',
        'dashboard.latest_measurements': 'Latest Measurements',
        'dashboard.no_diagnoses': 'No diagnosis records',
        'dashboard.recent_30_days': 'Diagnosis statistics for the last 30 days',
        
        'auth.placeholder.phone': 'Enter phone number',
        'auth.register_success': 'Registration successful! Please login with your account',
        'auth.login_failed': 'Username does not exist',
        'auth.logout': 'Logout',
        'auth.no_account': "Don't have an account?",
        'auth.have_account': 'Already have an account?',
        'auth.create_account': 'Create your new account',
        'auth.select_gender': 'Select gender',
        'auth.password_mismatch': 'Passwords do not match',
        'auth.register_note1': 'Please use your real name to register so that healthcare professionals can provide you with accurate diagnostic services',
        'auth.register_note2': 'Patient accounts can perform health measurements, view diagnostic reports and health tracking',
        'auth.register_note3': 'Medical staff accounts require administrator approval before use',
        'auth.username_required': 'Username cannot be empty',
        'auth.username_format_error': 'Username can only contain letters and numbers',
        'auth.password_required': 'Password cannot be empty',
        'auth.password_min_length': 'Password must be at least 6 characters',
        'auth.fullname_required': 'Full name cannot be empty',
        'auth.email_required': 'Email cannot be empty',
        'auth.phone_required': 'Phone number cannot be empty',
        'auth.role_required': 'Please select user role',
        'auth.birthdate_required': 'Birth date cannot be empty',
        'auth.department_required': 'Department cannot be empty',
        'auth.license_required': 'License number cannot be empty',
        'auth.email_format_error': 'Email format is incorrect',
        'auth.register_failed': 'Registration failed',
        'auth.username_exists': 'Username already exists',
        'auth.email_exists': 'Email already exists',
        'auth.select_user_type': 'Please select user type',
        'auth.placeholder.department': 'Enter department',
        'auth.placeholder.license_number': 'Enter license number',
        'auth.register_terms': 'By registering, you agree to our Terms of Service and Privacy Policy',
        
        // Patient Management
        'patient.management.title': 'Patient Management',
        'patient.management.description': 'View and manage patient information',
        'patient.search_placeholder': 'Search patient name or ID...',
        'patient.loading': 'Loading patient list...',
        'patient.no_patients': 'No patient records',
        'patient.id': 'ID',
        'patient.phone': 'Phone',
        'patient.latest_measurement': 'Latest Measurement',
        'patient.measurement_count': 'Measurement Count',
        'patient.view_details': 'View Details',
        'patient.abnormal': 'Abnormal',
        'patient.default_name_001': 'Patient 001',
        'patient.final_test': 'Final Test',
        'patient.user': 'User',
        
        // Patient Dashboard
        'patient.dashboard': 'Patient Dashboard',
        'patient.overview': 'Overview',
        'patient.add_measurement': 'Add Measurement',
        'patient.measurement_history': 'Measurement History',
        'patient.diagnosis_reports': 'Diagnosis Reports',
        'patient.total_measurements': 'Total Measurements',
        'patient.abnormal_measurements': 'Abnormal Measurements',
        'patient.total_diagnoses': 'Diagnosis Reports',
        'patient.health_status': 'Health Status',
        'patient.latest_measurements': 'Latest Measurements',
        'patient.no_measurements': 'No measurement records',
        'patient.no_diagnoses': 'No diagnosis reports',
        
        // Measurements
        'measurement.type': 'Measurement Type',
        'measurement.blood_pressure': 'Blood Pressure',
        'measurement.heart_rate': 'Heart Rate',
        'measurement.temperature': 'Temperature',
        'measurement.oxygen_saturation': 'Oxygen Saturation',
        'measurement.blood_glucose': 'Blood Glucose',
        'measurement.systolic': 'Systolic',
        'measurement.diastolic': 'Diastolic',
        'measurement.rate': 'Rate',
        'measurement.celsius': 'Temperature',
        'measurement.percentage': 'Oxygen',
        'measurement.mg_dl': 'Glucose',
        'measurement.device_id': 'Device ID',
        'measurement.location': 'Location',
        'measurement.notes': 'Notes',
        'measurement.measured_at': 'Measured At',
        'measurement.add_success': 'Measurement record added successfully!',
        'measurement.abnormal': 'Abnormal',
        'measurement.normal': 'Normal',
        
        // Medical Staff Dashboard
        'medical.dashboard': 'Medical Staff Dashboard',
        'medical.overview': 'Overview',
        'medical.pending': 'Pending',
        'medical.patient_management': 'Patient Management',
        'medical.diagnosis_evaluation': 'Diagnosis Evaluation',
        'medical.total_diagnoses': 'Total Diagnoses',
        'medical.pending_patients': 'Pending Patients',
        'medical.follow_up_required': 'Follow-up Required',
        'medical.diagnosed_patients': 'Diagnosed Patients',
        'medical.risk_distribution': 'Risk Level Distribution',
        'medical.risk_distribution_desc': 'Diagnosis risk level statistics for the last 30 days',
        'medical.recent_diagnoses': 'Recent Diagnoses',
        'medical.recent_diagnoses_desc': 'Your recently completed diagnostic evaluations',
        'medical.no_diagnoses': 'No diagnosis records',
        'medical.no_pending': 'Great! No pending patients at the moment.',
        'medical.pending_desc': 'List of patients with abnormal measurements but no diagnosis yet',
        'medical.diagnose_now': 'Diagnose Now',
        
        // Risk Levels
        'risk.low': 'Low Risk',
        'risk.medium': 'Medium Risk',
        'risk.high': 'High Risk',
        'risk.critical': 'Critical',
        
        // Diagnosis
        'diagnosis.create_for': 'Create Diagnosis Record for {name}',
        'diagnosis.patient_id': 'Patient ID',
        'diagnosis.related_measurements': 'Related Measurements',
        'diagnosis.related_measurements_desc': 'Select measurements related to this diagnosis',
        'diagnosis.no_measurements': 'No measurement records',
        'diagnosis.conclusion': 'Diagnosis Conclusion',
        'diagnosis.conclusion_required': 'Diagnosis Conclusion *',
        'diagnosis.conclusion_placeholder': 'Enter detailed diagnosis conclusion...',
        'diagnosis.risk_level': 'Risk Level',
        'diagnosis.recommendations': 'Recommendations',
        'diagnosis.recommendations_selected': 'Selected Recommendations:',
        'diagnosis.custom_recommendation': 'Add custom recommendation...',
        'diagnosis.follow_up_required': 'Follow-up Required',
        'diagnosis.follow_up_date': 'Follow-up Date',
        'diagnosis.save': 'Save Diagnosis Record',
        'diagnosis.saving': 'Saving...',
        'diagnosis.save_success': 'Diagnosis record saved successfully!',
        'diagnosis.save_error': 'Error saving diagnosis record, please try again',
        
        // Recommendations
        'recommendation.monitor_bp': 'Monitor Blood Pressure Regularly',
        'recommendation.exercise': 'Maintain Moderate Exercise',
        'recommendation.diet': 'Maintain Balanced Diet',
        'recommendation.reduce_salt': 'Reduce Salt Intake',
        'recommendation.quit_smoking': 'Quit Smoking and Limit Alcohol',
        'recommendation.sleep': 'Maintain Adequate Sleep',
        'recommendation.regular_checkup': 'Regular Check-ups',
        'recommendation.seek_medical': 'Seek Medical Attention',
        'recommendation.medication': 'Take Prescribed Medication',
        'recommendation.monitor_glucose': 'Monitor Blood Glucose',
        
        // Patient Management
        'patient.management': 'Patient Management',
        'patient.management_desc': 'View and manage patient information',
        'patient.search_placeholder': 'Search patient name or ID...',
        'patient.no_patients': 'No patient records',
        'patient.no_search_results': 'No matching patients found',
        'patient.view_details': 'View Details',
        'patient.latest_measurement': 'Latest Measurement',
        'patient.has_abnormal': 'Has Abnormal',
        'patient.loading': 'Loading patient list...',
        
        // Health Status
        'health.excellent': 'Excellent',
        'health.good': 'Good',
        'health.fair': 'Fair',
        'health.poor': 'Needs Attention',
        
        // Language Switch
        'language.switch': 'Language',
        'language.zh-TW': '繁體中文',
        'language.zh-CN': '简体中文',
        'language.en': 'English',
        
        // Test Accounts
        'test.accounts': 'Test Accounts',
        'test.patient_account': 'Patient Account',
        'test.medical_account': 'Medical Staff Account',
        'test.username': 'Username',
        'test.password': 'Password'
      }
    }
  }

  // 獲取翻譯文本
  t(key, params = {}) {
    const translation = this.translations[this.currentLanguage]?.[key] || key
    
    // 處理參數替換
    return translation.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] || match
    })
  }

  // 切換語言
  setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language
      localStorage.setItem('language', language)
      this.notifyListeners()
    }
  }

  // 獲取當前語言
  getCurrentLanguage() {
    return this.currentLanguage
  }

  // 獲取可用語言列表
  getAvailableLanguages() {
    return [
      { code: 'zh-TW', name: '繁體中文' },
      { code: 'zh-CN', name: '简体中文' },
      { code: 'en', name: 'English' }
    ]
  }

  // 添加語言變更監聽器
  addListener(callback) {
    this.listeners.push(callback)
  }

  // 移除語言變更監聽器
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback)
  }

  // 通知所有監聽器
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentLanguage))
  }
}

// 創建全局實例
const i18n = new I18n()

export default i18n

