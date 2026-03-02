@echo off
setlocal

echo.
echo   Armsrace Monitor - Starting...
echo.

:: Install dependencies if needed
if not exist node_modules (
  echo   Installing dependencies (first run)...
  call npm install
  echo.
)

:: Create .env if missing
if not exist .env (
  echo   Creating .env from .env.example...
  copy .env.example .env > nul
  echo   Edit .env to add optional API keys for enhanced data.
  echo.
)

:: Ensure data directory exists
if not exist data mkdir data

:: Start all services
call npm run dev

endlocal
