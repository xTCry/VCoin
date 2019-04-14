/*
	File: Overseer.js
	Description: Overseer application
	Created by: xTCry
	Date: 08.04.2019 21:17
	Idea from @TemaSM
*/

const AutoUpdater = require('auto-updater'),
	{ execSync } = require('child_process'),
	execAsync = require('await-exec'),
	Sentry = require('@sentry/node'),
	os = require('os');

(async () => {
	Sentry.init({
		dsn: 'https://985ddedffc9f48ed98f73d0127177293@sentry.io/1435736',
		sampleRate: 1,
		debug: true,
	});

	Sentry.configureScope(scope => {
		const info = {
			username: os.userInfo().username + '@' + os.hostname(),
			os_type: os.type(),
			os_platform: os.platform(),
			os_arch: os.arch(),
			os_release: os.release(),
			os_totalmem: (os.totalmem() / 1024 / 1024).toFixed(2),
			os_cpus: String(os.cpus().length),
			argv: process.argv.join(' '),
		};
		scope.setUser(info);
		process.on('uncaughtException', function (err) {
			Sentry.captureException(err);
		});
	});
})();


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

