# Washa server ya DEMO (backend/demo.sqlite3) ili kujaribu APK kwenye simu.
# Tumia:  cd backend;  powershell -ExecutionPolicy Bypass -File .\run_demo.ps1 [-Reset] [-Port 8010]
param(
    [switch]$Reset,
    [int]$Port = 8010
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
$env:DATABASE_URL = "sqlite:///demo.sqlite3"
$python = ".\venv\Scripts\python.exe"

& $python manage.py migrate -v 0
if ($Reset -or -not (Test-Path "demo.sqlite3")) {
    & $python manage.py seed_demo --reset
} else {
    & $python manage.py seed_demo
}

$ips = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
    Select-Object -ExpandProperty IPAddress

Write-Host ""
Write-Host "Server ya demo inawaka kwenye port $Port" -ForegroundColor Green
Write-Host "Kwenye APK: Login -> 'Server' -> weka mojawapo ya hizi (simu iwe kwenye WiFi moja na kompyuta):"
foreach ($ip in $ips) { Write-Host "   $($ip):$Port" -ForegroundColor Yellow }
Write-Host "Akaunti: demo_admin / demo_jimbo / demo_mtaa / demo_kanisa / demo_viewer  (nenosiri: Demo@2026)"
Write-Host "Kama simu haifiki server, ruhusu port kwenye Windows Firewall (PowerShell ya Admin):"
Write-Host "   New-NetFirewallRule -DisplayName 'YESAYA Demo' -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow"
Write-Host ""

& .\venv\Scripts\waitress-serve.exe --listen=0.0.0.0:$Port backend.wsgi:application
