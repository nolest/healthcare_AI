import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import mockDataStore from '../utils/mockDataStore'

export default function LoginForm({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    console.log('Attempting login with:', formData.username)
    const authResult = mockDataStore.authenticateUser(formData.username, formData.password)
    
    if (authResult.success) {
      console.log('Login successful:', authResult.user)
      onLogin(authResult.user)
    } else {
      console.log('Login failed:', authResult.message)
      setError(authResult.message || '登錄失敗')
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
          />
        </div>

        <Button type="submit" className="w-full">
          登錄
        </Button>
      </form>
    </div>
  )
}

