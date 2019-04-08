#! /bin/sh
if [ ! -d "./node_modules/open" ]; then
	npm i
fi
node index.js
exit 0