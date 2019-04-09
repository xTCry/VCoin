@echo off
IF NOT EXIST ./node_modules/open (npm i --loglevel=error)
IF NOT EXIST ./userconfig.json (RENAME "./userconfig.example.json" "userconfig.json")
IF NOT EXIST ./botconfig.json (RENAME "./botconfig.example.json" "botconfig.json")
title VKCoinX - Batch Script
node index.js
echo Bot was forced to exit . . .
pause
)