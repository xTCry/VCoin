#! /bin/sh
if [ ! -d "./node_modules/safe-eval" ]; then
	npm i --only=prod --no-audit --no-progress --loglevel=error
fi

node . -slist

exit 0