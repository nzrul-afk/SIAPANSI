# Jalankan API (8000) dan web (5173) tanpa Docker. Buka http://localhost:5173
$root = $PSScriptRoot
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root\apps\api'; `$env:PYTHONPATH='$root\apps\api'; python -m uvicorn app.main:app --port 8000"
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root\apps\web'; npm.cmd install; npm.cmd run dev"
