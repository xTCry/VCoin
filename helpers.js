const fs = require('fs'),
	colors = require('colors/safe'),
	ReadLine = require('readline'),
	GithubContent = require('github-content'),
	beep = require('beepbeep');
const pJson = require('./package.json');

// GitHub data
let GitCUpdate = new GithubContent({
	owner: 'xtcry',
	repo: 'vcoin',
	branch: 'master'
});

let checkUpdateTTL = null,
	askIn = false,
	askInTTL = null,
	onUpdatesCB = false,
	offColors = false;

// ******************
function formateSCORE(e) {
	return (arguments.length > 1 && void 0 !== arguments[1] && arguments[1])?
	function(e, t, n, a) {
		var r, o, c, s, i;
		
		r = parseInt(e = (+e || 0).toFixed(t), 10) + "";
		(o = r.length) > 3 ? o %= 3 : o = 0;
		
		i = o? (r.substr(0, o) + a): "";
		c = r.substr(o).replace(/(\d{3})(?=\d)/g, "$1" + a);
		s = t? n + Math.abs(e - r).toFixed(t).replace(/-/, 0).slice(2): "";

		return i + c + s;
	}(e / 1e3, 3, ",", " "):
	(e / 1e3).toFixed(3).toString().replace(".", ",")
}
// ******************

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
function setColorsM(e) {
	offColors = !!e;
}
function dateF(date) {
	if(!isNaN(date) && date < 9900000000)
		date *= 1000; // UNIXto
	date = date!==undefined ? new Date(date) : new Date();
	
	var dYear = date.getFullYear()
		, dMonthF = (date.getMonth()+1)
		, dMonth = dMonthF > 9 ? dMonthF : "0"+dMonthF
		, dDay = date.getDate() > 9 ? date.getDate() : "0"+date.getDate()
		, dHour = date.getHours() > 9 ? date.getHours() : "0"+date.getHours()
		, dMinutes = date.getMinutes() > 9 ? date.getMinutes() : "0"+date.getMinutes()
		, dSeconds = date.getSeconds() > 9 ? date.getSeconds() : "0"+date.getSeconds()
		, date_format = dDay +'.' +dMonth +'.' +dYear +' '+ dHour + ':' + dMinutes + ':' + dSeconds;
	
	return date_format;
}
function now() {
	return Math.floor(Date.now() / 1000);
}

let rl = ReadLine.createInterface(process.stdin, process.stdout);
rl.setPrompt('_> ');
rl.isQst = false;
rl.questionAsync = (question) => {
	return new Promise((resolve) => {
		rl.isQst = true;
		rl.question(question, _=> {
			rl.isQst = false; resolve(_);
		});
	});
};


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

async function askDonate(vc, trsum, ID) {
	if(askIn) return;
	askIn = true;

	setTimeout(_=> {
		askIn = false;
	}, 18e6);

	let res = await rl.questionAsync("Задонатить ["+formateSCORE(trsum, true)+"] разрабу [yes или 1 - для подтверждения]: ");
	if(res != "yes" || res != "y" || res != "1") return con("Okay.. (^", true);

	try {
		await vc.transferToUser(ID, trsum);
		con("Успешный перевод. Спасибо (:", "black", "Green");
	} catch(e) {
		con("Hе удалось перевести ):", true);
	}
}

function rand(min, max) {
	if(max===undefined) {
		max=min; min=0;
	}
	return Math.floor(min + Math.random() * (max + 1 - min));
}

let cFile = "./log.txt";
function setLogName(name) {
	cFile = "./log_"+name+".txt";
}
async function infLog(data) {
	data = "\n["+dateF()+"] \t"+data;

	let exists = await existsAsync(cFile);
	if(!exists) {
		let errWrite = await writeFileAsync(cFile, "Log."+data);
		if (errWrite) throw errWrite;
	}
	else		
		await appendFileAsync(cFile, data);
}

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


function setTitle(title) {
	if (process.platform == 'win32') {
		process.title = title;
	} else {
		process.stdout.write('\x1b]2;' + title + '\x1b\x5c');
	}
};

function onlyInt(e) {
	return parseInt(e.replace(/\D+/g,""));
}

module.exports = {
	rl,
	con, ccon,
	setColorsM, offColors,
	formateSCORE,
	checkUpdates, checkUpdateTTL,
	onUpdates: cb=> (onUpdatesCB=cb, true),
	askDonate,

	existsFile,
	existsAsync,
	writeFileAsync,
	appendFileAsync,
	infLog, setLogName,
	rand, now,
	setTitle, beep,
	onlyInt,
	pJson,
}

