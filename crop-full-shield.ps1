Add-Type -AssemblyName System.Drawing
$srcPath = "d:\JOKI SKRIPSI\ABAY\DEVELOPER\bumdes-fe\assets\logo\LOGO_BTS_3.png"
$destPath1 = "d:\JOKI SKRIPSI\ABAY\DEVELOPER\bumdes-fe\assets\logo\shield-bts.png"
$destPath2 = "d:\JOKI SKRIPSI\ABAY\DEVELOPER\bumdes-fe\public\assets\logo\shield-bts.png"

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$shieldHeight = 1430
$shieldWidth = $src.Width

$cropRect = New-Object System.Drawing.Rectangle 0, 0, $shieldWidth, $shieldHeight
$shieldBmp = $src.Clone($cropRect, $src.PixelFormat)

$shieldBmp.Save($destPath1, [System.Drawing.Imaging.ImageFormat]::Png)
$shieldBmp.Save($destPath2, [System.Drawing.Imaging.ImageFormat]::Png)

$shieldBmp.Dispose()
$src.Dispose()
Write-Output "Perfect full shield cropped with entire tip intact!"
