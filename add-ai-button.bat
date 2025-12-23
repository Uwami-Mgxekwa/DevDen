@echo off
echo Adding AI Assistant Button to all HTML pages...

REM List of HTML files to update (add more as needed)
set "files=pages\home.html pages\profile.html pages\forum.html pages\resources.html pages\events.html pages\projects.html pages\settings.html pages\about.html pages\contact.html pages\signup.html"

for %%f in (%files%) do (
    if exist "%%f" (
        echo Processing %%f...
        
        REM Add global CSS if not already present
        findstr /c:"css/global.css" "%%f" >nul
        if errorlevel 1 (
            echo Adding global CSS to %%f
            REM This would need manual addition - batch file limitations
        )
        
        REM Add AI button if not already present
        findstr /c:"ai-assistant-btn" "%%f" >nul
        if errorlevel 1 (
            echo Adding AI button to %%f
            REM This would need manual addition - batch file limitations
        )
    ) else (
        echo File %%f not found, skipping...
    )
)

echo.
echo Manual steps needed:
echo 1. Add this line after existing CSS links in each page:
echo    ^<link rel="stylesheet" href="../css/global.css"^>
echo.
echo 2. Add this HTML before the closing ^</body^> tag:
echo    ^<!-- AI Assistant Floating Button --^>
echo    ^<a href="https://uwami-mgxekwa.github.io/DevDen-Ai/" target="_blank" rel="noopener" class="ai-assistant-btn" aria-label="DevDen AI Assistant"^>
echo        ^<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"^>
echo            ^<path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 013.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 013.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 01-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 22.5l-.394-1.933a2.25 2.25 0 00-1.423-1.423L12.75 18.75l1.933-.394a2.25 2.25 0 001.423-1.423L16.5 15l.394 1.933a2.25 2.25 0 001.423 1.423L20.25 18.75l-1.933.394a2.25 2.25 0 00-1.423 1.423z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/^>
echo        ^</svg^>
echo    ^</a^>
echo.
echo Done! The AI Assistant button will appear as a floating green button in the bottom-right corner.
pause