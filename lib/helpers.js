const fs = require('fs'),
	colors = require('colors/safe'),
	ReadLine = require('readline'),
	GithubContent = require('github-content'),
	beep = require('beepbeep'),
	gradient = require('gradient-string');
const pJson = require('../package.json');

const _iLog = require("./iLog"),
	_izCap = require("./izCap"),
	{ Entity, Miner: _Miner } = require("./AntMiner");


// GitHub data
let GitCUpdate = new GithubContent({
	owner: 'xtcry',
	repo: 'vcoin',
	branch: 'master'
});

const StateCmd = {
	NONE: 0,
	ITEMS: 1,
	CONFIRM: 2,
	COLORS: 3,
	CUSTOM: 4,
};

const miner = new _Miner();
const formateScore = Entity.formateScore;


let checkUpdateTTL = null,
	askIn = false,
	askInTTL = null,
	onUpdatesCB = false,
	offColors = false,
	iLog = false,
	IZCap = false,
	_fullLog = false,

	_stateCmd = StateCmd.NONE, _stateCmd_CB;


// S
process.on('uncaughtException', err=> {
	console.log("\n*===*\nERR:");
	console.error(err);
	console.log("*===*\n");
});

colors.setTheme({
	dateBG: 'bgMagenta',
	dataC: 'yellow',
	warnBG: 'bgBlack',
	warn: 'yellow',
	errorBG: 'bgBlack',
	error: 'red'
});
function con(message, color, colorBG) {
	if(message === undefined) {
		console.log("\n")
		return;
	}
	let temp = (!offColors? colors.dateBG('['+dateF()+']'): dateF()) + ": "+ ccon(message, color, colorBG, 1);
	console.log(temp);
}
function ccon(message, color, colorBG, ret) {
	let temp="";
	if(message === undefined) {
		console.log("\n")
		return;
	}
	if(color === true) {
		color = "white";
		colorBG = "Red";
		temp = !offColors? colors.yellow.bgRed("[ОШИБКА]: "): "[ОШИБКА]: ";
	}
	colorBG = "bg"+ ((typeof colorBG == "string")?colorBG:"Black");
	color = (typeof color == "string")?color:"green";
	temp += !offColors? colors[colorBG](colors[color](message)): message;
	!ret && console.log(temp);
	return temp;
}
function dateF(date) {
	if(!isNaN(date) && date < 9900000000)
		date *= 1000; // UNIXto
	date = date!==undefined ? new Date(date) : new Date();
	
	var dYear = date.getFullYear(),
		dMonth = (date.getMonth() + 1).toString().padStart(2, 0),
		dDay = date.getDate().toString().padStart(2, 0),
		dHour = date.getHours().toString().padStart(2, 0),
		dMinutes = date.getMinutes().toString().padStart(2, 0),
		dSeconds = date.getSeconds().toString().padStart(2, 0),
		date_format = dDay +'.' +dMonth +'.' +dYear +' '+ dHour + ':' + dMinutes + ':' + dSeconds;
	
	return date_format;
}
function now() {
	return Math.floor(Date.now() / 1000);
}
function rand(min, max) {
	if(max===undefined) {
		max=min; min=0;
	}
	return Math.floor(min + Math.random() * (max + 1 - min));
}
function setTitle(title) {
	if (process.platform == 'win32') {
		process.title = title;
	} else {
		process.stdout.write('\x1b]2;' + title + '\x1b\x5c');
	}
}
function declOfNum(number, titles) {  
	cases = [2, 0, 1, 1, 1, 2];
	return titles[ (number%100>4 && number%100<20)? 2: cases[(number%10<5)? number%10: 5] ];
}
function declOfCoin(e) {
	return declOfNum(e, [ "коин", "коина", "коинов" ]);
}
function onlyInt(e) {
	return parseInt(e.toString().replace(/\D+/g,""));
}
function safeStr(t, n, s) {
	t = t.toString();
	let m = t.length;
	n = n || m>6? m/3: 5
	s = s || m - n;
	return t.slice(0, s) + '*'.repeat(n);
}
function safeStr2(t, n, s) {
	t = t.toString();
	let m = t.length;
	n = n || m/3;
	s = s || m - n;
	return t.slice(0, m-s) + '*'.repeat(n)+t.slice(s, m);
}
function setColorsM(e) {
	offColors = !!e;
}
function fullLog(e) {
	if(e !== undefined) _fullLog = e;
	return _fullLog;
}
function stateCmd(s, cb) {
	if(s !== undefined) _stateCmd = s;
	return _stateCmd_CB = cb, _stateCmd;
}
function requireUncached(module) {
	delete require.cache[require.resolve(module)];
	return require(module);
}
// End.


// ReadLine
let rl = ReadLine.createInterface(process.stdin, process.stdout, completer);
rl.setPrompt(colors.grey('_> '));
rl.prompt();
rl.isQst = false;
rl.questionAsync = (question) => {
	return new Promise((resolve) => {
		rl.isQst = true;
		rl.question(question, _=> {
			rl.isQst = false; resolve(_);
		});
	});
};
rl._writeToOutput = (s)=> {
	rl.output.write(rl.hideMode && !(/^\s*$/.test(s))? "*": s);
};
function completer(line) {
	let completions = getCurCompletions();
	let hits = completions.filter(c=> (c.indexOf(line) == 0 && (!_stateCmd_CB || _stateCmd_CB(c) )) );
	return [ hits && hits.length? hits: completions, line ];
}
function getCurCompletions() {
	const listCMDs = [
		"history, coins, stop, run, buy",
		" tran, price, hideupd, autoBuy", /*color, */
		" autoBuyItem, smartBuy, tspam, beep",
		" debug, datecolorbg, token, to",
		" info, gid, tx, mkey, ginfo"
	].join(",");

	let temp = _stateCmd == StateCmd.NONE? listCMDs:
		  _stateCmd == StateCmd.ITEMS? "cursor, cpu, cpu_stack, computer, server_vk, quantum_pc, datacenter":
		  _stateCmd == StateCmd.COLORS? "black, red, green, yellow, blue, magenta, cyan, white":
		  _stateCmd == StateCmd.CONFIRM? "yes": /*, no*/
		  _stateCmd == StateCmd.CUSTOM && _stateCmd_CB? _stateCmd_CB():
		  "";
	return temp.replace(/,/g, "").split(' ');
}
// End.


// Check Updates on GitHub
function checkUpdates() {
	GitCUpdate.files([ 'package.json' ], (err, results)=> {
		if (err) return;
		results.forEach(file=> {
			let c = file.contents.toString();
			if (c[0] === "{") {
				let data = JSON.parse(c);
				
				let msg = (data.version > pJson.version)? "Доступно обновление! -> github.com/xTCry/VCoin \t["+(data.version +"/"+ pJson.version)+"]":
							// (data.version != pJson.version)? "Версии различаются! Проверить -> github.com/xTCry/VCoin \t["+(data.version +"/"+ pJson.version)+"]":
							false;
				if(msg) {
					if(onUpdatesCB) onUpdatesCB(msg);
					else con(msg, "white", "Red");
				}
			}
		});
	});
}
checkUpdateTTL = setInterval(checkUpdates, 1e7);
checkUpdates();
// End.


async function askDonate(vc, trsum, ID) {
	if(askIn) return;
	askIn = true;

	setTimeout(_=> {
		askIn = false;
	}, 18e6);

	let res = await rl.questionAsync("Задонатить ["+formateScore(trsum, true)+"] разрабу [yes или 1 - для подтверждения]: ");
	if(res != "yes" || res != "y" || res != "1") return con("Okay.. (^", true);

	try {
		await vc.transferToUser(ID, trsum);
		con("Успешный перевод. Спасибо (:", "black", "Green");
	} catch(e) {
		con("Hе удалось перевести ):", true);
	}
}



// Init izCap
function initIZCap(uid) {
	IZCap = new _izCap("./data/configs/", uid, false, false);
}
async function configSet(name, value, save) {
	try {
		return await IZCap.set(name, value, save, fullLog());
	} catch(e) {
		con("Не получилось сохранить. " + e.message);
	}
	return false;
}
function configGet(name, def) {
	return IZCap.get(name, def);
}
async function scanConfigs() {
	try {
		return await _izCap.scan("./data/configs/");
	} catch (e) { throw e; }
}
// End.

// Init iLog
function initILog(uid) {
	iLog = new _iLog(uid, "data/log");
}
async function infLog(data, color, colorBG) {
	if(!iLog)
		throw "iLog not initialized.";
	return await iLog.log(data, color, colorBG)
}
// End.


// Asyn FS
function existsFile(f) {
	return fs.existsSync(f);
}
function existsAsync(path) {
	return new Promise( (resolve, reject)=> fs.exists(path, exists=> resolve(exists)) );
}
function writeFileAsync(path, data) {
	return new Promise( (resolve, reject)=> fs.writeFile(path, data, err=> resolve(err)) );
}
function appendFileAsync(path, data) {
	return new Promise( (resolve, reject)=> fs.appendFile(path, data, err=> resolve(err)) );
}
function mkdirAsync(path) {
	return new Promise( (resolve, reject)=> {

		try {
			path = path.replace(/\/$/, '').split('/');
			for (var i = 1; i <= path.length; i++) {
				var segment = path.slice(0, i).join('/');
				(segment.length > 0 && !fs.existsSync(segment)) ? fs.mkdirSync(segment) : null ;
			}
		} catch(e) { }

		resolve();
	});
}
// End.

// For reset title
process.stdin.resume();
process.on('SIGINT', function () {
	setTitle("VCoin closed...");
	ccon("Выходим...");
	process.exit(2);
});

global._h = module.exports = {
	rl, declOfCoin, declOfNum,
	con, ccon, dateF,
	setColorsM, offColors,
	checkUpdates, checkUpdateTTL,
	onUpdates: cb=> (onUpdatesCB=cb, true),
	askDonate,

	existsFile,
	existsAsync,
	writeFileAsync,
	appendFileAsync,
	IZCap: _=>IZCap, initIZCap,
	configSet, configGet, scanConfigs,
	infLog, initILog,
	rand, now,
	setTitle, beep,
	onlyInt, safeStr, safeStr2,
	pJson,
	fullLog,

	miner, Entity,
	formateScore,
	colors, StateCmd, stateCmd,
	requireUncached,
}

