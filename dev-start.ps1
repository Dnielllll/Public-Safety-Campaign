#!/usr/bin/env pwsh
# =============================================================================
# Start all Barangay 178 microservices in development mode (no Docker required).
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  Barangay 178 SSMS - Microservices Dev Launcher" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Backend = Join-Path $Root "backend"
$NotifSvc = Join-Path $Root "services\notification-service"
$Frontend = Join-Path $Root "frontend"

# Ensure notification-service deps are installed
if (-not (Test-Path (Join-Path $NotifSvc "node_modules"))) {
    Write-Host "Installing notification-service dependencies..." -ForegroundColor Yellow
    Push-Location $NotifSvc
    npm install
    Pop-Location
}

# Ensure notification-service .env exists
$NotifEnv = Join-Path $NotifSvc ".env"
if (-not (Test-Path $NotifEnv)) {
    Copy-Item (Join-Path $NotifSvc ".env.example") $NotifEnv
    Write-Host "Created $NotifEnv - edit it to add your IPROG_API_TOKEN" -ForegroundColor Yellow
}

# Copy real secrets into notification-service .env from backend .env
$BackendEnv = Get-Content (Join-Path $Backend ".env") | Where-Object { $_ -match "^IPROG_|^SEMAPHORE_" }
foreach ($line in $BackendEnv) {
    $existing = Get-Content $NotifEnv
    $key = $line.Split('=')[0]
    if ($existing -notmatch "^$key=") {
        Add-Content $NotifEnv $line
        Write-Host "  Copied $key to notification-service .env" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Green
Write-Host ""

$Jobs = @()

# 1. auth-service (port 8001)
Write-Host "  [auth-service]         http://localhost:8001" -ForegroundColor White
$Jobs += Start-Process powershell -ArgumentList @(
    "-NoProfile", "-Command",
    "Set-Location '$Backend'; `$env:APP_URL='http://localhost:8001'; php artisan serve --port=8001 2>&1"
) -PassThru -WindowStyle Minimized

# 2. campaign-service (port 8002)
Write-Host "  [campaign-service]     http://localhost:8002" -ForegroundColor White
$Jobs += Start-Process powershell -ArgumentList @(
    "-NoProfile", "-Command",
    "Set-Location '$Backend'; `$env:APP_URL='http://localhost:8002'; php artisan serve --port=8002 2>&1"
) -PassThru -WindowStyle Minimized

# 3. content-service (port 8003)
Write-Host "  [content-service]      http://localhost:8003" -ForegroundColor White
$Jobs += Start-Process powershell -ArgumentList @(
    "-NoProfile", "-Command",
    "Set-Location '$Backend'; `$env:APP_URL='http://localhost:8003'; php artisan serve --port=8003 2>&1"
) -PassThru -WindowStyle Minimized

# 4. workflow-service (port 8004)
Write-Host "  [workflow-service]     http://localhost:8004" -ForegroundColor White
$Jobs += Start-Process powershell -ArgumentList @(
    "-NoProfile", "-Command",
    "Set-Location '$Backend'; `$env:APP_URL='http://localhost:8004'; php artisan serve --port=8004 2>&1"
) -PassThru -WindowStyle Minimized

# 5. notification-service (port 3001)
Write-Host "  [notification-service] http://localhost:3001" -ForegroundColor White
$Jobs += Start-Process powershell -ArgumentList @(
    "-NoProfile", "-Command",
    "Set-Location '$NotifSvc'; node src/index.js 2>&1"
) -PassThru -WindowStyle Minimized

# 6. frontend (port 5173)
Write-Host "  [frontend]             http://localhost:5173" -ForegroundColor White
$Jobs += Start-Process powershell -ArgumentList @(
    "-NoProfile", "-Command",
    "Set-Location '$Frontend'; npm run dev 2>&1"
) -PassThru -WindowStyle Minimized

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  All services started! Open: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "  Service URLs:" -ForegroundColor Gray
Write-Host "    Frontend:             http://localhost:5173" -ForegroundColor Gray
Write-Host "    Auth Service:         http://localhost:8001/api" -ForegroundColor Gray
Write-Host "    Campaign Service:     http://localhost:8002/api" -ForegroundColor Gray
Write-Host "    Content Service:      http://localhost:8003/api" -ForegroundColor Gray
Write-Host "    Workflow Service:     http://localhost:8004/api" -ForegroundColor Gray
Write-Host "    Notification Service: http://localhost:3001" -ForegroundColor Gray
Write-Host ""
Write-Host "  Close this window or press Ctrl+C to stop all services." -ForegroundColor Yellow
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

# Wait on Ctrl+C, kill all child processes
try {
    Wait-Process -Id ($Jobs | ForEach-Object { $_.Id }) -ErrorAction SilentlyContinue
} finally {
    Write-Host "Stopping all services..." -ForegroundColor Red
    $Jobs | ForEach-Object {
        if (-not $_.HasExited) { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
    }
}
