@ECHO OFF

IF NOT EXIST ./node_modules/safe-eval (npm i --only=prod --no-audit --no-progress --loglevel=error) else (echo Node.JS Modules Installed.)
title VKCoin - Batch Script by X mod

node . -slist

echo Miner was stopped
pause