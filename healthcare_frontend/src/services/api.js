import { appConfig } from '../config/app.config.js';

// API服务层 - 替换mockDataStore
class ApiService {
  constructor() {
    this.baseURL = appConfig.apiUrl;
    this.token = localStorage.getItem('auth_token');
  }

  // 设置认证token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // 获取认证头
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  }

  // 认证相关API
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async logout() {
    this.setToken(null);
    return { success: true };
  }

  // 测量数据相关API
  async submitMeasurement(measurementData) {
    return this.request('/measurements', {
      method: 'POST',
      body: JSON.stringify(measurementData),
    });
  }

  // 提交带图片的测量数据
  async submitMeasurementWithImages(formData, onProgress = null) {
    const url = `${this.baseURL}/measurements`;
    console.log('🌐 API: 开始提交测量数据到:', url)
    console.log('🔐 API: 认证token存在:', !!this.token)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // 设置上传进度监听
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener('load', () => {
        console.log('📡 API: 收到响应, status:', xhr.status)
        console.log('📄 API: 响应内容:', xhr.responseText)
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('✅ API: 请求成功')
            resolve(data);
          } else {
            console.log('❌ API: 请求失败, status:', xhr.status)
            reject(new Error(data.message || `HTTP error! status: ${xhr.status}`));
          }
        } catch (error) {
          console.log('❌ API: 响应解析失败:', error)
          reject(new Error('响应解析失败'));
        }
      });

      xhr.addEventListener('error', () => {
        console.log('❌ API: 网络请求失败')
        reject(new Error('网络请求失败'));
      });

      xhr.addEventListener('timeout', () => {
        console.log('❌ API: 请求超时')
        reject(new Error('请求超时'));
      });

      xhr.open('POST', url);
      console.log('🔧 API: 设置请求头和超时时间')
      
      // 设置认证头
      if (this.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
        console.log('🔐 API: 已设置认证头')
      } else {
        console.log('⚠️ API: 没有认证token')
      }

      // 设置超时时间（30秒）
      xhr.timeout = 30000;

      console.log('🚀 API: 开始发送请求...')
      xhr.send(formData);
    });
  }

  async createTestMeasurement() {
    // 创建一些测试测量数据
    const testData = {
      systolic: Math.floor(Math.random() * 40) + 120, // 120-160
      diastolic: Math.floor(Math.random() * 30) + 80,  // 80-110
      heartRate: Math.floor(Math.random() * 40) + 60,  // 60-100
      temperature: (Math.random() * 2 + 36).toFixed(1), // 36-38°C
      oxygenSaturation: Math.floor(Math.random() * 5) + 95, // 95-100%
      bloodSugar: Math.floor(Math.random() * 50) + 90, // 90-140 mg/dL
      measurementTime: new Date().toISOString(),
      location: '测试数据',
      notes: '系统生成的测试数据'
    };
    
    return this.submitMeasurement(testData);
  }

  async getMyMeasurements() {
    return this.request('/measurements/my');
  }

  async getMyAbnormalMeasurements() {
    return this.request('/measurements/abnormal/my');
  }

  async getAllMeasurements() {
    return this.request('/measurements');
  }

  async getAbnormalMeasurements() {
    return this.request('/measurements/abnormal');
  }

  async getUserMeasurements(userId) {
    return this.request(`/measurements/user/${userId}`);
  }

  async updateMeasurementStatus(measurementId, status, isAbnormal) {
    return this.request(`/measurements/${measurementId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, isAbnormal }),
    });
  }

  async processPatientMeasurements(patientId) {
    return this.request(`/measurements/patient/${patientId}/process`, {
      method: 'PATCH',
    });
  }

  async getMeasurementStats() {
    return this.request('/measurements/stats');
  }

  // 获取测量记录的图片URL
  getImageUrl(userId, filename, businessType = 'measurement') {
    return `${this.baseURL}/measurements/images/${businessType}/${userId}/${filename}`;
  }

  // 获取完整图片URL（从相对路径）
  getFullImageUrl(relativePath) {
    if (!relativePath) return '';
    
    // 如果已经是完整URL，直接返回
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    
    // 确保路径以 / 开头
    const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    
    return `${this.baseURL}${normalizedPath}`;
  }

  // 用户管理相关API
  async getUsers() {
    return this.request('/users');
  }

  async getAllUsers() {
    return this.request('/users');
  }

  async getPatients() {
    return this.request('/users/patients');
  }

  async getMedicalStaff() {
    return this.request('/users/medical-staff');
  }

  async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  async getPatientMeasurements(patientId) {
    return this.request(`/measurements/user/${patientId}`);
  }

  // COVID评估相关API
  async submitCovidAssessment(assessmentData) {
    return this.request('/covid-assessments', {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    });
  }

  // 提交带图片的COVID评估数据
  async submitCovidAssessmentWithImages(formData, onProgress = null) {
    const url = `${this.baseURL}/covid-assessments`;
    console.log('🌐 API: 开始提交COVID评估数据到:', url)
    console.log('🔐 API: 认证token存在:', !!this.token)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // 设置上传进度监听
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener('load', () => {
        console.log('📡 API: 收到响应, status:', xhr.status)
        console.log('📄 API: 响应内容:', xhr.responseText)
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('✅ API: 请求成功')
            resolve(data);
          } else {
            console.log('❌ API: 请求失败, status:', xhr.status)
            reject(new Error(data.message || `HTTP error! status: ${xhr.status}`));
          }
        } catch (error) {
          console.log('❌ API: 响应解析失败:', error)
          reject(new Error('响应解析失败'));
        }
      });

      xhr.addEventListener('error', () => {
        console.log('❌ API: 网络请求失败')
        reject(new Error('网络请求失败'));
      });

      xhr.addEventListener('timeout', () => {
        console.log('❌ API: 请求超时')
        reject(new Error('请求超时'));
      });

      xhr.open('POST', url);
      console.log('🔧 API: 设置请求头和超时时间')
      
      // 设置认证头
      if (this.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
        console.log('🔐 API: 已设置认证头')
      } else {
        console.log('⚠️ API: 没有认证token')
      }

      // 设置超时时间（30秒）
      xhr.timeout = 30000;

      console.log('🚀 API: 开始发送请求...')
      xhr.send(formData);
    });
  }

  async getMyCovidAssessments() {
    return this.request('/covid-assessments/my');
  }

  async getAllCovidAssessments() {
    return this.request('/covid-assessments');
  }

  async getHighRiskCovidAssessments() {
    return this.request('/covid-assessments/high-risk');
  }

  async getUserCovidAssessments(userId) {
    return this.request(`/covid-assessments/user/${userId}`);
  }

  async getCovidAssessmentStats() {
    return this.request('/covid-assessments/stats');
  }

  async getCovidAssessmentById(id) {
    return this.request(`/covid-assessments/${id}`);
  }

  async updateCovidAssessment(id, updateData) {
    return this.request(`/covid-assessments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // 诊断相关API
  async createDiagnosis(diagnosisData) {
    return this.request('/diagnoses', {
      method: 'POST',
      body: JSON.stringify(diagnosisData),
    });
  }

  async getMyDiagnoses() {
    return this.request('/diagnoses/my');
  }

  async getAllDiagnoses() {
    return this.request('/diagnoses');
  }

  async getPatientDiagnoses(patientId) {
    return this.request(`/diagnoses/patient/${patientId}`);
  }

  async getDiagnosisById(id) {
    return this.request(`/diagnoses/${id}`);
  }

  async updateDiagnosis(id, updateData) {
    return this.request(`/diagnoses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async getDiagnosisStats() {
    return this.request('/diagnoses/stats');
  }

  // COVID诊断相关API
  async createCovidDiagnosis(diagnosisData) {
    return this.request('/covid-diagnoses', {
      method: 'POST',
      body: JSON.stringify(diagnosisData),
    });
  }

  async getMyCovidDiagnoses() {
    return this.request('/covid-diagnoses/my-diagnoses');
  }

  async getAllCovidDiagnoses() {
    return this.request('/covid-diagnoses');
  }

  async getPendingCovidDiagnoses() {
    return this.request('/covid-diagnoses/pending');
  }

  async getPatientCovidDiagnoses(patientId) {
    return this.request(`/covid-diagnoses/patient/${patientId}`);
  }

  async getCovidDiagnosisByAssessment(assessmentId) {
    return this.request(`/covid-diagnoses/by-assessment/${assessmentId}`);
  }

  async getCovidDiagnosisById(id) {
    return this.request(`/covid-diagnoses/${id}`);
  }

  async updateCovidDiagnosis(id, updateData) {
    return this.request(`/covid-diagnoses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async deleteCovidDiagnosis(id) {
    return this.request(`/covid-diagnoses/${id}`, {
      method: 'DELETE',
    });
  }

  async getCovidDiagnosisStats() {
    return this.request('/covid-diagnoses/statistics');
  }

  async getCovidAssessmentsNeedingDiagnosis() {
    return this.request('/covid-diagnoses/assessments-needing-diagnosis');
  }

  // 检查token是否有效
  isAuthenticated() {
    return !!this.token;
  }

  // 获取当前用户信息（从token中解析或缓存）
  getCurrentUser() {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // 设置当前用户信息
  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('current_user');
    }
  }

  // ===== 异常值范围设置 =====
  async getAbnormalRanges() {
    return this.request('/abnormal-ranges');
  }

  async getAbnormalRange(id) {
    return this.request(`/abnormal-ranges/${id}`);
  }

  async getAbnormalRangeByType(measurementType) {
    return this.request(`/abnormal-ranges/type/${measurementType}`);
  }

  async createAbnormalRange(data) {
    return this.request('/abnormal-ranges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAbnormalRange(id, data) {
    return this.request(`/abnormal-ranges/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAbnormalRange(id) {
    return this.request(`/abnormal-ranges/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== 诊断报告 =====
  async createDiagnosisReport(reportData) {
    return this.request('/diagnosis-reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getAllDiagnosisReports() {
    return this.request('/diagnosis-reports');
  }

  async getPatientDiagnosisReports(patientId) {
    return this.request(`/diagnosis-reports/patient/${patientId}`);
  }

  async getDoctorDiagnosisReports(doctorId) {
    return this.request(`/diagnosis-reports/doctor/${doctorId}`);
  }

  async getUnreadDiagnosisReports(patientId) {
    return this.request(`/diagnosis-reports/patient/${patientId}/unread`);
  }

  async getUnreadDiagnosisReportsCount(patientId) {
    return this.request(`/diagnosis-reports/patient/${patientId}/unread-count`);
  }

  async getPendingDiagnosisReports() {
    return this.request('/diagnosis-reports/pending');
  }

  async getDiagnosisReportDetail(reportId) {
    return this.request(`/diagnosis-reports/${reportId}`);
  }

  async markDiagnosisReportAsRead(reportId) {
    return this.request(`/diagnosis-reports/${reportId}/mark-read`, {
      method: 'PATCH',
    });
  }

  async updateDiagnosisReport(reportId, updateData) {
    return this.request(`/diagnosis-reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async deleteDiagnosisReport(reportId) {
    return this.request(`/diagnosis-reports/${reportId}`, {
      method: 'DELETE',
    });
  }

  async getDataNeedingDiagnosis() {
    return this.request('/diagnosis-reports/data-needing-diagnosis');
  }

  async getDiagnosisReportStatistics() {
    return this.request('/diagnosis-reports/statistics');
  }
}

// 创建全局API实例
const apiService = new ApiService();

export default apiService; 