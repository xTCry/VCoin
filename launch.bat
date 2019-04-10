@ECHO OFF

IF NOT EXIST ./node_modules/safe-eval (npm i --loglevel=error) else (echo Node.JS Modules Installed.)
title VKCoin - Batch Script by X mod

node . -slist

echo Miner was stopped
pause