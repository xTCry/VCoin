const url = require('url'),
	{ VK } = require('vk-io');

const { VCoinWS, miner, Entit } = require('./VCoinWS');
const {
	con, ccon, rl,
	rand, now,
	formateSCORE,
	existsFile, existsAsync,
	writeFileAsync, appendFileAsync,
	infLog, setColorsM,
	askDonate, onUpdates,
  } = require('./helpers');

let { USER_ID: depUSER_ID, DONEURL, VK_TOKEN } = existsFile('./.config.js')? require('./.config.js'): {};
let USER_ID = false;

let vk = new VK();
let URLWS = false;
let boosterTTL = null,
	tryStartTTL = null,
	updatesEv = false,
	updatesInterval = 60,
	updatesLastTime = 0,
	xRestart = true,
	flog = false,
	autoBuy = false,
	autoBuyItem = "datacenter",
	tforce = false,
	transferTo = false,
	transferScore = 3e4,
	transferInterval = 36e2,
	transferLastTime = 0;

onUpdates(msg=> {
	if(!updatesEv) updatesEv = msg;
	con(msg, "white", "Red");
});

// Инициализация главного модуля (:
let vConinWS = new VCoinWS();


let missCount = 0, missTTL = null;
vConinWS.onMissClickEvent(_=> {
	if(0 === missCount) {
		clearTimeout(missTTL);
		missTTL = setTimeout(_=> {
			missCount = 0;
			return;
		}, 6e4)
	}

	if(++missCount > 20)
		forceRestart(4e3);

	if(++missCount > 10)
		con("Майнинг бота не считается...", true);
});

vConinWS.onReceiveDataEvent(async (place, score)=> {
	var n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2], trsum=3e6;
	
	miner.setScore(score);

	if(place > 0 && !rl.isQst) {

		if(transferTo && transferScore*1e3 < score && !rand(0, 2) && ((now() - transferLastTime) > transferInterval)) {
			try {
				await vConinWS.transferToUser(transferTo, transferScore);
				let template = "Автоперевод ["+formateSCORE(transferScore*1e3*0.999, true)+"] score от vk.com/id"+USER_ID+" для vk.com/id"+transferTo;
				con(template, "black", "Green");
				try { await infLog(template); } catch(e) {}
				transferLastTime = now();
			} catch(e) {
				con("Автоперевод не удалася. Error: "+e.message, true);
			}
		}

		if(autoBuy && score>0) {
			if(miner.hasMoney(autoBuyItem)) {
				try {
					result = await vConinWS.buyItemById(autoBuyItem);
					miner.updateStack(result.items);
					let template = "[AutoBuy] Был куплен "+Entit.titles[autoBuyItem];
					con(template, "black", "Green");
					try { await infLog(template); } catch(e) {}
				} catch(e) {
					if(e.message == "NOT_ENOUGH_COINS") con("Недостаточно средств для покупки "+Entit.titles[autoBuyItem]+"a", true);
					else con(e.message, true);
				}
			}
		}

		if(updatesEv && !rand(0, 1) && (now() - updatesLastTime > updatesInterval)) {
			con(updatesEv + "\t введи hideupd чтобы скрыть это", "white", "Red");
			updatesLastTime = now();
		}
		
		con("В ТОПе: " + place + "\tСЧЕТ: "+ formateSCORE(score, true), "yellow");
		if(!transferScore && score > 3e6*3 || transferScore<trsum/(1e3*0.999) && (trsum=transferScore*0.9)) boosterTTL&&await askDonate(vConinWS, trsum);
		// process.stdout.write("В ТОПе: " + place + "\tСЧЕТ: "+(score/1000)+"\r");
	}
});

vConinWS.onTransfer(async (id, score)=> {
	let template = "Для id"+USER_ID+" Пришло ["+formateSCORE(score, true)+"] score от vk.com/id"+id;
	con(template, "black", "Green");
	try { await infLog(template); }
	catch(e) { }
});
vConinWS.onWaitEvent(e=> { e && con("onWaitEvent: "+e); });

vConinWS.onUserLoaded((place, score, items, top, firstTime, tick)=> {
	// con("onUserLoaded: \t" + place + "\t" + formateSCORE(score, true) /*+ "\t" + items + "\t" + top + "\t" + firstTime*/);
	con("Данные загружены");
	con("Текущая скорсть: "+formateSCORE(tick, true)+" кликов/сек", "yellow");

	miner.setActive(items);
	miner.updateStack(items);

	boosterTTL && clearInterval(boosterTTL);
	boosterTTL = setInterval(_=> {
		rand(0, 5)>3 && vConinWS.click();
	}, 5e2);
});

vConinWS.onBrokenEvent(_=> {
	con("onBrokenEvent", true);
	// vConinWS.reconnect(URLWS, true);
	forceRestart(30e3);
});

vConinWS.onAlreadyConnected(_=> {
	con("Открыто две вкладки", true);
	// vConinWS.reconnect(URLWS);
	forceRestart(30e3);
});

vConinWS.onOffline(_=> {
	if(!xRestart) return;
	con("onOffline\nПопытка рестарта через 20 секунд", true);
	forceRestart(2e4);
});

async function startBooster(tw) {
	tryStartTTL && clearTimeout(tryStartTTL);
	tryStartTTL = setTimeout(()=> {
		con("Try start...");

		vConinWS.userId = USER_ID;
		vConinWS.run(URLWS, _=> {
			con("Boost started");
		});
	}, (tw || 1e3));
}

function forceRestart(t) {
	vConinWS.close();
	boosterTTL && clearInterval(boosterTTL);
	if(xRestart)
		startBooster(t);
}

function lPrices(d) {
	let temp="";
	temp += Entit.names.map(el=> {
		return !miner.hasMoney(el)&&d? "": "\n\t- ["+el+"] " + Entit.titles[el] +": "+ formateSCORE(miner.getPriceForItem(el), true);
	});
	return temp;
}

// Обработка командной строки
rl.on('line', async (line) => {
	if(!URLWS) return;
	let temp, item;

	switch(line.trim().toLowerCase()) {
		case '':
			break;

		case 'debug':
			console.log("updatesInterval", updatesInterval);
			console.log("updatesLastTime", updatesLastTime);
			console.log("xRestart", xRestart);
			console.log("autobuy", autoBuy);
			console.log("transferTo", transferTo);
			console.log("transferScore", transferScore);
			console.log("transferInterval", transferInterval);
			console.log("transferLastTime", transferLastTime);
			break;

		case 'info':
			let XXX = await vConinWS.getUserScores([ vConinWS.userId ]);
			console.log("Users score: ", XXX);
			break;

		case "hideupd":
			con("Уведомление скрыто.");
			updatesEv = false;
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

		case 'p':
		case 'price':
			temp = lPrices();
			ccon("-- Цены --", "red");
			ccon(temp);
			break;

		case 'b':
		case 'buy':
			temp = lPrices(true);
			ccon("-- Доступные ускорения и их цены --", "red");
			ccon(temp);
			item = await rl.questionAsync("Введи название ускорения [cursor, cpu, cpu_stack, computer, server_vk, quantum_pc, datacenter]: ");
			if(!item) return;
			let result;
			try {
				result = await vConinWS.buyItemById(item);
				miner.updateStack(result.items);
				
				if(result && result.items)
					delete result.items;
				con("Теперь текущая сорость: "+formateSCORE(result.tick, true)+" кликов/сек");
				/* { score: 42027913, place: 768672, tick: 24877, price: 30 } */
				// console.log("Result BUY: ", result);
			} catch(e) {
				if(e.message == "NOT_ENOUGH_COINS") con("Недостаточно средств", true);
				else con(e.message, true);
			}			
			break;

		case 'autobuyitem':
			item = await rl.questionAsync("Введи название ускорения для автопокупки [cursor, cpu, cpu_stack, computer, server_vk, quantum_pc, datacenter]: ");
			if(!item || !Entit.titles[item]) return;
			con("Для автопокупки выбрано: "+Entit.titles[item]);
			autoBuyItem = item;
			autoBuy = true;
			break;

		case 'autobuy':
			autoBuy = !autoBuy;
			con("Автопокупка: "+(autoBuy? "Включена": "Отключена"));
			break;

		case 'tran':
		case 'transfer':
			let count = await rl.questionAsync("Сколько: ");
			let id = await rl.questionAsync("Кому: ");
			let conf = await rl.questionAsync("Точно? [yes]: ");
			id = parseInt(id.replace(/\D+/g,""));
			if(conf != "yes" || !id || !count) return con("Отменено", true);

			try {
				await vConinWS.transferToUser(id, count);
				con("Успешный перевод.", "black", "Green");
				let template = "Отправили ["+formateSCORE(count*1e3*0.999, true)+"] score от vk.com/id"+USER_ID+" для vk.com/i"+id;
				try { await infLog(template); } catch(e) {}
			} catch(e) {
				if(e.message == "BAD_ARGS") con("Где-то указан неверный аргумент", true);
				else con(e.message, true);
			}
			break;

		case "?":
		case "help":
			ccon("-- VCoins --", "red");
			ccon("info	- обновит текущий уровень");
			ccon("stop	- остановит майнер");
			ccon("run	- запустит майнер");
			ccon("buy	- покупка");
			ccon("tran	- перевод");
			ccon("price	- цены");
			ccon("hideupd - скрыть уведомление");
			ccon("autoBuy - вкл/откл автопокупки");
			ccon("autoBuyItem - какое ускорение покупать");
			break;
	}
});
// END



// Parse arguments
for (let argn = 2; argn < process.argv.length; argn++) {
	let cTest = process.argv[argn],
		dTest = process.argv[argn + 1];

	switch(cTest.trim().toLowerCase()) {

		case '-black': {
			flog && con("Цвета отключены", "blue");
			// setColorsM...
			argn++;
			break;
		}

		// Token
		case '-t': {
			if(dTest.length > 80 && dTest.length < 90) {
				con("Установлен токен.", "blue");
				VK_TOKEN = dTest;
				argn++;
			}
			break;
		}
		// Custom URL
		case '-u': {
			if(dTest.length > 200 && dTest.length < 255) {
				con("Установлен кастомный URL.", "blue");
				DONEURL = dTest;
			}
			break;
		}

		// Transfer to ID
		case '-to': {
			if(dTest.length > 1 && dTest.length < 11) {
				transferTo = parseInt(dTest.replace(/\D+/g,""));
				con("Автоматический перевод на vk.com/id"+transferTo);
			}
			break;
		}

		default:
			break;
	}

	if ([ "-t", "-u", "-to", "-ti", "-tsum", "-autobuyItem" ].includes(process.argv[argn])) {
		argn++;
	}


	// Transfer interval
	if (process.argv[argn] == '-ti') {
		if(dTest.length > 1 && dTest.length < 10) {
			transferInterval = parseInt(dTest);
			con("Интервал автоперевода "+transferInterval+" секунд");
			argn++;
			continue;
		}
	}

	// Transfer summ
	if (process.argv[argn] == '-tsum') {
		if(dTest.length > 1 && dTest.length < 10) {
			transferScore = parseInt(dTest);
			con("Сумма автоперевода "+transferScore+"");
			argn++;
			continue;
		}
	}

	// Set autoBuy Item
	if (process.argv[argn] == '-autobuyItem') {
		if(dTest.length > 1 && dTest.length < 20) {
			if(!Entit.titles[dTest]) return;
			con("Для автопокупки выбрано: "+Entit.titles[dTest]);
			autoBuyItem = dTest;
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
		autoBuy = true;
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
		ccon("-to [ID]	- задать ID страницы для автоперевода score");
		ccon("-ti [seconds]	- задать интервал автоперевода в секундах");
		ccon("-tsum [sum]	- сколько score переводить (знаки до запятой)");
		ccon("-autobuy		- автопокупка");
		process.exit();
		continue;
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
			
			let { id } = (await vk.api.users.get())[0];
			if(!id)
				throw("Не удалось получить ID пользователя");

			USER_ID = id;

			formatWSS(mobile_iframe_url);
			startBooster();

		} catch(error) {
			console.error('API Error:', error);
			process.exit();
		}
	})(VK_TOKEN);
}
else {
	let GSEARCH = url.parse(DONEURL, true);
	if(!GSEARCH.query || !GSEARCH.query.vk_user_id) {
		con("В ссылке не не указан ID [vk_user_id]", true);
		return process.exit();
	}
	USER_ID = parseInt(GSEARCH.query.vk_user_id);

	formatWSS(DONEURL);
	startBooster();
}

function formatWSS(LINK) {
	let GSEARCH = url.parse(LINK),
		NADDRWS = GSEARCH.protocol.replace("https:", "wss:").replace("http:", "ws:") + "//" + GSEARCH.host + "/channel/",
		CHANNEL = /*(USER_ID%16 === 1)?*/ USER_ID%16/*: USER_ID%8*/;
	// URLWS = NADDRWS + CHANNEL + GSEARCH.search + "&ver=1&pass=".concat(Entit.hashPassCoin(USER_ID, 0));
	URLWS = NADDRWS + CHANNEL + GSEARCH.search + "&pass=".concat(Entit.hashPassCoin(USER_ID, 0));
	
	URLWS = URLWS.replace("coin.vkforms.ru", (CHANNEL>7)? "bagosi-go-go.vkforms.ru": "coin.w5.vkforms.ru");
	// URLWS = URLWS.replace("coin.vkforms.ru", "coin-without-bugs.vkforms.ru");
	
	flog && console.log("formatWSS: ", URLWS);
	return URLWS;
}
