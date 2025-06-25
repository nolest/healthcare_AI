@echo off
echo ==========================================
echo   Healthcare Local 数据库管理工具
echo ==========================================
echo.

:menu
echo 请选择操作:
echo 1. 分析数据库结构
echo 2. 清理多余集合
echo 3. 初始化完整数据库
echo 4. 简单检查
echo 5. 退出
echo.
set /p choice=请输入选项 (1-5): 

if "%choice%"=="1" goto analyze
if "%choice%"=="2" goto cleanup
if "%choice%"=="3" goto init
if "%choice%"=="4" goto check
if "%choice%"=="5" goto exit
echo 无效选项，请重新选择
goto menu

:analyze
echo.
echo 正在分析 healthcare_local 数据库结构...
node analyze_local_db.js
echo.
pause
goto menu

:cleanup
echo.
echo 正在清理 healthcare_local 数据库多余集合...
echo 警告: 此操作将删除不必要的集合!
set /p confirm=确认继续? (y/N): 
if /i "%confirm%"=="y" (
    node cleanup_local_db.js
) else (
    echo 操作已取消
)
echo.
pause
goto menu

:init
echo.
echo 正在初始化 healthcare_local 数据库...
echo 警告: 此操作将清空并重新创建所有集合!
set /p confirm=确认继续? (y/N): 
if /i "%confirm%"=="y" (
    node scripts/init-complete-database.js
) else (
    echo 操作已取消
)
echo.
pause
goto menu

:check
echo.
echo 正在检查 healthcare_local 数据库...
node scripts/simple-db-check.js
echo.
pause
goto menu

:exit
echo 再见!
exit /b 0 