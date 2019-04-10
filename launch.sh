#! /bin/sh
if [ ! -d "./node_modules/auto-updater" ]; then
  npm i --only=prod --no-audit --no-progress --loglevel=error
fi
if [ ! -f "./userconfig.json" ]; then
  cp ./userconfig.example.json ./userconfig.json
fi
if [ ! -f "./botconfig.json" ]; then
  cp ./botconfig.example.json ./botconfig.json
fi
node index.js
exit 0
