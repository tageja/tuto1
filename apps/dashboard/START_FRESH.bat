@echo off
echo ============================================
echo  STARTING DASHBOARD WITH FRESH BUILD
echo ============================================
echo.

echo Step 1: Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Cleaning cache...
if exist .next-web rmdir /s /q .next-web
if exist .next rmdir /s /q .next
echo Cache cleaned!

echo Step 3: Verifying .env.local exists...
if not exist .env.local (
    echo ERROR: .env.local not found!
    echo Please create apps/dashboard/.env.local with your credentials
    pause
    exit /b 1
)
echo .env.local found!

echo Step 4: Starting dev server...
echo.
echo Server will start in a moment...
echo Open your browser to: http://localhost:3000/school/admin/classes
echo.

npm run dev
















