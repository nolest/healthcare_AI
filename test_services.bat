@echo off
echo 🔍 检查服务状态...
echo.

echo 检查后端服务 (端口7723):
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:7723' -TimeoutSec 5; Write-Host '✅ 后端服务正常 - 状态码:' $response.StatusCode } catch { Write-Host '❌ 后端服务未启动或无响应' }"

echo.
echo 检查后端API (端口7723/api):
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:7723/api' -TimeoutSec 5; Write-Host '✅ 后端API正常 - 状态码:' $response.StatusCode } catch { Write-Host '❌ 后端API未启动或无响应' }"

echo.
echo 检查前端服务 (端口6886):
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:6886' -TimeoutSec 5; Write-Host '✅ 前端服务正常 - 状态码:' $response.StatusCode } catch { Write-Host '❌ 前端服务未启动或无响应' }"

echo.
echo 端口监听状态:
netstat -an | findstr ":7723\|:6886"

echo.
echo 📝 正确的访问地址:
echo - 前端应用: http://localhost:6886
echo - 后端API: http://localhost:7723/api
echo - API文档: http://localhost:7723/api-docs
echo.
pause 