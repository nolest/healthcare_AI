import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import mockDataStore from '../utils/mockDataStore.js'

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
    if (!formData.username.trim()) newErrors.username = '用戶名不能為空'
    if (!formData.password) newErrors.password = '密碼不能為空'
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

    // 檢查用戶名是否已存在
    const existingUser = mockDataStore.findUserByUsername(formData.username)
    if (existingUser) {
      newErrors.username = '用戶名已存在'
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

      // 添加用戶到系統
      const newUser = mockDataStore.addUser(userData)
      
      console.log('User registered successfully:', newUser)
      
      // 註冊成功回調
      if (onRegisterSuccess) {
        onRegisterSuccess(newUser)
      }

    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ submit: '註冊失敗，請稍後重試' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">用戶註冊</CardTitle>
        <CardDescription className="text-center">
          創建新的醫療系統賬戶
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 基本信息 */}
          <div className="space-y-2">
            <Label htmlFor="username">用戶名</Label>
            <Input
              id="username"
              type="text"
              placeholder="請輸入用戶名"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密碼</Label>
            <Input
              id="password"
              type="password"
              placeholder="請輸入密碼"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">確認密碼</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="請再次輸入密碼"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">姓名</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="請輸入真實姓名"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">電子郵件</Label>
            <Input
              id="email"
              type="email"
              placeholder="請輸入電子郵件"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">電話號碼</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="請輸入電話號碼"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">用戶角色</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="請選擇用戶角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">患者</SelectItem>
                <SelectItem value="medical_staff">醫護人員</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
          </div>

          {/* 患者特定字段 */}
          {formData.role === 'patient' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="birthDate">出生日期</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className={errors.birthDate ? 'border-red-500' : ''}
                />
                {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">性別</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                    <SelectValue placeholder="請選擇性別" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">男</SelectItem>
                    <SelectItem value="female">女</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
              </div>
            </>
          )}

          {/* 醫護人員特定字段 */}
          {formData.role === 'medical_staff' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="department">科室</Label>
                <Input
                  id="department"
                  type="text"
                  placeholder="請輸入科室"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className={errors.department ? 'border-red-500' : ''}
                />
                {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">執照號碼</Label>
                <Input
                  id="licenseNumber"
                  type="text"
                  placeholder="請輸入執照號碼"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  className={errors.licenseNumber ? 'border-red-500' : ''}
                />
                {errors.licenseNumber && <p className="text-sm text-red-500">{errors.licenseNumber}</p>}
              </div>
            </>
          )}

          {errors.submit && (
            <div className="text-sm text-red-500 text-center">{errors.submit}</div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '註冊中...' : '註冊'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

