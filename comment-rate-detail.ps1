$srcPath = Join-Path $PSScriptRoot 'src'
$files = Get-ChildItem -Path $srcPath -Recurse -Include *.js,*.vue,*.ts | Sort-Object FullName

$grandTotal = 0
$grandComment = 0

foreach ($file in $files) {
    $lines = Get-Content $file.FullName
    $total = 0
    $comments = 0
    $inBlock = $false

    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed -eq '') { continue }
        $total++

        if ($inBlock) {
            $comments++
            if ($trimmed -match '\*/') { $inBlock = $false }
            continue
        }

        if ($trimmed -match '^/\*') {
            $comments++
            if (-not ($trimmed -match '\*/')) { $inBlock = $true }
            continue
        }

        if ($trimmed -match '^//') { $comments++ }
    }

    $rate = if ($total -eq 0) { 0 } else { [math]::Round($comments / $total * 100, 2) }
    $grandTotal += $total
    $grandComment += $comments

    [PSCustomObject]@{
        Name = $file.Name
        Total = $total
        Comments = $comments
        Rate = "$rate%"
    }
}

$totalRate = if ($grandTotal -eq 0) { 0 } else { [math]::Round($grandComment / $grandTotal * 100, 2) }
Write-Host "`n总计: 非空 $grandTotal, 注释 $grandComment, 注释率 $totalRate%"
