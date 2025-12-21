@echo off
REM === Create DevDen project structure ===

REM Root files
echo > index.html
echo > README.md
echo > .gitattributes
echo > .gitignore
echo > LICENSE
echo {} > tsconfig.json
echo {} > tailwind.config.js
echo {} > postcss.config.js

REM Public folder
mkdir public
echo > public\favicon.ico
echo > public\logo.svg

REM Source folders
mkdir src
mkdir src\styles
mkdir src\ts
mkdir src\ts\components
mkdir src\assets

REM Source files
echo /* Tailwind input */ > src\styles\tailwind.css
echo // Entry script > src\ts\main.ts
echo // API calls to Back4App > src\ts\api.ts
echo // Reusable components > src\ts\components\example.ts

REM Dist folder (compiled output)
mkdir dist
echo > dist\index.html
echo > dist\styles.css
echo > dist\main.js

echo Project structure created successfully!
pause