@echo off
echo 正在启动沙漠铺设设备云平台...
echo.
echo 启动本地服务器...
python -m http.server 8000
echo.
echo 服务器已启动，请在浏览器中访问：
echo 主页面: http://localhost:8000/index.html
echo 数据检测: http://localhost:8000/dashboard.html
echo 数据测试: http://localhost:8000/test-data.html
echo.
echo 按 Ctrl+C 停止服务器
pause
