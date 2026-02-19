$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Set-Location "D:\AI Code Projects\250 acts of service"
git init 2>&1
git add -A 2>&1
git commit -m "Checkpoint before design refinement - green/gold theme with dual thermometers" 2>&1 | Out-File -FilePath "D:\AI Code Projects\250 acts of service\git_output.txt" -Encoding utf8
