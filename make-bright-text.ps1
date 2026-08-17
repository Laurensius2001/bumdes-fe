Add-Type -AssemblyName System.Drawing
$srcPath = "d:\JOKI SKRIPSI\ABAY\DEVELOPER\bumdes-fe\assets\logo\LOGO_BTS_3.png"
$destPath1 = "d:\JOKI SKRIPSI\ABAY\DEVELOPER\bumdes-fe\assets\logo\logo-bts-bright.png"
$destPath2 = "d:\JOKI SKRIPSI\ABAY\DEVELOPER\bumdes-fe\public\assets\logo\logo-bts-bright.png"

$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$newBmp = New-Object System.Drawing.Bitmap $bmp.Width, $bmp.Height

# The image is 1553x1600.
# The bottom text "BTS SODONG NET" is located in the bottom ~16% of height (Y > 1350)
$textStartY = [int]($bmp.Height * 0.84)

for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.A -gt 25) {
            if ($y -ge $textStartY) {
                # Turn text into clean bright white
                $newColor = [System.Drawing.Color]::FromArgb($p.A, 255, 255, 255)
            } else {
                $newColor = $p
            }
            $newBmp.SetPixel($x, $y, $newColor)
        } else {
            $newBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

$newBmp.Save($destPath1, [System.Drawing.Imaging.ImageFormat]::Png)
$newBmp.Save($destPath2, [System.Drawing.Imaging.ImageFormat]::Png)

$newBmp.Dispose()
$bmp.Dispose()
Write-Output "Bright text logo created successfully!"
