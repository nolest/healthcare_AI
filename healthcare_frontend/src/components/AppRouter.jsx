import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage.jsx'
import PatientPage from '../pages/PatientPage.jsx'
import MedicalStaffPage from '../pages/MedicalStaffPage.jsx'
import DiagnosisPage from '../pages/DiagnosisPage.jsx'
import AbnormalDataSettingsPage from '../pages/AbnormalDataSettingsPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* 默认路由重定向到登录页 */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 登录页面 */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 患者页面 */}
        <Route path="/patient" element={<PatientPage />} />
        
        {/* 医护人员页面 */}
        <Route path="/medical" element={<MedicalStaffPage />} />
        
        {/* 诊断页面 */}
        <Route path="/diagnosis/:patientId" element={<DiagnosisPage />} />
        
        {/* 异常数据设置页面 */}
        <Route path="/abnormal-settings" element={<AbnormalDataSettingsPage />} />
        
        {/* 404页面 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
} 