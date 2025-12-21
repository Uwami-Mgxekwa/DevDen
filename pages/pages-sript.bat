@echo off
REM === Create DevDen pages folder and HTML files ===

REM Make sure we're inside the DevDen project root
mkdir pages

cd pages

REM Create all the HTML files
echo > home.html
echo > profile.html
echo > forum.html
echo > resources.html
echo > events.html
echo > projects.html
echo > badges.html
echo > settings.html
echo > about.html
echo > contact.html

echo Pages folder and HTML files created successfully!
pause