$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Set-Location "D:\AI Code Projects\250 acts of service"
node seed.mjs 2>&1 | Out-File -FilePath "D:\AI Code Projects\250 acts of service\seed_output.txt" -Encoding utf8
Add-Content -Path "D:\AI Code Projects\250 acts of service\seed_output.txt" -Value "`nSEED EXIT CODE: $LASTEXITCODE"
