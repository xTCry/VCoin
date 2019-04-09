const WebSocket = require('ws');
const safeEval = require('safe-eval');
class VCoinWS {
    constructor() {
        this.ws = null;
        this.ttl = null;
        this.retryTime = 1e3;
        this.onOnlineCallback = null;
        this.clickCount = 0;
        this.clickTimer = null;
        this.clickPacks = [];
        this.sendedPacks = 0;
        this.allowReconnect = true;
        this.randomId = null;
        this.oldPlace = null;
        this.oldScore = null;
        this.confirmScore = null;
        this.tick = 0;
        this.tickTtl = null;
        this.callbackForPackId = {};
        this.ccp = 10;
        this.connected = false;
        this.connecting = false;
        this.onConnectSend = [];
        this.tickCount = 0;
        this.wsServer = "";
        this.group_id = null;
        this.groupInfo = [];
        this.groupData = [];
    }
    run(wsServer, group_id, callback) {
        this.wsServer = wsServer || this.wsServer;
        this.selfClose();
        if (callback)
            this.onOnlineCallback = callback;
        try {
            if (group_id)
                this.group_id = group_id;
            this.ws = new WebSocket(this.wsServer);
            this.ws.onopen = _ => {
                this.connected = true;
                this.connecting = false;
                this.onConnectSend.forEach(e => {
                    if (this.ws)
                        this.ws.send(e);
                });
                this.onConnectSend = [];
                for (let pid in this.callbackForPackId) {
                    if (this.callbackForPackId.hasOwnProperty(pid) && this.ws) {
                        this.ws.send(this.callbackForPackId[pid].str)
                        clearTimeout(this.callbackForPackId[pid].ttl)
                        this.callbackForPackId[pid].ttl = setTimeout(function() {
                            this.callbackForPackId[pid].reject(new Error("TIMEOUT"))
                            this.dropCallback(pid)
                        }, 1e4)
                    }
                };
                this.onOpen();
                if (this.group_id)
                    this.loadGroup(this.group_id);
            };
            this.ws.onerror = e => {
                console.error("На стороне сервера возникла ошибка: " + e.message);
                this.retryTime = 1e3;
                this.reconnect(wsServer, true);
            }
            this.ws.onclose = _ => {
                this.connected = false;
                this.connecting = false;
                this.reconnect(wsServer);
                clearInterval(this.tickTtl);
                this.tickTtl = null;
                if (this.onOfflineCallback)
                    this.onOfflineCallback();
                this.ws = null;
            };
            this.ws.onmessage = ({
                data
            }) => {
                let t = data;
                if ("{" === t[0]) {
                    let data = JSON.parse(t);
                    if ("INIT" === data.type) {
                        let score = data.score,
                            place = data.place,
                            randomId = data.randomId,
                            items = data.items,
                            top = data.top,
                            tick = data.tick,
                            ccp = data.ccp,
                            firstTime = data.firstTime,
                            pow = data.pow;
                        this.randomId = randomId;
                        this.confirmScore = score;
                        this.oldScore = score;
                        this.oldPlace = place;
                        this.groupInfo = data.top.groupInfo;
                        if (pow)
                            try {
                                let x = safeEval(pow, {
                                        window: {
                                            location: {
                                                host: 'vk.com'
                                            },
                                            navigator: {
                                                userAgent: 'Mozilla/5.0 (Windows; U; Win98; en-US; rv:0.9.2) Gecko/20010725 Netscape6/6.1'
                                            }
                                        }
                                    }),
                                    str = "C1 ".concat(this.randomId, " ") + x;
                                if (this.connected) this.ws.send(str);
                                else this.onConnectSend.push(str);
                            } catch (e) {
                                console.error(e);
                            }

                        this.onUserLoadedCallback && this.onUserLoadedCallback(place, score, items, top, firstTime, tick);
                        this.onMyDataCallback && this.onMyDataCallback(place, score);
                        this.tick = parseInt(tick, 10);
                        this.tickTtl = setInterval(_ => {
                            this.onTickEvent();
                        }, 1e3);
                        this.ccp = ccp || this.ccp;

                    }
                } else if (-1 === t.indexOf("SELF_DATA") &&
                    -1 === t.indexOf("WAIT_FOR_LOAD") &&
                    -1 === t.indexOf("MISS") &&
                    -1 === t.indexOf("TR") &&
                    -1 === t.indexOf("BROKEN") &&
                    -1 === t.indexOf("ALREADY_CONNECTED") &&
                    "C" !== t[0] && "R" !== t[0])
                    console.log("on Message:\n", t);
                if ("R" === t[0]) {
                    let p = t.replace("R", "").split(" "),
                        d = p.shift();
                    this.rejectAndDropCallback(d, new Error(p.join(" ")))
                }
                if ("C" === t[0]) {
                    let h = t.replace("C", "").split(" "),
                        y = h.shift();
                    this.resoveAndDropCallback(y, h.join(" "));
                }
                if ("ALREADY_CONNECTED" === t) {
                    this.retryTime = 18e5;
                    if (this.onAlredyConnectedCallback)
                        this.onAlredyConnectedCallback();
                } else {
                    if (0 === t.indexOf("WAIT_FOR_LOAD")) {
                        if (this.onWaitLoadCallback)
                            this.onWaitLoadCallback(parseInt(t.replace("WAIT_FOR_LOAD ", ""), 10));
                        if (this.onChangeOnlineCallback)
                            this.onChangeOnlineCallback(parseInt(t.replace("WAIT_FOR_LOAD ", ""), 10));
                        if (0 === t.indexOf("MSG")) {
                            this.retryTime = 3e5;
                            if (this.onMessageEventCallback)
                                this.onMessageEventCallback(t.replace("MSG ", ""));
                        }
                    }
                    if (0 === t.indexOf("SELF_DATA")) {
                        let data = t.replace("SELF_DATA ", "").split(" ");
                        this.randomId = data[2];
                        let packId = parseInt(data[3], 10),
                            online = parseInt(data[4], 10),
                            _place = parseInt(data[0], 10),
                            _score = parseInt(data[1], 10);
                        this.oldPlace = _place;
                        this.oldScore = _score;
                        this.confirmScore = _score;
                        this.onMyDataCallback && this.onMyDataCallback(_place, _score, true);
                        this.onChangeOnlineCallback && this.onChangeOnlineCallback(online);
                        this.resoveAndDropCallback(packId);
                    }
                }
                if ("BROKEN" === t && this.onBrokenEventCallback) {
                    this.retryTime = 6e4;
                    this.onBrokenEventCallback();
                } else {
                    if (0 === t.indexOf("MISS")) {
                        this.randomId = parseInt(t.replace("MISS ", ""), 10);
                        if (this.onMissClickCallback)
                            this.onMissClickCallback(this.randomId);
                    }
                    if (0 === t.indexOf("TR")) {
                        let data = t.replace("TR ", "").split(" ");
                        let nscore = parseInt(data[0], 10),
                            from = parseInt(data[1]);
                        this.oldScore += nscore;
                        if (this.onTransferCallback)
                            this.onTransferCallback(from, nscore);
                        if (this.onMyDataCallback)
                            this.onMyDataCallback(this.oldPlace, this.oldScore, true);
                    }
                }
            }
            this.connecting = true;
        } catch (e) {
            console.error(e);
            this.reconnect(wsServer);
        }
    }
    onOpen() {
        if (this.onOnlineCallback)
            this.onOnlineCallback();
        this.retryTime = 1e3;
    }
    close() {
        this.allowReconnect = false
        clearTimeout(this.ttl)
        clearInterval(this.tickTtl)
        this.selfClose()
    }
    selfClose() {
        if (this.ws) try {
            this.ws.close()
        } catch (e) {
            this.connected = false;
        }
    }
    reconnect(e, force) {
        if (this.allowReconnect || force) {
            clearTimeout(this.ttl);
            this.ttl = setTimeout(_ => {
                this.run(e || this.wsServer);
            }, this.retryTime);
            this.retryTime *= 1.3
        }
    }
    onTransfer(e) {
        this.onTransferCallback = e
    }
    onChangeOnline(e) {
        this.onChangeOnlineCallback = e
    }
    onUserLoaded(e) {
        this.onUserLoadedCallback = e
    }
    onGroupLoaded(e) {
        this.onGroupLoadedCallback = e
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
    onMessageEvent(e) {
        this.onMessageEventCallback = e
    }
    onAlreadyConnected(e) {
        this.onAlredyConnectedCallback = e
    }
    onBrokenEvent(e) {
        this.onBrokenEventCallback = e
    }
    resoveAndDropCallback(e, t) {
        if (this.callbackForPackId[e]) {
            this.callbackForPackId[e].resolve(t);
            this.dropCallback(e);
        }
    }
    rejectAndDropCallback(e, t) {
        if (this.callbackForPackId[e]) {
            this.callbackForPackId[e].reject(t);
            this.dropCallback(e);
        }
    }
    dropCallback(e) {
        if (this.callbackForPackId[e]) {
            clearTimeout(this.callbackForPackId[e].ttl);
            delete this.callbackForPackId[e]
        }
    }
    async onTickEvent() {
        if (null !== this.oldScore && this.onMyDataCallback) {
            this.tickCount++;
            if (this.tickCount % 30 === 0) {
                try {
                    await this.getMyPlace();
                } catch (e) {}
            }
        }
    }
    async sendClicks() {
        this.clickPacks.push({
            count: this.clickCount,
            x: ++this.sendedPacks
        });
        this.clickCount = 0;
        this.clickTimer = null;
        await this.queueTick();
    }
    sendPack(e, t) {
        return new Promise((resolve, reject) => {
            try {
                let i = "C"
                    .concat(e, " ")
                    .concat(this.randomId, " 1");
                if (this.connected) this.ws.send(i);
                else this.onConnectSend.push(i);
                resolve(1);
            } catch (e) {
                this.dropCallback(t);
                reject(e);
            }
        })
    }
    async queueTick() {
        let t = this.clickPacks.shift();
        try {
            await this.sendPack(t.count, t.x);
        } catch (e) {
            console.error(e);
            this.clickPacks.push(t);
            setTimeout(async _ => {
                return await this.queueTick();
            }, 1e3 + 5e3 * Math.random());
        }
    }
    click() {
        if (this.clickCount >= this.ccp) {
            return;
        }
        this.clickCount++
        if (null === this.clickTimer) {
            this.clickTimer = setTimeout(async _ => {
                await this.sendClicks();
            }, 1200);
        }
    }
    async buyItemById(id) {
        let res;
        res = await this.sendPackMethod(["B", id]);
        res = JSON.parse(res);
        let n = res.tick,
            r = res.score,
            o = res.place;
        this.tick = parseInt(n, 10);
        this.oldScore = r;
        this.oldPlace = o;
        this.onMyDataCallback && setTimeout(_ => {
            this.onMyDataCallback(this.oldPlace, this.oldScore);
        }, 1);
        return res;
    }
    async transferToUser(id, sum = 3e4) {
        sum = Math.round(parseInt(sum) * 1e3);
        let res = await this.sendPackMethod(["T", id, sum]);
        res = JSON.parse(res);
        let t = res.score,
            a = res.place,
            r = res.reload;
        this.oldScore = t;
        this.oldPlace = a;
        this.onMyDataCallback && setTimeout(_ => {
            this.onMyDataCallback(this.oldPlace, this.oldScore);
        }, 1);
        return res;
    }
    async getMyPlace() {
        let res = await this.sendPackMethod(["X"]);
        res = parseInt(res, 10);
        this.oldPlace = res;
        return res;
    }
    async loadGroup(e) {
        let res = await this.sendPackMethod(["G", e]);
        this.groupData = JSON.parse(res);
        if (!this.groupData)
            return;
        this.onGroupLoadedCallback && this.onGroupLoadedCallback(this.groupInfo, this.groupData);
    }
    async getUserScores(e) {
        let res = await this.sendPackMethod(["GU"].concat(e));
        return JSON.parse(res);
    }
    sendPackMethod(e) {
        let t = this,
            n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
        return new Promise(function(n, r) {
                let o = ++t.sendedPacks;
                try {
                    let i = "P" + o + " " + e.join(" ");
                    if (t.connected)
                        t.ws.send(i);
                    else
                        t.onConnectSend.push(i);
                    t.setCallback(o, n, r);
                } catch (e) {
                    t.dropCallback(o);
                    r(e);
                }
            })
            .catch(function(r) {
                if (r && "TIMEOUT" === r.message && n < 3)
                    return t.sendPackMethod(e, n + 1);
                throw r;
            });
    }
    setCallback(e, t, n) {
        this.dropCallback(e);
        this.callbackForPackId[e] = {
            resolve: t,
            reject: n,
            ttl: setTimeout(_ => {
                n(new Error("TIMEOUT"));
                this.dropCallback(e);
            }, 1e4 + Math.round(500 * Math.random()))
        }
    }
}
class Miner {
    constructor() {
        this.score = 0;
        this.total = 0;
        this.stack = [];
        this.active = [];
    }
    setScore(q) {
        this.score = q;
    }
    setActive(q) {
        this.active = q;
    }
    hasMoney(e) {
        return this.score >= this.getPriceForItem(e);
    }
    getPriceForItem(e) {
        let price = Entit.items[e].price,
            count = 0;
        this.stack.forEach(el => {
            if (el.value === e)
                count = el.count;
        });
        return Entit.calcPrice(price, count + 1);
    }
    getItemCount(e) {
        let count = 0;
        this.stack.forEach(el => {
            if (el.value === e)
                count = el.count;
        });
        return count;
    }
    updateStack(items) {
        this.stack = Entit.generateStack(items.filter(e => ("bonus" !== e && "vkp1" !== e && "vkp2" !== e && "music" !== e)));
        let total = 0;
        this.stack.forEach(function(e) {
            let n = e.value,
                a = e.count;
            total += Entit.items[n].amount * a;
        });
        this.total = total;
    }
}
class EntitiesClass {
    constructor() {
        this.titles = {
            cursor: "Курсор",
            cpu: "Видеокарта",
            cpu_stack: "Стойка видеокарт",
            computer: "Суперкомпьютер",
            server_vk: "Сервер ВКонтакте",
            quantum_pc: "Квантовый компьютер",
            datacenter: "Датацентр",
        };
        this.items = {
            cursor: {
                price: 30,
                amount: 1
            },
            cpu: {
                price: 100,
                amount: 3
            },
            cpu_stack: {
                price: 1e3,
                amount: 10
            },
            computer: {
                price: 1e4,
                amount: 30
            },
            server_vk: {
                price: 5e4,
                amount: 100
            },
            quantum_pc: {
                price: 2e5,
                amount: 500
            },
            datacenter: {
                price: 5e6,
                amount: 1e3
            },
            vkp1: {
                price: 0,
                amount: 2e3
            },
            vkp2: {
                price: 0,
                amount: 1e4
            },
            music: {
                price: 0,
                amount: 4e3
            },
        };
        this.names = [
			"cursor",
			"cpu",
			"cpu_stack",
			"computer",
			"server_vk",
			"quantum_pc",
			"datacenter",
			// "vkp1",
			// "vkp2",
		];
    }
    generateStack(e) {
        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : (e, t) => (e === t),
            n = [];
        e.forEach(function(e) {
            if (0 === n.length)
                n.push({
                    count: 1,
                    value: e
                });
            else {
                let a = false;
                n.map(function(n) {
                    if (t(n.value, e)) {
                        n.count++;
                        a = true;
                    }
                    return n;
                });
                a || n.push({
                    count: 1,
                    value: e
                });
            }
        });
        return n;
    }
    calcPrice(price, count) {
        return (count <= 1) ? price : Math.ceil(1.3 * this.calcPrice(price, count - 1));
    }
    hashPassCoin(e, t) {
        return e + t - 1;
    }
}
const Entit = new EntitiesClass(),
    miner = new Miner();
module.exports = {
    Entit,
    VCoinWS,
    miner
};
