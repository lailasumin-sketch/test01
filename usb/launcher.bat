@echo off
setlocal DisableDelayedExpansion
chcp 65001 >nul
set "USB_ARCH=%PROCESSOR_ARCHITECTURE%"
if defined PROCESSOR_ARCHITEW6432 set "USB_ARCH=%PROCESSOR_ARCHITEW6432%"
set "USB_SERVER=%~dp0runtime\server-windows-386.exe"
if /I "%USB_ARCH%"=="AMD64" set "USB_SERVER=%~dp0runtime\server-windows-amd64.exe"
if /I "%USB_ARCH%"=="ARM64" set "USB_SERVER=%~dp0runtime\server-windows-arm64.exe"
if not exist "%USB_SERVER%" goto missing_server
if not exist "%~dp0dist\index.html" goto missing_dist
if not exist "%~dp0dist\data\records.csv" goto missing_data
echo 의성에서, 살다 - USB 오프라인 실행
echo 브라우저가 자동으로 열립니다. 이용 중에는 이 창을 열어 두세요.
echo 종료: 이 창에서 Ctrl+C를 누르거나 창을 닫으세요.
echo.
"%USB_SERVER%" --root "%~dp0dist"
if errorlevel 1 goto server_error
exit /b 0
:missing_server
echo Windows 서버 파일이 없습니다. ZIP을 모두 압축 해제했는지 확인하세요.
goto failed
:missing_dist
echo dist\index.html이 없습니다. 제출 폴더 전체를 복사해 주세요.
goto failed
:missing_data
echo dist\data\records.csv가 없습니다. 제출 폴더 전체를 복사해 주세요.
goto failed
:server_error
echo 서버 실행에 실패했습니다. 위 오류와 심사위원용 실행안내서를 확인해 주세요.
:failed
pause
exit /b 1
