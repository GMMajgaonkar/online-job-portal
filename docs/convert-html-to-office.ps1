$docsPath = "E:\job portal\JOB-PORTAL\docs"
$files = @(
    "01_PROJECT_REPORT",
    "02_GEMINI_DIAGRAM_PROMPTS",
    "03_SRS_SHORT"
)

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
} catch {
    Write-Error "Microsoft Word is not installed. Install Word or use the HTML files and open in browser -> Print to PDF."
    exit 1
}

foreach ($base in $files) {
    $htmlPath = Join-Path $docsPath "$base.html"
    $docxPath = Join-Path $docsPath "$base.docx"
    $pdfPath  = Join-Path $docsPath "$base.pdf"

  if (-not (Test-Path $htmlPath)) {
        Write-Warning "Missing: $htmlPath"
        continue
    }

    Write-Host "Converting $base ..."

    $doc = $word.Documents.Open($htmlPath, $false, $true)
    $doc.SaveAs2($docxPath, 16)   # wdFormatXMLDocument (.docx)
    $doc.ExportAsFixedFormat($pdfPath, 17) # PDF
    $doc.Close($false)
    Write-Host "  -> $docxPath"
    Write-Host "  -> $pdfPath"
}

$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
Write-Host "Done."
