const url = require('url'),
	ReadLine = require('readline'),
	{ VK } = require('vk-io');

const VCoinWS = require('./VCoinWS');
const { con, formateSCORE, hashPassCoin } = require('./helpers.js');
let { USER_ID, DONEURL, VK_TOKEN } = require('./.config.js');


let vk = new VK();
let URLWS = false;
let boosterTTL = null, tryStartTTL = null, xRestart = true;



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
		con("Ваши нажатия не засчитываются. Похоже, Вы нажимаете на кнопку слишком часто или у Вас проблемы с подключением.", true);
});

vConinWS.onReceiveDataEvent(function(place, score) {
	var n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];

	if(place > 0)
		con("В ТОПе: " + place + "\tСЧЕТ: "+ formateSCORE(score, true), "yellow");
		// process.stdout.write("В ТОПе: " + place + "\tСЧЕТ: "+(score/1000)+"\r");
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
let rl = ReadLine.createInterface(process.stdin, process.stdout);
rl.setPrompt('_> ');
rl.prompt();
rl.questionAsync = (question) => {
	return new Promise((resolve) => {
		rl.question(question, resolve);
	});
};
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

			let result = await vConinWS.buyItemById(item);
			if(result && result.items)
				delete result.items;
			console.log("Result BUY: ", result);
			
			break;
	}
});
// END



// Попытка запуска
if(!DONEURL) {
	if(!VK_TOKEN)
		return con("FUUC", true);

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
		}
	})(VK_TOKEN);

}
else {
	formatWSS(DONEURL);
	startBooster();
}


function formatWSS(LINK) {
	let GSEARCH = url.parse(LINK),
		NADDRWS = GSEARCH.protocol.replace("https:", "wss:").replace("http:", "ws:") + "//" + GSEARCH.host + "/channel/";
	return URLWS = NADDRWS + (USER_ID % 4) + GSEARCH.search + "&pass=".concat(hashPassCoin(USER_ID, 0));
}
