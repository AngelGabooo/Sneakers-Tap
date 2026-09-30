# print-label.ps1
# Imprime una imagen PNG/JPG en una impresora de etiquetas (Brother QL-800).
# IMPORTANTE: NO se define PaperSize aquí porque el driver ya tiene
# configurado el rollo continuo (62mm x 29mm). Definirlo por código rompe
# la impresión (sale en blanco).

param(
    [Parameter(Mandatory=$true)][string]$ImagePath,
    [Parameter(Mandatory=$true)][string]$PrinterName
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $ImagePath)) {
    Write-Error "No existe el archivo: $ImagePath"
    exit 1
}

$img = [System.Drawing.Image]::FromFile($ImagePath)

$doc = New-Object System.Drawing.Printing.PrintDocument
$doc.PrinterSettings.PrinterName = $PrinterName

if (-not $doc.PrinterSettings.IsValid) {
    Write-Error "Impresora no válida: $PrinterName"
    $img.Dispose()
    exit 1
}

# Sin márgenes (esto sí funciona en todos los drivers)
$doc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(0, 0, 0, 0)

# ⚠️ NO tocar DefaultPageSettings.PaperSize → el driver usa el suyo
# ⚠️ NO tocar Landscape → respetar el driver

# Handler que dibuja la imagen a página completa
$drawHandler = {
    param($sender, $e)
    $e.Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $e.Graphics.DrawImage(
        $img,
        $e.PageBounds.X,
        $e.PageBounds.Y,
        $e.PageBounds.Width,
        $e.PageBounds.Height
    )
    $e.HasMorePages = $false
}

$doc.add_PrintPage($drawHandler)

try {
    $doc.Print()
    Write-Host "OK"
    exit 0
} catch {
    Write-Error $_.Exception.Message
    exit 1
} finally {
    $doc.remove_PrintPage($drawHandler)
    $img.Dispose()
    $doc.Dispose()
}