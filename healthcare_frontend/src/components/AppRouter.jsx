import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import PatientMenuPage from '../pages/PatientMenuPage.jsx'
import PatientOverviewPage from '../pages/PatientOverviewPage.jsx'
import PatientMeasurementPage from '../pages/PatientMeasurementPage.jsx'
import PatientMeasurementHistoryPage from '../pages/PatientMeasurementHistoryPage.jsx'
import PatientDiagnosesPage from '../pages/PatientDiagnosesPage.jsx'
import PatientSymptomPage from '../pages/PatientSymptomPage.jsx'
import MedicalStaffPage from '../pages/MedicalStaffPage.jsx'
import DiagnosisPage from '../pages/DiagnosisPage.jsx'
import AbnormalDataSettingsPage from '../pages/AbnormalDataSettingsPage.jsx'
import CovidFluManagementPage from '../pages/CovidFluManagementPage.jsx'
import PatientCovidAssessmentPage from '../pages/PatientCovidAssessmentPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* 默认路由重定向到登录页 */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 登录页面 */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 注册页面 */}
        <Route path="/register" element={<RegisterPage />} />
        
        {/* 患者页面 */}
        <Route path="/patient" element={<PatientMenuPage />} />
        <Route path="/patient/overview" element={<PatientOverviewPage />} />
        <Route path="/patient/measurement" element={<PatientMeasurementPage />} />
        <Route path="/patient/measurement/history" element={<PatientMeasurementHistoryPage />} />
        <Route path="/patient/diagnoses" element={<PatientDiagnosesPage />} />
        <Route path="/patient/symptoms" element={<PatientSymptomPage />} />
        <Route path="/patient/covid-assessment" element={<PatientCovidAssessmentPage />} />
        
        {/* 医护人员页面 */}
        <Route path="/medical" element={<MedicalStaffPage />} />
        <Route path="/medical/covid-management" element={<CovidFluManagementPage />} />
        
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