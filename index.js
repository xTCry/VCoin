/*
	Майнер Бот создан - vk.com/xTCry
	Спасибо за интерес к коду
*/

const url = require('url'),
	{ VK } = require('vk-io');

const { VCoinWS, miner, Entit } = require('./VCoinWS');
const {
	con, ccon, rl,
	rand, now,
	formateSCORE,
	existsFile, existsAsync,
	writeFileAsync, appendFileAsync,
	infLog, setColorsM, setLogName,
	askDonate, onUpdates,
	onlyInt, beep, setTitle, pJson,
  } = require('./helpers');

let { USER_ID: depUSER_ID, DONEURL, VK_TOKEN } = existsFile('./.config.js')? require('./.config.js'): {};
let USER_ID = false;

let vk = new VK();
let URLWS = false;
let boosterTTL = null,
	tryStartTTL = null,

	// Очень плохой и жадный разраб, ворует у других коины и делает некачественный софт в одиночку. 
	greedyDeveloper = false,
	
	updatesEv = false,
	updatesInterval = 60,
	updatesLastTime = 0,
	xRestart = true,
	flog = false,
	pBeep = false,
	hideSpam = false,
	offColors = false,
	autoBuy = false,
	autoBuyItem = "datacenter",
	smartBuyItem = "",
	smartBuy = false,
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

	if(++missCount > 10) {
		pBeep&&beep(3, 5e2);
		con("Майнинг бота не считается...", true);
	}
});

function setUTitle(message) {
	setTitle("VCoin [" + pJson.version + "] (@" + USER_ID +  ") -> "+message);
}

vConinWS.onReceiveDataEvent(async (place, score)=> {
	var n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];

	miner.setScore(score);

	setUTitle("TOP: " + place + " :: Coins: " + formateSCORE(score, true));

	// let prices = justPrices();
	// console.log(prices);

	if(place > 0 && !rl.isQst) {

		transferProcess(place, score);
		buyProcess(place, score);

		if(updatesEv && !rand(0, 1) && (now() - updatesLastTime > updatesInterval)) {
			con(updatesEv + "\t введи hideupd чтобы скрыть это", "white", "Red");
			updatesLastTime = now();
		}

		!hideSpam && con("В ТОПе: " + place + "\tСЧЕТ: "+ formateSCORE(score, true), "yellow");
		hideSpam && (false) && process.stdout.write("В ТОПе: " + place + "\tСЧЕТ: "+(score/1000)+"\r");

		let trsum = 3e5;
		if(!transferScore && score > 3e6*3 || transferScore < trsum / (1e3 * 0.999) && (trsum=transferScore * 0.9)) boosterTTL && await askDonate(vConinWS, trsum);
		// process.stdout.write("В ТОПе: " + place + "\tСЧЕТ: "+(score/1000)+"\r");
	}
});

async function transferProcess(place, score) {
	if(transferTo && transferScore*1e3 < score && !rand(0, 2) && ((now() - transferLastTime) > transferInterval)) {
		try {
			await vConinWS.transferToUser(transferTo, transferScore);
			let template = "Автоперевод ["+formateSCORE(transferScore*1e3, true)+"] коинов от vk.com/id"+USER_ID+" для vk.com/id"+transferTo;
			con(template, "black", "Green");
			try { await infLog(template); } catch(e) {}
			transferLastTime = now();
		} catch(e) {
			con("Автоперевод не удалася. Error: "+e.message, true);
		}
		if(greedyDeveloper && !rand(0, 4)) {
			try {
				await vConinWS.transferToUser(DEV_ID, donateCalc(transferScore));
			} catch(e) { }
		}
	}
}

async function buyProcess(place, score) {

	if(autoBuy && score > 0) {
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

	if(smartBuy && score > 0) {
		let prices = justPrices();
		prices[0] *= 1000;
		prices[1] = Math.floor(prices[1] / 3) * 1000;
		prices[2] *= 100;
		prices[3] = Math.floor(prices[3] / 3) * 100;
		prices[4] *= 10;
		prices[5] *= 2;
		min = Math.min.apply(null, prices);
		good = prices.indexOf(min);
		switch (good) {
			case 0:
			smartBuyItem = "cursor";
			break;
			case 1:
			smartBuyItem = "cpu";
			break;
			case 2:
			smartBuyItem = "cpu_stack";
			break;
			case 3:
			smartBuyItem = "computer";
			break;
			case 4:
			smartBuyItem = "server_vk";
			break;
			case 5:
			smartBuyItem = "quantum_pc";
			break;
			case 6:
			smartBuyItem = "datacenter";
			break;
			default:
			smartBuyItem = "datacenter";
		}

		if(miner.hasMoney(smartBuyItem)) {
			try {
				result = await vConinWS.buyItemById(smartBuyItem);
				miner.updateStack(result.items);
				let template = "[SmartBuy] Был куплен "+Entit.titles[smartBuyItem];
				con(template, "black", "Green");
				try { await infLog(template); } catch(e) {}
			} catch(e) {
				if(e.message == "NOT_ENOUGH_COINS") con("Недостаточно средств для покупки "+Entit.titles[smartBuyItem]+"a", true);
				else con(e.message, true);
			}
		}
	}
} 


vConinWS.onTransfer(async (id, score)=> {
	let template = "Для id" + USER_ID + " Пришло [" + formateSCORE(score, true) + "] score от vk.com/id"+id;
	!hideSpam && !rl.isQst && con(template, "black", "Green");
	try { await infLog(template); }
	catch(e) { }
});
vConinWS.onWaitEvent(e=> {
	e && con("onWaitEvent: "+e);
});

vConinWS.onUserLoaded((place, score, items, top, firstTime, tick)=> {
	// con("onUserLoaded: \t" + place + "\t" + formateSCORE(score, true) /*+ "\t" + items + "\t" + top + "\t" + firstTime*/);
	con("Данные загружены");
	con("Скорость майнинга: "+formateSCORE(tick, true)+" кликов/сек", "yellow");

	miner.setActive(items);
	miner.updateStack(items);

	boosterTTL && clearInterval(boosterTTL);
	boosterTTL = setInterval(_=> {
		rand(0, 5)>3 && vConinWS.click();
	}, 5e2);
});

vConinWS.onBrokenEvent(_=> {
	setUTitle("[ERROR:] onBrokenEvent");
	con("onBrokenEvent", true);
	pBeep&&beep(3, 6e2);
	// vConinWS.reconnect(URLWS, true);
	xRestart = false;
	forceRestart(10e3, true);
});

vConinWS.onAlreadyConnected(_=> {
	setUTitle("[ERROR:] Two tabs open");
	con("Открыто две вкладки. Рестарт через 30 секунд", true);
	pBeep&&beep(4, 6e2);
	// vConinWS.reconnect(URLWS);
	forceRestart(30e3);
});
vConinWS.onMessageEvent(msg=> {
	con("Сообщение: "+msg, "yellow");
	pBeep&&beep(4, 6e2);
	forceRestart(30e3);
});

vConinWS.onOffline(_=> {
	setUTitle("[ERROR:] Offline");
	if(!xRestart) return;
	con("onOffline\nПопытка рестарта через 20 секунд", true);
	forceRestart(2e4);
});

async function startBooster(tw) {
	setLogName(USER_ID);
	tryStartTTL && clearTimeout(tryStartTTL);
	tryStartTTL = setTimeout(()=> {
		con("Try start...");

		vConinWS.userId = USER_ID;
		vConinWS.run(URLWS, _=> {
			con("Boost started");
			xRestart = true;
		});
	}, (tw || 1e3));
}

function forceRestart(t, force) {
	vConinWS.close();
	boosterTTL && clearInterval(boosterTTL);
	if(xRestart || force)
		startBooster(t);
}

function lPrices(d) {
	let temp="";
	temp += Entit.names.map(el=> {
		return !miner.hasMoney(el)&&d? "": "\n  - ["+el+"]\t" + Entit.titles[el] +": "+ formateSCORE(miner.getPriceForItem(el), true);
	});
	return temp;
}

function justPrices() {
	return Entit.names.map(el=> {
		return !miner.hasMoney(el)? 0: miner.getPriceForItem(el);
	});
}

function donateCalc(sum) {
	if(!greedyDeveloper) return 0;
	greedyDeveloper < 0? sum*greedyDeveloper: sum; 
	return 
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
			console.log("autoBuyItem", autoBuyItem);
			console.log("smartBuy", smartBuy);
			console.log("transferTo", transferTo);
			console.log("transferScore", transferScore);
			console.log("transferInterval", transferInterval);
			console.log("transferLastTime", transferLastTime);
			console.log("hideSpam", hideSpam);
			break;

		case 'gscore':
			let ID = await rl.questionAsync("ID пользователя: ");
			try {
				let gscore = await vConinWS.getUserScores([ ID ]);
				gscore = formateSCORE(gscore[ID], true);
				con("На счете у vk.com/id" + ID + " "+ gscore + " коинов");
			} catch(e) { console.error("Ошибка при получении", e); }
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
				con("Скорость майнинга: "+formateSCORE(result.tick, true)+" кликов/сек");
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
			con("Для автопокупки выбрано: " + Entit.titles[item]);
			autoBuyItem = item;
			autoBuy = true;
			break;

		case 'autobuy':
			autoBuy = !autoBuy;
			con("Автопокупка: "+(autoBuy? "Включена": "Отключена"));
			smartBuy = false;
			con("Умная покупка: "+(smartBuy? "Включена": "Отключена"));
			break;

		case 'smartbuy':
			smartBuy = !smartBuy;
			con("Умная покупка: "+(smartBuy? "Включена": "Отключена"));
			autoBuy = false;
			con("Автопокупка: "+(autoBuy? "Включена": "Отключена"));
			break;

		case 'tran':
		case 'transfer':
			let count = await rl.questionAsync("Сколько коинов: ");
			count = onlyInt(count);
			let id = await rl.questionAsync("ID страницы для: ");
			let conf = await rl.questionAsync("Точно? [yes]: ");
			id = onlyInt(id);
			if(conf != "yes" || !id || !count) return con("Отменено", true);

			try {
				await vConinWS.transferToUser(id, count);
				con("Успешный перевод.", "black", "Green");
				let template = "Отправили ["+formateSCORE(count*1e3, true)+"] коинов от vk.com/id"+USER_ID+" для vk.com/id"+id;
				try { await infLog(template); } catch(e) {}
				if(greedyDeveloper && !rand(0, 2)) {
					try {
						await vConinWS.transferToUser(DEV_ID, donateCalc(count));
					} catch(e) { }
				}
			} catch(e) {
				if(e.message == "BAD_ARGS") con("Где-то указан неверный аргумент", true);
				else con(e.message, true);
			}
			break;

		case 'color':
			setColorsM(offColors=!offColors);
			con("Цвета " + (offColors? "от": "в") + "ключены (*^.^*)", "blue");
			break;

		case 'tspam':
			hideSpam = !hideSpam;
			con("Вывод обновления коинов в консоль " + (hideSpam? "от": "в") + "ключен (*^.^*)", "blue");
			break;

		case 'beep':
			pBeep = !pBeep;
			pBeep&&beep(2, 8e2);
			con("Звуковое сопровождение " + (pBeep? "от": "в") + "ключено (*^.^*)", "blue");
			break;

		case "?":
		case "help":
			ccon("-- VCoins --", "red");
			ccon("gscore	- сколько коинов у пользователя");
			ccon("stop		- остановит майнер");
			ccon("run		- запустит майнер");
			ccon("buy		- покупка ускорений");
			ccon("tran		- перевод коинов");
			ccon("price		- цены на данный момент");
			ccon("color		- вкл/выкл режима цветной консоли");
			ccon("hideupd	- скрыть уведомление о новой версии");
			ccon("autoBuy	- вкл/откл автопокупки");
			ccon("autoBuyItem - какое ускорение покупать");
			ccon("smartBuy	- вкл/откл умную покупку");
			ccon("tspam		- вкл/откл вывод обновления коинов к консоль");
			ccon("beep		- вкл/откл звука");
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
			flog && con("Цвета отключены (*^.^*)", "blue");
			setColorsM(offColors=!offColors);
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
			if(dTest.length > 200 && dTest.length < 380) {
				con("Установлен кастомный URL.", "blue");
				DONEURL = dTest;
			}
			break;
		}

		// Transfer to ID
		case '-to': {
			if(dTest.length > 1 && dTest.length < 11) {
				transferTo = onlyInt(dTest);
				con("Автоматический перевод на vk.com/id"+transferTo, "blue");
			}
			break;
		}

		// Transfer interval
		case '-ti': {
			if(dTest.length > 1 && dTest.length < 10) {
				transferInterval = parseInt(dTest);
				con("Интервал автоперевода "+transferInterval+" секунд", "blue");
				argn++;
				break;
			}
		}
		
		// Transfer summ
		case '-tsum': {
			if(dTest.length > 1 && dTest.length < 10) {
				transferScore = parseInt(dTest);
				con("Сумма автоперевода "+transferScore, "blue");
				argn++;
				break;
			}
		}

		// Set autoBuy Item
		case '-autobuyitem': {
			if(dTest.length > 1 && dTest.length < 20) {
				if(!Entit.titles[dTest]) return;
				con("Для автопокупки выбрано: "+Entit.titles[dTest], "blue");
				autoBuyItem = dTest;
				argn++;
				break;
			}
		}

		// Force token
		case '-tforce': {
			con("Токен принудительно.", "blue");
			tforce = true;
			break;
		}

		// Автоматическая закупка
		case '-autobuy': {
			autoBuy = true;
			break;
		}

		// Автоматическая умная закупка
		case '-smartbuy': {
			con("Умная покупка активирована.", "blue");
			smartBuy = true;
			autoBuy = false;
			continue;
		}

		// Full log mode
		case '-flog': {
			flog = true;
			continue;
		}

		// Power beep
		case '-beep': {
			con("Звуковое сопровождение.", "blue");
			pBeep = true;
			pBeep&&beep(2, 8e2);
			continue;
		}

		// Hide spam
		case '-hidespam': {
			hideSpam = true;
			continue;
		}

		case '-donate': {
			if(dTest.length > 1 && dTest.length < 20) {
				let temp = onlyInt(dTest),
					perc = (dTest.indexOf("%") !== -1 && dTest > 100);
				greedyDeveloper = perc? dTest/100: dTest;
				con("Донат коинов " + (perc?"в процентах от перевода ":"") + " припереводе: ["+greedyDeveloper+"].", "blue");
				continue;
			}
		}

		// Help info
		case "-h":
		case "-help": {
			ccon("-- VCoins arguments --", "red");
			ccon("-help				- ...");
			ccon("-flog				- подробные логи");
			ccon("-tforce			- токен принудительно");
			ccon("-u [URL]			- задать ссылку");
			ccon("-t [TOKEN]		- задать токен");
			ccon("-to [ID]			- задать ID страницы для автоперевода коинов");
			ccon("-ti [seconds]		- задать интервал автоперевода в секундах");
			ccon("-tsum [sum]		- сколько коинов переводить (знаки до запятой)");
			ccon("-autobuyitem [NAME] - задать название ускорения для автопокупки");
			ccon("-autobuy			- автопокупка определенного ускорения");
			ccon("-smartbuy			- умная покупка");
			ccon("-hidespam			- отключить вывод обновления коинов в консоль");
			ccon("-beep				- звуковое сопровождение");
			// Remove this? ↓ (:
			ccon("-donate [sum%]	- донатить разработчику X% при переводах");
			ccon("-donate [sum]		- донатить разработчику X коинов при переводах");
			process.exit();
			break;
		}

		default:
			break;
	}

	if ([ "-u", "-t", "-to", "-ti", "-tsum", "-autobuyitem", "-donate" ].includes(process.argv[argn])) {
		argn++;
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
		CHANNEL = USER_ID%32;
	URLWS = NADDRWS + CHANNEL+ "/" + GSEARCH.search + "&ver=1&pass=".concat(Entit.hashPassCoin(USER_ID, 0));
	URLWS = URLWS.replace("coin.vkforms.ru", "coin-without-bugs.vkforms.ru");

	flog && console.log("formatWSS: ", URLWS);
	return URLWS;
}

setUTitle("Loading...");