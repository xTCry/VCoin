#! /bin/sh
if [ ! -d "./node_modules/auto-updater" ]; then
	npm i --loglevel=error
fi
if [ ! -f "./userconfig.json" ]; then
	mv ./userconfig.example.json ./userconfig.json
fi
if [ ! -f "./botconfig.json" ]; then
	mv ./botconfig.example.json ./botconfig.json
fi
node index.js
exit 0
