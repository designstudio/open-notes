@echo off
setlocal

set "APP_URL=http://127.0.0.1:5173/"
set "PROJECT_DIR=%~dp0"

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo Nao foi possivel encontrar o npm. Instale o Node.js e tente novamente.
  pause
  exit /b 1
)

powershell.exe -NoProfile -Command "try { $response = Invoke-WebRequest -Uri '%APP_URL%' -UseBasicParsing -TimeoutSec 1; if ($response.StatusCode -ge 200) { exit 0 } } catch {}; exit 1" >nul 2>nul
if errorlevel 1 (
  powershell.exe -NoProfile -Command "$project = [System.IO.Path]::GetFullPath('%PROJECT_DIR%'); Start-Process -FilePath 'npm.cmd' -ArgumentList 'run dev -- --host 127.0.0.1' -WorkingDirectory $project -WindowStyle Hidden"
)

powershell.exe -NoProfile -Command "$deadline = (Get-Date).AddSeconds(25); do { try { $response = Invoke-WebRequest -Uri '%APP_URL%' -UseBasicParsing -TimeoutSec 1; if ($response.StatusCode -ge 200) { exit 0 } } catch {}; Start-Sleep -Milliseconds 300 } while ((Get-Date) -lt $deadline); exit 1" >nul 2>nul
if errorlevel 1 (
  echo O servidor nao respondeu em %APP_URL%.
  echo Execute este atalho novamente para tentar iniciar o sistema.
  pause
  exit /b 1
)

set "CHROME_PATH="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined CHROME_PATH if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined CHROME_PATH if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=%LocalAppData%\Google\Chrome\Application\chrome.exe"

if defined CHROME_PATH (
  start "" "%CHROME_PATH%" "%APP_URL%"
) else (
  start "" "%APP_URL%"
)

endlocal
