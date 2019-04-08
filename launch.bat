@echo off
IF NOT EXIST ./node_modules/open (npm i --loglevel=error) else (echo Node.JS Modules Installed.)
title VKCoinX - Batch Script
node index.js
echo Bot was forced to exit . . .
pause
)