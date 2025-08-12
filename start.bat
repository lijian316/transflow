@echo off
setlocal enabledelayedexpansion

echo ========================================
echo 启动多语言翻译管理系统...
echo ========================================

REM 检查Python是否安装
echo 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到Python，请先安装Python
    echo 请访问 https://www.python.org/downloads/ 下载并安装Python
    pause
    exit /b 1
)
echo [成功] Python已安装

REM 检查Node.js是否安装
echo 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到Node.js，请先安装Node.js
    echo 请访问 https://nodejs.org/ 下载并安装Node.js
    pause
    exit /b 1
)
echo [成功] Node.js已安装

REM 检查package.json是否存在
if not exist "package.json" (
    echo [错误] 未找到package.json文件
    pause
    exit /b 1
)

REM 检查run_backend.py是否存在
if not exist "run_backend.py" (
    echo [错误] 未找到run_backend.py文件
    pause
    exit /b 1
)

REM 安装Node.js依赖
echo.
echo 安装Node.js依赖...
call npm install
if errorlevel 1 (
    echo [警告] npm install 失败，但继续尝试启动服务...
)

REM 尝试安装Python依赖（如果存在requirements.txt）
if exist "requirements.txt" (
    echo 安装Python依赖...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [警告] pip install 失败，但继续尝试启动服务...
    )
) else (
    echo [信息] 未找到requirements.txt，跳过Python依赖安装
)

REM 启动后端服务
echo.
echo 启动后端服务...
start "Backend Server" cmd /k "python run_backend.py"

REM 等待后端启动
echo 等待后端服务启动...
timeout /t 5 /nobreak >nul

REM 启动前端服务
echo.
echo 启动前端服务...
start "Frontend Server" cmd /k "npm start"

REM 等待前端启动
echo 等待前端服务启动...
timeout /t 10 /nobreak >nul

REM 注意：npm start 会自动打开浏览器
echo.
echo 前端服务正在启动，浏览器将自动打开...

echo.
echo ========================================
echo 系统启动完成！
echo ========================================
echo 前端地址: http://localhost:3000
echo 后端地址: http://localhost:5000
echo.
echo 服务已在新的命令行窗口中运行
echo 关闭这些窗口将停止相应的服务
echo 浏览器已自动打开前端页面
echo.
echo 如果遇到问题，请检查：
echo 1. 确保Python和Node.js已正确安装
echo 2. 检查端口3000和5000是否被占用
echo 3. 查看新打开的命令行窗口中的错误信息
echo.
echo 按任意键退出启动脚本...
pause >nul
