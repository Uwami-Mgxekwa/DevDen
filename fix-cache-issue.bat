@echo off
echo ========================================
echo   DevDen CSS Cache Fix Utility
echo ========================================
echo.

echo This script will help fix the CSS caching issue you're experiencing.
echo.

echo STEP 1: Clear your browser cache manually:
echo ----------------------------------------
echo Chrome/Edge: Press Ctrl+Shift+Delete, select "Cached images and files", click Clear
echo Firefox: Press Ctrl+Shift+Delete, select "Cache", click Clear
echo.
echo OR try a hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
echo.

echo STEP 2: Open in Incognito/Private mode to test
echo ---------------------------------------------
echo This bypasses cache entirely and shows current files
echo.

echo STEP 3: If problem persists, the CSS files have been updated with cache-busting
echo ---------------------------------------------------------------------------
echo The CSS links now include version numbers (e.g., ?v=1.1) to force reload
echo.

echo CURRENT STATUS:
echo ===============
echo ✓ All button colors have been standardized to black/white theme
echo ✓ Cache-busting version numbers added to key pages
echo ✓ Files updated: index.html, home.html, badges.html
echo.

echo PAGES WITH CONSISTENT BLACK BUTTONS:
echo ====================================
echo ✓ Home (css/home.css)
echo ✓ Profile (css/profile.css) 
echo ✓ Forum (css/forum.css)
echo ✓ Events (css/events.css)
echo ✓ Projects (css/projects.css)
echo ✓ About (css/about.css)
echo ✓ Contact (css/contact.css)
echo ✓ Resources (css/resources.css)
echo ✓ Settings (css/settings.css)
echo.

echo BUTTON BEHAVIOR:
echo ===============
echo Light Mode: Black background, white text
echo Dark Mode: White background, black text
echo Hover: Slightly lighter shade with animation
echo.

echo If you still see green buttons after clearing cache:
echo 1. Try opening the page in incognito/private mode
echo 2. Check if you're looking at the right page
echo 3. Ensure you're not using an old bookmark
echo.

pause