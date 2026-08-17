Add-Type -AssemblyName System.Drawing
$srcPath = "d:\JOKI SKRIPSI\ABAY\DEVELOPER\bumdes-fe\assets\logo\LOGO_BTS_3.png"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

# Let's inspect column X = middle of the shield ($src.Width / 2 = 776)
$midX = [int]($src.Width / 2)

for ($y = 1200; $y -lt $src.Height; $y += 5) {
    $p = $src.GetPixel($midX, $y)
    Write-Output "Y=$y : A=$($p.A), R=$($p.R), G=$($p.G), B=$($p.B)"
}
$src.Dispose()
