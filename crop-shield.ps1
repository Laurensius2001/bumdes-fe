Add-Type -AssemblyName System.Drawing
$srcPath = "d:\JOKI SKRIPSI\ABAY\DEVELOPER\bumdes-fe\assets\logo\LOGO_BTS_3.png"
$destPath1 = "d:\JOKI SKRIPSI\ABAY\DEVELOPER\bumdes-fe\assets\logo\shield-bts.png"
$destPath2 = "d:\JOKI SKRIPSI\ABAY\DEVELOPER\bumdes-fe\public\assets\logo\shield-bts.png"

$src = [System.Drawing.Bitmap]::FromFile($srcPath)

# The shield ends around Y=1330 out of 1600 height.
# Let's find the exact bottom of the shield before the text gap.
# Between shield bottom tip and text there is a transparent gap around Y=1340..1380.
# Let's crop from Y=0 to Y=1350 with full width, or exact shield bounds:
$shieldHeight = 1350
$shieldWidth = $src.Width

$cropRect = New-Object System.Drawing.Rectangle 0, 0, $shieldWidth, $shieldHeight
$shieldBmp = $src.Clone($cropRect, $src.PixelFormat)

$shieldBmp.Save($destPath1, [System.Drawing.Imaging.ImageFormat]::Png)
$shieldBmp.Save($destPath2, [System.Drawing.Imaging.ImageFormat]::Png)

$shieldBmp.Dispose()
$src.Dispose()
Write-Output "Shield cropped cleanly!"
