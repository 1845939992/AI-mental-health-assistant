# 统计 src 目录下 .js/.vue/.ts 文件的注释率
$srcPath = Join-Path $PSScriptRoot 'src'
$files = Get-ChildItem -Path $srcPath -Recurse -Include *.js,*.vue,*.ts

$totalNonEmpty = 0
$commentLines = 0

foreach ($file in $files) {
    $lines = Get-Content $file.FullName
    $inBlockComment = $false

    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed -eq '') { continue }
        $totalNonEmpty++

        if ($inBlockComment) {
            $commentLines++
            if ($trimmed -match '\*/') { $inBlockComment = $false }
            continue
        }

        if ($trimmed -match '^/\*') {
            $commentLines++
            if (-not ($trimmed -match '\*/')) { $inBlockComment = $true }
            continue
        }

        if ($trimmed -match '^//') {
            $commentLines++
        }
    }
}

$rate = if ($totalNonEmpty -eq 0) { 0 } else { [math]::Round($commentLines / $totalNonEmpty * 100, 2) }
Write-Host "文件数: $($files.Count)"
Write-Host "非空行数: $totalNonEmpty"
Write-Host "注释行数: $commentLines"
Write-Host "注释率: $rate%"
