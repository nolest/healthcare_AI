# 遠程醫療系統 - 路由指南

## 概述
本項目已經重構為使用 React Router 進行頁面導航管理，將不同功能拆分為獨立的頁面組件。

## 路由結構

### 主要路由
- `/` - 重定向到登錄頁面
- `/login` - 登錄頁面（包含登錄和註冊功能）
- `/patient` - 患者控制台頁面
- `/medical` - 醫護人員控制台頁面
- `/diagnosis/:patientId` - 診斷頁面（醫護人員為特定患者進行診斷）

### 路由保護
每個頁面都包含身份驗證檢查：
- 未登錄用戶會被重定向到登錄頁面
- 患者只能訪問患者頁面
- 醫護人員只能訪問醫護人員相關頁面

## 頁面組件

### 1. LoginPage (`/login`)
- 統一的登錄和註冊界面
- 包含系統介紹和功能特色展示
- 登錄成功後根據用戶角色自動跳轉

### 2. PatientPage (`/patient`)
- 患者專用控制台
- 包含測量、歷史記錄、診斷結果等功能
- 頂部導航欄包含用戶信息和登出按鈕

### 3. MedicalStaffPage (`/medical`)
- 醫護人員專用控制台
- 包含待處理患者、患者管理、診斷等功能
- 頂部導航欄包含用戶信息和登出按鈕

### 4. DiagnosisPage (`/diagnosis/:patientId`)
- 獨立的診斷頁面
- 醫護人員為特定患者進行診斷
- 包含患者信息顯示和診斷表單
- 診斷完成後返回醫護人員控制台

## 導航方式

### 程序化導航
使用 React Router 的 `useNavigate` hook：
```javascript
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()
navigate('/diagnosis/patient123')
```

### 自動重定向
- 登錄成功後自動跳轉到相應角色的控制台
- 未認證用戶自動重定向到登錄頁面
- 診斷完成後自動返回醫護人員控制台

## 狀態管理
- 用戶信息存儲在 localStorage 中
- 每個頁面組件獨立管理其狀態
- 使用 mockDataStore 進行數據同步

## 開發注意事項
1. 所有頁面組件都包含身份驗證邏輯
2. 路由參數通過 `useParams` hook 獲取
3. 導航操作使用 `useNavigate` hook
4. 頁面間的數據傳遞通過 URL 參數或全局狀態管理

## 測試路由
1. 啟動開發服務器：`npm run dev`
2. 訪問 `http://localhost:5173`
3. 測試不同用戶角色的登錄和頁面跳轉
4. 測試診斷流程的完整路由導航 