/*
	File: hookVK.js
	Description: VK hooh inj
	Created by: xTCry
	Date: 09.04.2019 03:46
*/

const url = require('url');

function hashPassCoin(e, t) {
	return e + t - 1;
}

function formateWSLink(LINK, USER_ID) {
	let GSEARCH = url.parse(LINK),
		NADDRWS = GSEARCH.protocol.replace("https:", "wss:").replace("http:", "ws:") + "//" + GSEARCH.host + "/channel/",
		CHANNEL = USER_ID % 32;
	let URLWS = NADDRWS + CHANNEL+ "/" + GSEARCH.search + "&ver=1&pass=".concat(hashPassCoin(USER_ID, 0));
	URLWS = URLWS.replace("coin.vkforms.ru", "coin-without-bugs.vkforms.ru");

	// _h.fullLog() && _h.ccon("Formated WS Link: "+ URLWS, "grey");
	return URLWS;
}

module.exports = { formateWSLink, hashPassCoin };