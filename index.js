const url = require('url'),
	{ VK } = require('vk-io');

const VCoinWS = require('./VCoinWS');
const { con, ccon, formateSCORE, hashPassCoin, rl, askDonate } = require('./helpers');
let { USER_ID, DONEURL, VK_TOKEN } = require('./.config.js');


let vk = new VK();
let URLWS = false;
let boosterTTL = null, tryStartTTL = null, xRestart = true, flog = false, tforce = false;



// Инициализация главного модуля (:
let vConinWS = new VCoinWS(USER_ID);


let missCount = 0, missTTL = null;
vConinWS.onMissClickEvent(function() {
	if(0 === missCount) {
		clearTimeout(missTTL);
		missTTL = setTimeout(function() {
			missCount = 0;
			return;
		}, 6e4)
	}

	if(++missCount > 10)
		con("Ваши нажатия не засчитываются. Похоже, у Вас проблемы с подключением.", true);
});

vConinWS.onReceiveDataEvent(async function(place, score) {
	var n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];

	if(place > 0) {
		con("В ТОПе: " + place + "\tСЧЕТ: "+ formateSCORE(score, true), "yellow");
		if(score > 3e7) await askDonate(vConinWS);
		// process.stdout.write("В ТОПе: " + place + "\tСЧЕТ: "+(score/1000)+"\r");
	}
});

vConinWS.onWaitEvent(function(e) {
	con("WaitEvent: "+e);
});

vConinWS.onUserLoaded(function(place, score, items, top, firstTime) {
	con("onUserLoaded: \t" + place + "\t" + formateSCORE(score, true) /*+ "\t" + items + "\t" + top + "\t" + firstTime*/);

	boosterTTL && clearInterval(boosterTTL);
	boosterTTL = setInterval(_=> {
		vConinWS.click();
	}, 5e2);
});

vConinWS.onBrokenEvent(function() {
	con("onBrokenEvent", true);
});

vConinWS.onAlreadyConnected(function() {
	con("Открыто две вкладки", true);
	boosterTTL && clearInterval(boosterTTL);
	if(xRestart)
		startBooster(10e3);
});

vConinWS.onOffline(function() {
	con("onOffline", true);
	boosterTTL && clearInterval(boosterTTL);
	if(xRestart)
		startBooster(2e4);
});

async function startBooster(tw) {
	tryStartTTL && clearTimeout(tryStartTTL);
	tryStartTTL = setTimeout(()=> {
		con("Try start...");

		vConinWS.run(URLWS, _=> {
			con("Boost started");
		});
	}, (tw || 1e3));
}



// Обработка командной строки
rl.on('line', async (line) => {
	if(!URLWS) return;

	switch(line.trim()) {
		case '':
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
			if(!item) return;
			let result = await vConinWS.buyItemById(item);
			if(result && result.items)
				delete result.items;
			console.log("Result BUY: ", result);
			
			break;

		case 'tran':
		case 'transfer':
			let count = await rl.questionAsync("Сколько: ");
			let id = await rl.questionAsync("Кому: ");
			let conf = await rl.questionAsync("Точно? [yes]: ");
			if(conf != "yes" || !id || !count) return con("Отменено", true);

			try {
				await vConinWS.transferToUser(id, count);
				con("Успешный перевод.", "black", "Green");
			} catch(e) {
				con("Hе удалось перевести ):", true);
				console.error(e);
			}
			break;

		case "?":
		case "help":
			ccon("-- VCoins --", "red");
			ccon("info	- обновит текущий уровень");
			ccon("stop	- остановит майнер");
			ccon("run		- запустит майнер");
			ccon("buy		- покупка");
			ccon("tran	- перевод");
			break;
	}
});
// END



// Parse arguments
for (var argn = 2; argn < process.argv.length; argn++) {

	if(["-h", "-help", "-f", "-t", "-flog", "-autobuy", "-u", "-tforce"].includes(process.argv[argn])) {

		// Token
		if (process.argv[argn] == '-t') {
			let dTest = process.argv[argn + 1];
			if(typeof dTest == "string" && dTest.length > 80 && dTest.length < 90) {
				con("Token set.")
				VK_TOKEN = dTest;
				argn++;
				continue;
			}
		}

		// Custom URL
		if (process.argv[argn] == '-u') {
			let dTest = process.argv[argn + 1];
			if(typeof dTest == "string" && dTest.length > 200 && dTest.length < 255) {
				con("Custom URL set.");
				DONEURL = dTest;
				argn++;
				continue;
			}
		}

		// Force token
		if (process.argv[argn] == '-tforce') {
			con("Force token set.")
			tforce = true;
			continue;
		}

		// Автоматическая закупка
		if (process.argv[argn] == '-autobuy') {
			// Soon
			continue;
		}

		// Full log mode
		if (process.argv[argn] == '-flog') {
			flog = true;
			continue;
		}

		// Help info
		if (process.argv[argn] == "-h" || process.argv[argn] == "-help") {
			ccon("-- VCoins arguments --", "red");
			ccon("-help		- ...");
			ccon("-flog		- подробные логи");
			ccon("-tforce		- токен принудительно");
			ccon("-u [URL]	- задать ссылку");
			ccon("-t [TOKEN]	- задать токен");
			process.exit();
			continue;
		}
	}
}

// Попытка запуска
if(!DONEURL || tforce) {
	if(!VK_TOKEN) {
		con("Получить токен можно тут -> vk.cc/9eSo1E", true);
		return process.exit();
	}

	(async function inVKProc(token) {
		vk.token = token;
		try {
			let { mobile_iframe_url } = (await vk.api.apps.get({
				app_id: 6915965
			})).items[0];

			if(!mobile_iframe_url)
				throw("Ссылка на приложение не получена");
			
			if(!USER_ID) {
				let { id } = (await vk.api.users.get())[0];
				if(!id)
					throw("ID пользователя не получен");

				USER_ID = id;
			}

			formatWSS(mobile_iframe_url);
			startBooster();

		} catch(error) {
			console.error('API Error:', error);
			process.exit();
		}
	})(VK_TOKEN);
}
else {
	if(!USER_ID) {
		let GSEARCH = url.parse(DONEURL, true);
		if(!GSEARCH.query || !GSEARCH.query.vk_user_id) {
			con("В ссылке не нашлось vk_user_id", true);
			return process.exit();
		}
		USER_ID = parseInt(GSEARCH.query.vk_user_id);
	}

	formatWSS(DONEURL);
	startBooster();
}


function formatWSS(LINK) {
	let GSEARCH = url.parse(LINK),
		NADDRWS = GSEARCH.protocol.replace("https:", "wss:").replace("http:", "ws:") + "//" + GSEARCH.host + "/channel/";
	URLWS = NADDRWS + (USER_ID % 8) + GSEARCH.search + "&pass=".concat(hashPassCoin(USER_ID, 0));
	flog && console.log("formatWSS: ", URLWS);
	return URLWS;
}
