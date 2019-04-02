const WebSocket = require('ws');

class VCoinWS {

	constructor(userId) {
		this.ws = null
		this.ttl = null
		this.retryTime = 1e3
		this.forceOnlineTimer = null
		this.onOnlineCallback = null
		this.clickCount = 0
		this.clickTimer = null
		this.clickPacks = []
		this.sendedPacks = 0
		this.allowReconnect = true
		this.randomId = null
		this.oldPlace = null
		this.oldScore = null
		this.confirmScore = null
		this.tick = 0
		this.tickTtl = null
		this.callbackForPackId = {}
		this.ccp = 10
		this.connected = false
		this.onConnectSend = []
		this.tickCount = 0
		this.userId = userId
	}

	run(e, cb) {
		var n = this;
		this.selfClose();
		if(cb)
			this.onOnlineCallback = cb;

		try {

			this.ws = new WebSocket(e);

			this.ws.onopen = function() {
				n.onOpen();
				n.connected = true;

				n.onConnectSend.forEach(function(e) {
					if(n.ws)
						n.ws.send(e);
				});

				n.onConnectSend = []
			}

			this.ws.onerror = function(e) {
				console.error("ERROR:", e);
			}

			this.ws.onclose = function() {
				n.reconnect(e);
				clearInterval(n.tickTtl);
				n.tickTtl = null;
				n.connected = false;

				if(n.onOfflineCallback)
					n.onOfflineCallback();

				n.ws = null
			}

			this.ws.onmessage = function(e) {

				var t = e.data;
				

				if ("{" === t[0]) {
					var r = JSON.parse(t);
					if ("INIT" === r.type) {

						var o = r.score,
							i = r.place,
							a = r.randomId,
							u = r.items,
							l = r.top,
							c = r.tick,
							s = r.ccp,
							f = r.firstTime;

						n.randomId = a;
						n.confirmScore = o;
						n.oldScore = o;
						n.oldPlace = i;

						n.onMyDataCallback && n.onMyDataCallback(i, o);
						n.onUserLoadedCallback && n.onUserLoadedCallback(i, o, u, l, f);

						/*if(-1 !== window.location.search.indexOf("vk_platform=desktop")) {
							n.tick = 0;
						}
						else {*/

							n.tick = parseInt(c, 10);
							/*n.tickTtl = setInterval(function() {
								return n.onTickEvent();
							}, 1e3);*/

						// }

						n.ccp = s || n.ccp;

						// console.log("Tick: "+n.tick);
						// console.log("CPP: "+n.ccp);
					}
				}
				else if(-1 === t.indexOf("SELF_DATA") && "C" !== t[0])
					console.log(t);

				if ("R" === t[0]) {
					var p = t.replace("R", "").split(" "),
						d = p.shift();

					n.rejectAndDropCallback(d, new Error(p.join(" ")))
				}
				if ("C" === t[0]) {
					var h = t.replace("C", "").split(" "),
						y = h.shift();

					n.resoveAndDropCallback(y, h.join(" "));
				}

				if ("ALREADY_CONNECTED" === t) {
					n.retryTime = 18e5;
					if(n.onAlredyConnectedCallback)
						n.onAlredyConnectedCallback();
				}
				else {
					if(0 === t.indexOf("WAIT_FOR_LOAD")) {
						if(n.onWaitLoadCallback)
							n.onWaitLoadCallback(parseInt(t.replace("WAIT_FOR_LOAD ", ""), 10))
						if(n.onChangeOnlineCallback)
							n.onChangeOnlineCallback(parseInt(t.replace("WAIT_FOR_LOAD ", ""), 10));
					}
					if(0 === t.indexOf("SELF_DATA")) {

						var m = t.replace("SELF_DATA ", "").split(" ");
						n.randomId = m[2];
						var v = parseInt(m[3], 10),
							b = parseInt(m[4], 10),
							g = parseInt(m[0], 10),
							w = parseInt(m[1], 10);

						n.oldPlace = g;
						n.oldScore = w;
						n.confirmScore = w;

						n.onMyDataCallback && n.onMyDataCallback(g, w, true);
						n.onChangeOnlineCallback && n.onChangeOnlineCallback(b);

						n.resoveAndDropCallback(v)
					}
				}

				if ("BROKEN" === t && n.onBrokenEventCallback) {
					n.retryTime = 6e4;
					n.onBrokenEventCallback();
				}
				else {
					if(0 === t.indexOf("MISS")) {
						n.randomId = parseInt(t.replace("MISS ", ""), 10);

						if(n.onMissClickCallback)
							n.onMissClickCallback(n.randomId);
					}
					if(0 === t.indexOf("TR")) {

						var _ = t.replace("TR ", "").split(" ");
						n.oldScore += parseInt(_[0], 10);

						if(n.onMyDataCallback)
							n.onMyDataCallback(n.oldPlace, n.oldScore, true)
					}
				}

			}
		} catch (t) {
			console.error("ERROR:", t)
			this.reconnect(e)
		}
	}

	onOpen() {
		if(this.onOnlineCallback)
			this.onOnlineCallback();

		clearTimeout(this.forceOnlineTimer);
		this.retryTime = 1e3;
	}

	close() {
		this.allowReconnect = false
		clearTimeout(this.ttl)
		clearTimeout(this.forceOnlineTimer)
		clearInterval(this.tickTtl)
		this.selfClose()
	}

	selfClose() {
		if (this.ws) try {
			this.ws.close()
		} catch (e) {}
	}
	reconnect(e) {
		var t = this;
		if(this.allowReconnect) {
			clearTimeout(this.ttl);
			this.ttl = setTimeout(function() {
				t.run(e)
			}, this.retryTime);
			this.retryTime *= 1.3
		}
	}


	onChangeOnline(e) {
		this.onChangeOnlineCallback = e
	}
	onUserLoaded(e) {
		this.onUserLoadedCallback = e
	}
	onReceiveDataEvent(e) {
		this.onMyDataCallback = e
	}
	onMissClickEvent(e) {
		this.onMissClickCallback = e
	}
	onOffline(e) {
		this.onOfflineCallback = e
	}
	onOnline(e) {
		this.onOnlineCallback = e
	}
	onWaitEvent(e) {
		this.onWaitLoadCallback = e
	}
	onAlreadyConnected(e) {
		this.onAlredyConnectedCallback = e
	}
	onBrokenEvent(e) {
		this.onBrokenEventCallback = e
	}



	resoveAndDropCallback(e, t) {
		if(this.callbackForPackId[e]) {
			this.callbackForPackId[e].resolve(t);
			this.dropCallback(e);
		}
	}

	rejectAndDropCallback(e, t) {
		if(this.callbackForPackId[e]) {
			this.callbackForPackId[e].reject(t);
			this.dropCallback(e);
		}
	}

	dropCallback(e) {
		if(this.callbackForPackId[e]) {
			clearTimeout(this.callbackForPackId[e].ttl);
			delete this.callbackForPackId[e]
		}
	}


	onTickEvent() {

		if (null !== this.oldScore && (this.oldScore += this.tick, this.onMyDataCallback && (0 !== this.tick && this.onMyDataCallback(this.oldPlace, this.oldScore, true), this.tickCount++ % 100 === 0)) ) {
			
			console.log("onTickEvent");

			/*try {
				window.gtag("event", "chill", {
					event_category: p.a.getStartParams().groupId,
					event_label: "user",
					value: 0
				})
			} catch (e) {
				console.error("ERROR:", e)
			}*/
		}
	}



	sendClicks() {
		/*try {
			window.gtag("event", "click", {
				event_category: p.a.getStartParams().groupId,
				event_label: "user",
				value: this.clickCount / 1e3
			})
		} catch (e) {
			console.error("ERROR:", e)
		}*/

		this.clickPacks.push({
			count: this.clickCount,
			x: ++this.sendedPacks
		});

		this.clickCount = 0;

		this.clickTimer = null;
		this.queueTick();
	}

	sendPack(e, t) {
		var n = this;
		return new Promise(function(r, o) {
			try {
				var i = "C" + e + " " + n.randomId + " 1";

				if(n.connected)
					n.ws.send(i);
				else 
					n.onConnectSend.push(i);

				r(1)
			} catch (e) {
				n.dropCallback(t);
				o(e)
			}
		})
	}
	queueTick() {
		var e = this,
			t = this.clickPacks.shift();

		this.sendPack(t.count, t.x)
			.then(function(q) { })
			.catch (function(n) {
				console.error("ERROR:", n);
				e.clickPacks.push(t);

				setTimeout(function() {
					return e.queueTick();
				}, 1e3 + 5e3 * Math.random())
			});
	}

	click() {
		var e = this;
		if(this.clickCount >= this.ccp) {
			console.error("ERROR", "BADD ccp");
			return;
		}

		this.clickCount++

		if(null === this.clickTimer) {
			this.clickTimer = setTimeout(function() {
				e.sendClicks();
			}, 1200);
		}

		/*setTimeout(function() {
			if(null === e.oldScore)
				return;

			e.oldScore++;
			if(e.onMyDataCallback) {
				e.onMyDataCallback(-1, e.oldScore, true);
			}

		}, 1);*/
	}

	buyItemById(e) {
		var t = this;
		return this.sendPackMethod(["B", e])
			.then(function(e) {
				return JSON.parse(e)
			})
			.then(function(e) {
				var n = e.tick,
					r = e.score,
					o = e.place;

				t.tick = parseInt(n, 10);
				t.oldScore = r;
				t.oldPlace = o;

				t.onMyDataCallback && setTimeout(function() {
					t.onMyDataCallback(t.oldPlace, t.oldScore)
				}, 1);

				return e
			});
	}

	getMyPlace() {
		var e = this;

		return this.sendPackMethod(["X"])
			.then(function(e) {
				return parseInt(e, 10)
			})
			.then(function(t) {
				e.oldPlace = t;
				return t;
			});
	}
	getUserScores(e) {
		return this.sendPackMethod(["GU"].concat(e))
			.then(function(e) {
				return JSON.parse(e);
			});
	}

	sendPackMethod(e) {
		var t = this,
			n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
		
		return new Promise(function(n, r) {
				var o = ++t.sendedPacks;
				try {
					var i = "P" + o + " " + e.join(" ");

					if(t.connected)
						t.ws.send(i);
					else 
						t.onConnectSend.push(i);

					t.setCallback(o, n, r);

				} catch (e) {
					t.dropCallback(o);
					r(e);
				}
			})
			.catch (function(r) {
				if (r && "TIMEOUT" === r.message && n < 3)
					return t.sendPackMethod(e, n + 1);
				throw r;
			});
	}
	setCallback(e, t, n) {
		var r = this;
		this.dropCallback(e);
		this.callbackForPackId[e] = {
			resolve: t,
			reject: n,
			ttl: setTimeout(function() {
				n(new Error("TIMEOUT"));
				r.dropCallback(e);
			}, 1e4 + Math.round(500 * Math.random()))
		}
	}

}

module.exports = VCoinWS;