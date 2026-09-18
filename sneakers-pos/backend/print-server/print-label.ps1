# print-label.ps1
# Imprime una imagen PNG/JPG en una impresora de etiquetas (Brother QL-800)
# usando el driver oficial de Windows + System.Drawing.Printing

param(
    [Parameter(Mandatory=$true)][string]$ImagePath,
    [Parameter(Mandatory=$true)][string]$PrinterName,

    # Tamaño de etiqueta en centésimas de pulgada (1/100 in)
    # DK-1201 = 29mm x 90mm  =>  1.1417in x 3.5433in  =>  114 x 354
    [int]$PaperWidth  = 114,
    [int]$PaperHeight = 354,

    # Orientación. DK-1201 en QL-800 se imprime "acostada" (landscape)
    [switch]$Landscape
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $ImagePath)) {
    Write-Error "No existe el archivo: $ImagePath"
    exit 1
}

$img = [System.Drawing.Image]::FromFile($ImagePath)

$doc = New-Object System.Drawing.Printing.PrintDocument
$doc.PrinterSettings.PrinterName = $PrinterName

# Verificar que la impresora existe
if (-not $doc.PrinterSettings.IsValid) {
    Write-Error "Impresora no válida: $PrinterName"
    $img.Dispose()
    exit 1
}

# Sin márgenes
$doc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(0, 0, 0, 0)

# Orientación
$doc.DefaultPageSettings.Landscape = [bool]$Landscape

# Tamaño de papel personalizado (DK-1201)
try {
    $doc.DefaultPageSettings.PaperSize = New-Object System.Drawing.Printing.PaperSize(
        "DK-1201",
        $PaperWidth,
        $PaperHeight
    )
} catch {
    Write-Warning "No se pudo asignar PaperSize personalizado: $_"
}

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