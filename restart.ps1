$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Set-Location "D:\AI Code Projects\250 acts of service"

# Kill any running Next.js dev server
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Remove the .next cache directory
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "Cleared .next cache"
}

# Restart dev server
npm run dev 2>&1
