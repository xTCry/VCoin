#! /bin/sh
if [ ! -d "./node_modules/auto-updater" ]; then
	npm i --loglevel=error
fi
node index.js
exit 0
