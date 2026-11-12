# Jalankan Backend FastAPI + Cloudflare Tunnel publik HTTPS
$root = $PSScriptRoot
Write-Host "Menjalankan Backend FastAPI di port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root\apps\api'; `$env:PYTHONPATH='$root\apps\api'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 2
Write-Host "Membuka Cloudflare Tunnel publik HTTPS..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit","-Command","npx.cmd cloudflared tunnel --url http://localhost:8000"
