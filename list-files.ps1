Get-ChildItem -Path src -Recurse -Include *.js,*.vue,*.ts |
  Select-Object Name, @{N='Lines';E={(Get-Content $_.FullName | Where-Object { $_.Trim() -ne '' }).Count}} |
  Sort-Object Lines -Descending |
  Format-Table -AutoSize
