import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Calendar, 
  UserPlus,
  Eye,
  EyeOff,
  Briefcase,
  CreditCard,
  AtSign,
  UserCheck,
  KeyRound
} from 'lucide-react'
import apiService from '../services/api.js'

export default function RegisterForm({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    phone: '',
    role: '',
    birthDate: '',
    gender: '',
    department: '',
    licenseNumber: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // 清除該字段的錯誤
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // 基本驗證
    if (!formData.username.trim()) newErrors.username = '登錄賬號不能為空'
    // 验证用户名只包含英文和数字
    const usernameRegex = /^[a-zA-Z0-9]+$/
    if (formData.username && !usernameRegex.test(formData.username)) {
      newErrors.username = '登錄賬號只能包含英文字母和數字'
    }
    if (!formData.password) newErrors.password = '密碼不能為空'
    if (formData.password.length < 6) newErrors.password = '密碼至少需要6個字符'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '密碼確認不匹配'
    }
    if (!formData.fullName.trim()) newErrors.fullName = '姓名不能為空'
    if (!formData.email.trim()) newErrors.email = '電子郵件不能為空'
    if (!formData.phone.trim()) newErrors.phone = '電話號碼不能為空'
    if (!formData.role) newErrors.role = '請選擇用戶角色'

    // 患者特定驗證
    if (formData.role === 'patient') {
      if (!formData.birthDate) newErrors.birthDate = '出生日期不能為空'
      if (!formData.gender) newErrors.gender = '請選擇性別'
    }

    // 醫護人員特定驗證
    if (formData.role === 'medical_staff') {
      if (!formData.department.trim()) newErrors.department = '科室不能為空'
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = '執照號碼不能為空'
    }

    // 電子郵件格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = '電子郵件格式不正確'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // 準備用戶數據
      const userData = {
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role
      }

      // 根據角色添加特定字段
      if (formData.role === 'patient') {
        userData.birthDate = formData.birthDate
        userData.gender = formData.gender
      } else if (formData.role === 'medical_staff') {
        userData.department = formData.department
        userData.license_number = formData.licenseNumber
      }

      // 調用API註冊用戶
      const response = await apiService.register(userData)
      
      if (response.success) {
        console.log('User registered successfully:', response.user)
        // 保存用户信息到本地存储
        apiService.setCurrentUser(response.user)
        
        // 註冊成功回調
        if (onRegisterSuccess) {
          onRegisterSuccess(response.user)
        }
      } else {
        setErrors({ submit: response.message || '註冊失敗' })
      }

    } catch (error) {
      console.error('Registration error:', error)
      if (error.message.includes('用户名或邮箱已存在')) {
        setErrors({ 
          username: '用戶名已存在',
          email: '電子郵件已存在'
        })
      } else {
        setErrors({ submit: error.message || '註冊失敗，請檢查網絡連接' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {(errors.submit) && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-inner">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center mr-3">
              <span className="text-red-600 text-xs">!</span>
            </div>
            <span className="text-sm">{errors.submit}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 第一行：登录账号和真实姓名 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 登录账号 */}
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl shadow-sm">
                <AtSign className="h-5 w-5 text-blue-600" />
              </div>
              <Input
                id="username"
                type="text"
                placeholder="登錄賬號（英文數字組合）"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`flex-1 h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 ${errors.username ? 'ring-2 ring-red-500/50' : ''}`}
              />
            </div>
            {errors.username && <p className="text-xs text-red-500 mt-1 ml-14">{errors.username}</p>}
          </div>

          {/* 真实姓名 */}
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl shadow-sm">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <Input
                id="fullName"
                type="text"
                placeholder="請輸入真實姓名"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`flex-1 h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 ${errors.fullName ? 'ring-2 ring-red-500/50' : ''}`}
              />
            </div>
            {errors.fullName && <p className="text-xs text-red-500 mt-1 ml-14">{errors.fullName}</p>}
          </div>
        </div>

        {/* 第二行：邮箱和电话 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 邮箱 */}
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl shadow-sm">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="請輸入電子郵件"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`flex-1 h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 ${errors.email ? 'ring-2 ring-red-500/50' : ''}`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1 ml-14">{errors.email}</p>}
          </div>

          {/* 电话 */}
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl shadow-sm">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="請輸入電話號碼"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`flex-1 h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 ${errors.phone ? 'ring-2 ring-red-500/50' : ''}`}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1 ml-14">{errors.phone}</p>}
          </div>
        </div>

        {/* 第三行：密码区域 - 特殊布局，确保密码字段相邻 */}
        <div className="grid grid-cols-1 gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 密码 */}
            <div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl shadow-sm">
                  <Lock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="請輸入密碼"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pr-12 h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 ${errors.password ? 'ring-2 ring-red-500/50' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1 ml-14">{errors.password}</p>}
            </div>

            {/* 确认密码 */}
            <div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl shadow-sm">
                  <KeyRound className="h-5 w-5 text-blue-600" />
                </div>
                <div className="relative flex-1">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="請再次輸入密碼"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pr-12 h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 ${errors.confirmPassword ? 'ring-2 ring-red-500/50' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 ml-14">{errors.confirmPassword}</p>}
            </div>
          </div>
        </div>

        {/* 角色选择 - 单列全宽 */}
        <div className="grid grid-cols-1 gap-3">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl shadow-sm">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger className={`flex-1 h-12 w-auto bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 px-4 py-3 ${errors.role ? 'ring-2 ring-red-500/50' : ''}`}>
                  <SelectValue placeholder="請選擇用戶角色" />
                </SelectTrigger>
                <SelectContent className="border-0 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden min-w-[200px] p-2">
                  <SelectItem value="patient" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200 cursor-pointer py-2.5 pl-3 pr-8 my-1 relative">
                    患者
                  </SelectItem>
                  <SelectItem value="medical_staff" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200 cursor-pointer py-2.5 pl-3 pr-8 my-1 relative">
                    醫護人員
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.role && <p className="text-xs text-red-500 mt-1 ml-14">{errors.role}</p>}
          </div>
        </div>

        {/* 患者特定字段 */}
        {formData.role === 'patient' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl shadow-sm">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className={`flex-1 h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 ${errors.birthDate ? 'ring-2 ring-red-500/50' : ''}`}
                />
              </div>
              {errors.birthDate && <p className="text-xs text-red-500 mt-1 ml-14">{errors.birthDate}</p>}
            </div>

            <div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl shadow-sm">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className={`flex-1 h-12 w-auto bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 px-4 py-3 ${errors.gender ? 'ring-2 ring-red-500/50' : ''}`}>
                    <SelectValue placeholder="請選擇性別" />
                  </SelectTrigger>
                  <SelectContent className="border-0 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden min-w-[120px] p-2">
                    <SelectItem value="male" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200 cursor-pointer py-2.5 pl-3 pr-8 my-1 relative">
                      男
                    </SelectItem>
                    <SelectItem value="female" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200 cursor-pointer py-2.5 pl-3 pr-8 my-1 relative">
                      女
                    </SelectItem>
                    <SelectItem value="other" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200 cursor-pointer py-2.5 pl-3 pr-8 my-1 relative">
                      其他
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.gender && <p className="text-xs text-red-500 mt-1 ml-14">{errors.gender}</p>}
            </div>
          </div>
        )}

        {/* 医护人员特定字段 - 响应式两列布局 */}
        {formData.role === 'medical_staff' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl shadow-sm">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <Input
                  id="department"
                  type="text"
                  placeholder="請輸入科室"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className={`flex-1 h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 ${errors.department ? 'ring-2 ring-red-500/50' : ''}`}
                />
              </div>
              {errors.department && <p className="text-xs text-red-500 mt-1 ml-14">{errors.department}</p>}
            </div>

            <div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl shadow-sm">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <Input
                  id="licenseNumber"
                  type="text"
                  placeholder="請輸入執照號碼"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  className={`flex-1 h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300 ${errors.licenseNumber ? 'ring-2 ring-red-500/50' : ''}`}
                />
              </div>
              {errors.licenseNumber && <p className="text-xs text-red-500 mt-1 ml-14">{errors.licenseNumber}</p>}
            </div>
          </div>
        )}

        {/* 注册按钮 */}
        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0"
          >
          <div className="flex items-center justify-center">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                註冊中...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                創建賬戶
              </>
            )}
          </div>
                  </Button>
        </div>

        {/* 提示文本 */}
        <div className="text-center text-xs text-gray-500 mt-3">
          <p>註冊即表示您同意我們的服務條款和隱私政策</p>
        </div>
      </form>
    </div>
  )
}

