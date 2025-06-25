@echo off
echo 启动医疗系统开发环境...

echo.
echo 正在启动后端服务器...
start "Healthcare Backend" cmd /k "cd healthcare_backend && npm run start:dev"

echo.
echo 等待后端启动...
timeout /t 5 /nobreak > nul

echo.
echo 正在启动前端服务器...
start "Healthcare Frontend" cmd /k "cd healthcare_frontend && npm run dev"

echo.
echo 开发环境启动完成！
echo 后端API: http://localhost:7723/api
echo API文档: http://localhost:7723/api-docs
echo 前端界面: http://localhost:6886  
  echo 前端应用: http://localhost:6886
echo.
pause 