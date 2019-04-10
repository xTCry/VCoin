#! /bin/sh
if [ ! -d "./node_modules/safe-eval" ]; then
	npm i
fi

node . -slist

exit 0