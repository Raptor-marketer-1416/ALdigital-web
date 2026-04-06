@echo off
echo ========================================
echo   Publicando ALdigital-web a Cloudflare
echo ========================================
echo.

set CLOUDFLARE_API_TOKEN=NLn0L2ooM-Q-ENTapCz-ABycp8S5h-be4MSfMvr5
set CLOUDFLARE_ACCOUNT_ID=598d12c266f77cf364564d086167f79f

npx wrangler pages deploy . --project-name=aldigital-web --commit-dirty=true

echo.
echo ========================================
echo   Deploy completado
echo   URL: https://aldigital-web.pages.dev
echo ========================================
pause
