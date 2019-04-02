const url = require('url'),
	ReadLine = require('readline'),
	colors = require('colors/safe'),
	{ VK } = require('vk-io');

const VCoinWS = require('./VCoinWS');
const { USER_ID, DONEURL } = require('./.config.js');


// https://api.vk.com/method/apps.get?app_id=6915965&v=5.90&access_token=


const GSEARCH = url.parse(DONEURL);

let NADDRWS = GSEARCH.protocol.replace("https:", "wss:").replace("http:", "ws:") + "//" + GSEARCH.host + "/channel/";
let URLWS = NADDRWS + (USER_ID % 4) + GSEARCH.search;


let boosterTTL = null, updPlaceTTL = null, tryStartTTL = null, xRestart = true;

let vConinWS = new VCoinWS(USER_ID);



let x = 0, C = null;
vConinWS.onMissClickEvent(function() {

	console.log("onMissClickEvent", (0 === x));
	
	if(0 === x) {
		clearTimeout(C);
		C = setTimeout(function() {
			return x = 0
		}, 6e4)
	}

	//++x > 10 && l.a.dispatch(Object(v.d)(f.a.t("too_many_miss_click")))
});

vConinWS.onReceiveDataEvent(function(e, t) {
	var n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];

	// console.log("onReceiveDataEvent", e, t, n);
	if(e > 0)
		con("В ТОПе: " + e + "\tСЧЕТ: "+ formateSCORE(t, true), "yellow");
		// process.stdout.write("В ТОПе: " + e + "\tСЧЕТ: "+(t/1000)+"\r");

	// l.a.getState().BootstrapModule.loaded || l.a.dispatch(Object(v.e)(false))

	// l.a.dispatch(Object(v.h)(t, n))
	// l.a.dispatch(Object(v.g)(e))
});

vConinWS.onWaitEvent(function(e) {
	console.log("onWaitEvent", e);
	// l.a.dispatch(Object(v.f)(e))
});

vConinWS.onUserLoaded(function(e, t, n, r, o) {
	
	console.log("onUserLoaded", e, t, /*n,*/ /*r,*/ o);

	// l.a.dispatch(Object(b.d)(r))
	// l.a.dispatch(Object(g.c)(n))
	// l.a.dispatch(Object(v.d)(null))
	// o && l.a.dispatch(Object(d.p)(d.b))
})

vConinWS.onBrokenEvent(function() {
	con("onBrokenEvent", true);
	// l.a.dispatch(Object(v.d)(f.a.t("too_old_app")))
});

vConinWS.onAlreadyConnected(function() {
	console.error("ERROR", "onAlreadyConnected!!!!!");
	con("Открыто две вкладки", true);
	boosterTTL && clearInterval(boosterTTL);
	updPlaceTTL && clearInterval(updPlaceTTL);
	if(xRestart)
		startBooster(10e3);
	// l.a.dispatch(Object(v.d)(f.a.t("two_tab")))
});

vConinWS.onOffline(function() {
	con("onOffline", true);
	boosterTTL && clearInterval(boosterTTL);
	updPlaceTTL && clearInterval(updPlaceTTL);
	if(xRestart)
		startBooster(2e4);
	/*l.a.dispatch(Object(v.c)({
		connect: true
	}))*/
});

/*vConinWS.onOnline(function() {
	console.log("onOnline");
	l.a.dispatch(Object(v.c)({
		connect: false
	}))
});*/

// -------------
/*(async function() {
	let e = [
		{
			id: vConinWS.userId
		}
	];
	var t = e.map(function(e) {
		return e.id
	});

	let XXX = await vConinWS.getUserScores(t)
		.then(function(t) {
			return e.map(function(e) {
				e.score = t[e.id] || 0
				return e;
			})
		});

	console.log("Users score: ", XXX);
})();*/
// -------------

async function startBooster(tw) {

	tryStartTTL && clearTimeout(tryStartTTL);
	tryStartTTL = setTimeout(()=> {
		con("Try start...");

		vConinWS.run(URLWS, _=> {
			con("Boost start");

			boosterTTL && clearInterval(boosterTTL);
			updPlaceTTL && clearInterval(updPlaceTTL);
			boosterTTL = setInterval(_=> {
				vConinWS.click();
				vConinWS.click();
			}, 3e2);
			updPlaceTTL = setInterval(async _=> {
				await vConinWS.getMyPlace();
			}, 1e4);
		});
	}, (tw || 1e3));
}
startBooster();



let rl = ReadLine.createInterface(process.stdin, process.stdout);
rl.setPrompt('_> ');
rl.prompt();
rl.questionAsync = (question) => {
	return new Promise((resolve) => {
		rl.question(question, resolve);
	});
};

rl.on('line', async (line) => {
	switch(line.trim()) {
		case '':
			break;

		case 'place':
			let myPlace = await vConinWS.getMyPlace();
			console.log("User place: ", myPlace);
			break;

		case 'info':
			let XXX = await vConinWS.getUserScores([ vConinWS.userId ]);
			console.log("Users score: ", XXX);
			break;

		case "stop":
		case "pause":
			xRestart = false;
			vConinWS.close();
			break;

		case "start":
		case "run":
			if(vConinWS.connected)
				return con("Уже запущено");
			xRestart = true;
			startBooster();
			break;

		case 'b':
		case 'buy':
			let item = await rl.questionAsync("Enter item name [cursor, cpu, cpu_stack, computer, server_vk, quantum_pc]: ");

			let result = await vConinWS.buyItemById(item);
			if(result && result.items)
				delete result.items;
			console.log("Result BUY: ", result);
			
			break;
	}
});


// ******************

function formateSCORE(e) {
	return arguments.length > 1 && void 0 !== arguments[1] && arguments[1] ? f22(e / 1e3, 3, ",", " ") : s22(e)
}
function s22(e) {
	return (e / 1e3).toFixed(3).toString().replace(".", ",")
}
function f22(e, t, n, r) {
	var o = void 0,
	i = void 0,
	a = void 0,
	u = void 0,
	l = void 0;
	return o = parseInt(e = (+e || 0).toFixed(t), 10) + "", (i = o.length) > 3 ? i %= 3 : i = 0, l = i ? o.substr(0, i) + r : "", a = o.substr(i).replace(/(\d{3})(?=\d)/g, "$1" + r), u = t ? n + Math.abs(e - o).toFixed(t).replace(/-/, 0).slice(2) : "", l + a + u
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

	if(color === true) {
		color = "red";
		colorBG = "Blue";
	}

	colorBG = "bg"+ ((typeof colorBG == "string")?colorBG:"Black");
	color = (typeof color == "string")?color:"green";

	console.log(colors.dateBG( '[' +dateF()+ ']' )+": "+ colors[colorBG](colors[color](message)) );
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