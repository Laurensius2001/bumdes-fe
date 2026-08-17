Add-Type -AssemblyName System.Drawing
$srcPath = "d:\JOKI SKRIPSI\ABAY\DEVELOPER\bumdes-fe\assets\logo\LOGO BUMDES TIRTA SEJAHTERA 3.png"
$srcImg = [System.Drawing.Bitmap]::FromFile($srcPath)

# We want a 600x150 banner for expanded sidebar and 120x120 for collapsed sidebar
# First let's inspect where the non-transparent pixels are (bounding box)
$minX = $srcImg.Width
$minY = $srcImg.Height
$maxX = 0
$maxY = 0

# Sample every 10 pixels for fast bounding box
for ($x = 0; $x -lt $srcImg.Width; $x += 10) {
    for ($y = 0; $y -lt $srcImg.Height; $y += 10) {
        $p = $srcImg.GetPixel($x, $y)
        if ($p.A -gt 30) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Bounding box: X=$minX..$maxX, Y=$minY..$maxY (Size: $($maxX-$minX) x $($maxY-$minY))"
$srcImg.Dispose()
