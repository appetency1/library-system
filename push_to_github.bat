@echo off
echo ========================================
echo 正在推送到 GitHub 仓库...
echo ========================================
echo.

cd /d "%~dp0"
git remote -v
echo.
echo 正在推送...
git push -u origin main --force
echo.
if %errorlevel% equ 0 (
    echo ========================================
    echo ✅ 推送成功！
    echo ========================================
) else (
    echo ========================================
    echo ❌ 推送失败，请检查网络或 GitHub 访问
    echo ========================================
)
echo.
pause
