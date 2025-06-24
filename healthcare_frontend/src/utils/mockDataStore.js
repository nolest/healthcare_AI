// 全局數據存儲管理 - 完全重構版本
class MockDataStore {
  constructor() {
    // 初始化數據結構
    this.data = {
      users: [],
      measurements: [],
      diagnoses: [],
      covidAssessments: []
    }
    this.listeners = []
    
    // 統一的localStorage鍵值
    this.storageKeys = {
      users: 'healthcare_users',
      measurements: 'healthcare_measurements', 
      diagnoses: 'healthcare_diagnoses',
      covidAssessments: 'healthcare_covid_assessments'
    }
    
    // 先加載數據，再初始化示例數據
    this.loadFromLocalStorage()
    this.initializeSampleData()
    
    console.log('MockDataStore initialized with data:', {
      users: this.data.users.length,
      measurements: this.data.measurements.length,
      diagnoses: this.data.diagnoses.length,
      covidAssessments: this.data.covidAssessments.length
    })
  }

  // 從localStorage加載所有數據
  loadFromLocalStorage() {
    try {
      Object.keys(this.storageKeys).forEach(key => {
        const stored = localStorage.getItem(this.storageKeys[key])
        if (stored) {
          this.data[key] = JSON.parse(stored)
        }
      })
      
      // 为没有status字段的测量记录添加默认状态
      this.data.measurements.forEach(measurement => {
        if (!measurement.status) {
          measurement.status = 'pending'
        }
      })
      
      console.log('Data loaded from localStorage:', {
        users: this.data.users.length,
        measurements: this.data.measurements.length,
        diagnoses: this.data.diagnoses.length,
        covidAssessments: this.data.covidAssessments.length
      })
    } catch (error) {
      console.error('Error loading data from localStorage:', error)
      // 如果加載失敗，重置數據
      this.data = {
        users: [],
        measurements: [],
        diagnoses: [],
        covidAssessments: []
      }
    }
  }

  // 保存所有數據到localStorage
  saveToLocalStorage() {
    try {
      Object.keys(this.storageKeys).forEach(key => {
        localStorage.setItem(this.storageKeys[key], JSON.stringify(this.data[key]))
      })
      console.log('Data saved to localStorage successfully')
    } catch (error) {
      console.error('Error saving data to localStorage:', error)
    }
  }

  // 初始化示例數據
  initializeSampleData() {
    // 只有在沒有現有數據時才初始化
    if (this.data.users.length === 0) {
      this.data.users = [
        // 患者用戶
        // {
        //   id: 1001,
        //   username: 'patient001',
        //   password: 'password123',
        //   fullName: '張小明',
        //   email: 'zhang@example.com',
        //   role: 'patient',
        //   phone: '0900-000-001',
        //   birthDate: '1990-01-01',
        //   gender: 'male',
        //   created_at: new Date().toISOString()
        // },
        {
          birthDate: "2005-06-08",
          created_at: "2025-06-23T14:20:51.717Z",
          email: "p001@gmail.com",
          fullName: "患者001",
          gender: "male",
          id : 1750688451717,
          password: "123456",
          phone: "123456789",
          role: "patient",
          username: "p001"
        },
        // 醫護人員用戶
        {
          id: 2001,
          username: 'doctor001',
          password: 'password123',
          fullName: '陳醫師',
          email: 'doctor@example.com',
          role: 'medical_staff',
          department: '內科',
          license_number: 'MD001001',
          created_at: new Date().toISOString()
        }
      ]
      console.log('Initialized users:', this.data.users.length)
    }

    // 不初始化測量數據 - 讓患者自己添加真實的測量記錄
    if (this.data.measurements.length === 0) {
      this.data.measurements = []
      console.log('Initialized measurements: 0 (empty - waiting for real patient data)')
    }

    // 不初始化診斷數據 - 讓醫護人員根據真實異常數據創建診斷
    if (this.data.diagnoses.length === 0) {
      this.data.diagnoses = []
      console.log('Initialized diagnoses: 0 (empty - waiting for medical staff diagnoses)')
    }

    if (this.data.covidAssessments.length === 0) {
      this.data.covidAssessments = []
      console.log('Initialized covidAssessments: 0')
    }

    this.saveToLocalStorage()
  }

  // 用戶認證方法
  authenticateUser(username, password) {
    console.log('Authenticating user:', username)
    const user = this.data.users.find(u => u.username === username && u.password === password)
    
    if (user) {
      console.log('User authenticated successfully:', user.fullName, 'Role:', user.role)
      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          department: user.department,
          license_number: user.license_number
        }
      }
    } else {
      console.log('Authentication failed for:', username)
      return {
        success: false,
        message: '用戶名或密碼錯誤'
      }
    }
  }

  // 獲取用戶列表
  getUsers() {
    return [...this.data.users]
  }

  // 根據角色獲取用戶
  getUsersByRole(role) {
    return this.data.users.filter(user => user.role === role)
  }

  // 根據用戶名查找用戶
  findUserByUsername(username) {
    return this.data.users.find(user => user.username === username)
  }

  // 添加用戶
  addUser(userData) {
    const newUser = {
      id: Date.now(),
      ...userData,
      created_at: new Date().toISOString()
    }
    this.data.users.push(newUser)
    this.saveToLocalStorage()
    this.notifyListeners()
    console.log('User added:', newUser.username)
    return newUser
  }

  // 獲取測量記錄
  getMeasurements() {
    return [...this.data.measurements]
  }

  // 根據用戶ID獲取測量記錄
  getMeasurementsByUserId(userId) {
    return this.data.measurements.filter(m => m.user_id === userId)
  }

  // 添加測量記錄
  addMeasurement(measurementData) {
    const newMeasurement = {
      id: Date.now(),
      ...measurementData,
      status: 'pending', // 默认状态为待处理
      created_at: new Date().toISOString()
    }
    this.data.measurements.push(newMeasurement)
    this.saveToLocalStorage()
    this.notifyListeners()
    console.log('Measurement added:', newMeasurement.id)
    return newMeasurement
  }

  // 更新測量記錄狀態
  updateMeasurementStatus(measurementId, status) {
    const measurement = this.data.measurements.find(m => m.id === measurementId)
    if (measurement) {
      measurement.status = status
      this.saveToLocalStorage()
      this.notifyListeners()
      console.log('Measurement status updated:', measurementId, 'to', status)
      return measurement
    }
    console.log('Measurement not found:', measurementId)
    return null
  }

  // 將患者的所有異常測量記錄標記為已處理
  markPatientMeasurementsAsProcessed(patientId) {
    const updatedCount = this.data.measurements
      .filter(m => m.user_id === patientId && m.is_abnormal && m.status !== 'processed')
      .map(m => {
        m.status = 'processed'
        return m
      }).length
    
    if (updatedCount > 0) {
      this.saveToLocalStorage()
      this.notifyListeners()
      console.log(`Marked ${updatedCount} abnormal measurements as processed for patient:`, patientId)
    }
    
    return updatedCount
  }

  // 獲取待處理的異常測量記錄
  getPendingAbnormalMeasurements() {
    return this.data.measurements.filter(m => m.is_abnormal && m.status !== 'processed')
  }

  // 根據用戶ID獲取待處理的異常測量記錄
  getPendingAbnormalMeasurementsByUserId(userId) {
    return this.data.measurements.filter(m => 
      m.user_id === userId && m.is_abnormal && m.status !== 'processed'
    )
  }

  // 獲取診斷記錄
  getDiagnoses() {
    return [...this.data.diagnoses]
  }

  // 根據患者ID獲取診斷記錄
  getDiagnosesByPatientId(patientId) {
    return this.data.diagnoses.filter(d => d.patient_id === patientId)
  }

  // 添加診斷記錄
  addDiagnosis(diagnosisData) {
    const newDiagnosis = {
      id: Date.now(),
      ...diagnosisData,
      created_at: new Date().toISOString()
    }
    this.data.diagnoses.push(newDiagnosis)
    this.saveToLocalStorage()
    this.notifyListeners()
    console.log('Diagnosis added successfully:', newDiagnosis.id, 'for patient:', newDiagnosis.patient_id)
    return newDiagnosis
  }

  // 獲取COVID評估記錄
  getCovidAssessments() {
    return [...this.data.covidAssessments]
  }

  // 根據用戶ID獲取COVID評估記錄
  getCovidAssessmentsByUserId(userId) {
    return this.data.covidAssessments.filter(a => a.user_id === userId)
  }

  // 添加COVID評估記錄
  addCovidAssessment(assessmentData) {
    const newAssessment = {
      id: Date.now(),
      ...assessmentData,
      created_at: new Date().toISOString()
    }
    this.data.covidAssessments.push(newAssessment)
    this.saveToLocalStorage()
    this.notifyListeners()
    console.log('COVID assessment added:', newAssessment.id)
    return newAssessment
  }

  // 保存COVID評估記錄（別名方法，確保兼容性）
  saveCovidAssessment(assessmentData) {
    console.log('saveCovidAssessment called with:', assessmentData)
    return this.addCovidAssessment(assessmentData)
  }

  // 監聽器管理
  addListener(callback) {
    this.listeners.push(callback)
    console.log('Listener added, total listeners:', this.listeners.length)
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback)
    console.log('Listener removed, total listeners:', this.listeners.length)
  }

  notifyListeners() {
    console.log('Notifying', this.listeners.length, 'listeners of data change')
    this.listeners.forEach((callback, index) => {
      try {
        callback()
      } catch (error) {
        console.error(`Error in listener ${index}:`, error)
      }
    })
  }

  // 清除所有數據（用於測試）
  clearAllData() {
    this.data = {
      users: [],
      measurements: [],
      diagnoses: [],
      covidAssessments: []
    }
    Object.values(this.storageKeys).forEach(key => {
      localStorage.removeItem(key)
    })
    this.notifyListeners()
    console.log('All data cleared')
  }

  // 獲取數據統計
  getStats() {
    return {
      users: this.data.users.length,
      measurements: this.data.measurements.length,
      diagnoses: this.data.diagnoses.length,
      covidAssessments: this.data.covidAssessments.length
    }
  }

  // 重新初始化所有數據（用於重置測試）
  reinitializeData() {
    // 清除所有現有數據
    this.data = {
      users: [],
      measurements: [],
      diagnoses: [],
      covidAssessments: []
    }
    
    // 清除localStorage
    Object.values(this.storageKeys).forEach(key => {
      localStorage.removeItem(key)
    })
    
    // 重新初始化示例數據
    this.initializeSampleData()
    
    // 通知所有監聽器
    this.notifyListeners()
    
    console.log('Data reinitialized - users created, measurements and diagnoses are empty')
  }
}

// 創建全局實例
const mockDataStore = new MockDataStore()

// 暴露到window對象用於調試
if (typeof window !== 'undefined') {
  window.mockDataStore = mockDataStore
  console.log('MockDataStore exposed to window for debugging')
}

export default mockDataStore

