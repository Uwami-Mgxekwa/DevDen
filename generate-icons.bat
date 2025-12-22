@echo off
echo DevDen Icon Generator
echo ====================
echo.
echo This script will help you generate all required icon sizes from your devden.PNG
echo.
echo REQUIREMENTS:
echo - ImageMagick (download from: https://imagemagick.org/script/download.php#windows)
echo - Your devden.PNG file should be at least 512x512 pixels for best quality
echo.
echo INSTRUCTIONS:
echo 1. Install ImageMagick
echo 2. Place this script in your project root
echo 3. Run this script
echo.
pause

REM Check if ImageMagick is installed
magick -version >nul 2>&1
if errorlevel 1 (
    echo ERROR: ImageMagick not found!
    echo Please install ImageMagick from: https://imagemagick.org/script/download.php#windows
    pause
    exit /b 1
)

echo Generating icons from assets/devden.PNG...
echo.

REM Create favicon sizes
magick assets/devden.PNG -resize 16x16 assets/favicon-16x16.png
magick assets/devden.PNG -resize 32x32 assets/favicon-32x32.png
magick assets/devden.PNG -resize 48x48 assets/favicon-48x48.png

REM Create ICO file
magick assets/devden.PNG -resize 32x32 assets/favicon.ico

REM Create Apple Touch Icons
magick assets/devden.PNG -resize 57x57 assets/apple-touch-icon-57x57.png
magick assets/devden.PNG -resize 60x60 assets/apple-touch-icon-60x60.png
magick assets/devden.PNG -resize 72x72 assets/apple-touch-icon-72x72.png
magick assets/devden.PNG -resize 76x76 assets/apple-touch-icon-76x76.png
magick assets/devden.PNG -resize 114x114 assets/apple-touch-icon-114x114.png
magick assets/devden.PNG -resize 120x120 assets/apple-touch-icon-120x120.png
magick assets/devden.PNG -resize 144x144 assets/apple-touch-icon-144x144.png
magick assets/devden.PNG -resize 152x152 assets/apple-touch-icon-152x152.png
magick assets/devden.PNG -resize 180x180 assets/apple-touch-icon-180x180.png

REM Create Android Chrome Icons
magick assets/devden.PNG -resize 192x192 assets/android-chrome-192x192.png
magick assets/devden.PNG -resize 512x512 assets/android-chrome-512x512.png

REM Create Microsoft Tiles
magick assets/devden.PNG -resize 70x70 assets/mstile-70x70.png
magick assets/devden.PNG -resize 144x144 assets/mstile-144x144.png
magick assets/devden.PNG -resize 150x150 assets/mstile-150x150.png
magick assets/devden.PNG -resize 310x150 assets/mstile-310x150.png
magick assets/devden.PNG -resize 310x310 assets/mstile-310x310.png

echo.
echo ✅ All icons generated successfully!
echo.
echo Generated files:
echo - Favicons: 16x16, 32x32, 48x48, favicon.ico
echo - Apple Touch Icons: 57x57 to 180x180
echo - Android Chrome: 192x192, 512x512
echo - Microsoft Tiles: 70x70 to 310x310
echo.
echo Your DevDen app is now ready for all devices! 🚀
pause