Add-Type -AssemblyName System.Drawing
$inputFile = "f:\Aishwarya Parlour\images\bridal-hero.png"
$outputFile = "f:\Aishwarya Parlour\images\bridal-hero.jpg"

if (Test-Path $inputFile) {
    $img = [System.Drawing.Image]::FromFile($inputFile)
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]92)
    $img.Save($outputFile, $codec, $encoderParams)
    $img.Dispose()
    Write-Output "Optimized JPG created: $outputFile"
    
    # Also create a mobile/tablet scaled version (e.g. width 960)
    $img2 = [System.Drawing.Image]::FromFile($inputFile)
    $w = 960
    $h = [int]($img2.Height * ($w / $img2.Width))
    $thumb = New-Object System.Drawing.Bitmap $w, $h
    $graph = [System.Drawing.Graphics]::FromImage($thumb)
    $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graph.DrawImage($img2, 0, 0, $w, $h)
    $thumb.Save("f:\Aishwarya Parlour\images\bridal-hero-960w.jpg", $codec, $encoderParams)
    $graph.Dispose()
    $thumb.Dispose()
    $img2.Dispose()
    Write-Output "Responsive 960w JPG created"
} else {
    Write-Error "Input file not found"
}
