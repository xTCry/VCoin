/*
	File: Updater.js
	Description: Update app files
	Created by: xTCry
	Date: 10.04.2019 02:49
*/

const AutoUpdater = require('auto-updater'),
	{ execSync } = require('child_process');

/*execSync('npm i --only=prod --no-audit --no-progress', { cwd: __dirname }, { stdio: 'inherit' })

let autoupdater = new AutoUpdater({
	pathToJson: '',
	autoupdate: false,
	checkgit: true,
	jsonhost: 'raw.githubusercontent.com',
	contenthost: 'codeload.github.com',
	progressDebounce: 0,
	devmode: false
});*/

