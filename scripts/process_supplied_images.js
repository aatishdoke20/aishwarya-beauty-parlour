const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = 'f:\\Aishwarya Parlour\\images';

const imageMap = {
  'facial-treatment.png': 'supplied-temp-1.png',
  'eyebrow-threading.png': 'supplied-temp-2.png',
  'hairstyling-occasion.png': 'supplied-temp-3.png',
  'bridal-makeup-application.png': 'supplied-temp-4.png'
};

for (const [destName, srcTemp] of Object.entries(imageMap)) {
  const src = path.join(targetDir, srcTemp);
  const dest = path.join(targetDir, destName);
  fs.copyFileSync(src, dest);
  console.log(`Saved: ${destName}`);
}

// Convert all to high-quality web-friendly JPG
const psScript = `
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
  $png = "f:\\Aishwarya Parlour\\images\\$f.png";
  $jpg = "f:\\Aishwarya Parlour\\images\\$f.jpg";
  if (Test-Path $png) {
    $img = [System.Drawing.Image]::FromFile($png);
    $img.Save($jpg, $codec, $encoderParams);
    $img.Dispose();
    Write-Output "Created $jpg";
  }
}
`;

fs.writeFileSync('f:\\Aishwarya Parlour\\scripts\\convert_all.ps1', psScript);
execSync('powershell -ExecutionPolicy Bypass -File "f:\\Aishwarya Parlour\\scripts\\convert_all.ps1"', { stdio: 'inherit' });

console.log('All images organized and optimized.');
