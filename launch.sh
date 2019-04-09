#! /bin/sh
if [ ! -d "./node_modules/open" ]; then
	npm i --loglevel=error
fi
node index.js
exit 0
