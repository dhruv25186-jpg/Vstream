@echo off
echo ===================================================
echo Starting VStream Local Server...
echo ===================================================
echo.
echo Opening browser at http://localhost:8000 ...
start http://localhost:8000/index.html
echo.
echo Server is running! Keep this window open while testing.
echo Press Ctrl+C to stop the server.
echo.
python -m http.server 8000
pause
