import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { History } from 'lucide-react'
import PatientHeader from '../components/ui/PatientHeader.jsx'
import MeasurementHistory from '../components/MeasurementHistory.jsx'
import apiService from '../services/api.js'

export default function PatientMeasurementHistoryPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const currentUser = apiService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    } else {
      navigate('/login')
    }
  }, [navigate])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PatientHeader 
        title="測量歷史記錄"
        subtitle="查看您過往的生命體徵測量記錄"
        icon={History}
        showBackButton={true}
        backPath="/patient/measurement"
        user={user}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-purple-600" />
            您的生命體徵測量歷史
          </h2>
          <p className="text-gray-600 mb-6">
            查看您過往的所有生命體徵測量記錄，包括血壓、心率、體溫、血氧飽和度等數據。
          </p>
          <MeasurementHistory />
        </div>
      </main>
    </div>
  )
} 