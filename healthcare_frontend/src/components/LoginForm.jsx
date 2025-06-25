import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import apiService from '../services/api.js'

export default function LoginForm({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">用戶名</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="請輸入用戶名"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">密碼</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="請輸入密碼"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? '登錄中...' : '登錄'}
        </Button>
      </form>
    </div>
  )
}

