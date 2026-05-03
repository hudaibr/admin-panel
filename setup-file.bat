@echo off

echo Creating folder structure...

mkdir app
mkdir app\login
mkdir app\api\admin\actions
mkdir lib

echo Creating empty files...

type nul > app\page.js
type nul > app\login\page.js
type nul > app\api\admin\actions\route.js

type nul > lib\supabaseClient.js
type nul > lib\supabaseAdmin.js

type nul > .env.local

echo Done.
pause