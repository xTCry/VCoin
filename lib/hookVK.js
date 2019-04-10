/*
	File: hookVK.js
	Description: VK hooh inj
	Created by: xTCry
	Date: 09.04.2019 03:46
*/

const url = require('url'),
	safeEval = require('safe-eval'),
	randomUseragent = require('random-useragent');

const _Window = require('window'),
	window = new _Window();

function hashPassCoin(e, t) {
	return e + t - 1;
}

function formateWSLink(LINK, USER_ID) {
	let GSEARCH = url.parse(LINK),
		NADDRWS = GSEARCH.protocol.replace("https:", "wss:").replace("http:", "ws:") + "//" + GSEARCH.host + "/channel/",
		CHANNEL = USER_ID % 32;
	let URLWS = NADDRWS + CHANNEL+ "/" + GSEARCH.search + "&ver=1&upd=1&pass=".concat(hashPassCoin(USER_ID, 0));
	URLWS = URLWS.replace("coin.vkforms.ru", "coin-without-bugs.vkforms.ru");

	// _h.fullLog() && _h.ccon("Formated WS Link: "+ URLWS, "grey");
	return URLWS;
}

function OmyEval(pow) {
	let res = safeEval(pow, {
		window: {
			location: { host: 'vk.com' },
			navigator: { userAgent: randomUseragent.getRandom() },
			WebSocket: true,
			Math, parseInt,
		}
	});

	return res;
}

module.exports = { formateWSLink, hashPassCoin, OmyEval };
