import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'

import { Eye, EyeOff, User, Lock, LogIn } from 'lucide-react'
import apiService from '../services/api.js'

export default function LoginForm({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Attempting login with:', formData.username)
      const authResult = await apiService.login(formData)
      
      if (authResult.success) {
        console.log('Login successful:', authResult.user)
        // 保存用户信息到本地存储
        apiService.setCurrentUser(authResult.user)
        onLogin(authResult.user)
      } else {
        setError(authResult.message || '登錄失敗')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(error.message || '登錄失敗，請檢查網絡連接')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-gradient-to-r from-red-50/80 to-red-100/80 border-0 text-red-700 px-4 py-3 rounded-2xl shadow-inner backdrop-blur-sm">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mr-3 shadow-sm">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 用户名输入框 */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl shadow-sm">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="請輸入用戶名"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
            className="flex-1 h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
          />
        </div>

        {/* 密码输入框 */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl shadow-sm">
            <Lock className="h-5 w-5 text-blue-600" />
          </div>
          <div className="relative flex-1">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="請輸入密碼"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full pr-12 h-12 bg-gradient-to-br from-white/90 to-gray-50/90 border-0 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-500/30 focus:shadow-lg backdrop-blur-sm transition-all duration-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* 登录按钮 */}
        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0"
          >
            <div className="flex items-center justify-center">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  登錄中...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  登錄
                </>
              )}
            </div>
          </Button>
        </div>
      </form>
    </div>
  )
}

