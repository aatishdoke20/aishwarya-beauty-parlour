
Add-Type -AssemblyName System.Drawing;
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' };
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1);
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]90);

$files = @(
  'facial-treatment',
  'eyebrow-threading',
  'hairstyling-occasion',
  'bridal-makeup-application'
);

foreach ($f in $files) {
  $png = "f:\Aishwarya Parlour\images\$f.png";
  $jpg = "f:\Aishwarya Parlour\images\$f.jpg";
  if (Test-Path $png) {
    $img = [System.Drawing.Image]::FromFile($png);
    $img.Save($jpg, $codec, $encoderParams);
    $img.Dispose();
    Write-Output "Created $jpg";
  }
}
