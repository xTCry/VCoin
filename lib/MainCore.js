(async _=> {

	const DEV_ID = /*vk.com/id*/191039467,
		LINK_XTCOIN = 0? "u.to/c0UeFQ": "xtcoin.mdewo.com" /*: "vk.cc/9gjvSG"*/;

	const url = require('url'),
		{ VK, AuthError, authErrors } = require('vk-io');

	// const VCoinWS = require('./VCoinWS');
	const { VCoinWS } = require('vcoinws');
	const { formateWSLink } = require('./hookVK');
	const {
		con, ccon, rl,
		rand, now, declOfNum,
		formateScore, declOfCoin,
		existsFile, existsAsync,
		writeFileAsync, appendFileAsync,
		infLog, initILog,
		IZCap, initIZCap,
		configSet, configGet,
		setColorsM, scanConfigs,
		askDonate, onUpdates,
		onlyInt, beep, setTitle, pJson,
		fullLog, safeStr, safeStr2,
		miner, Entity, colors,
		StateCmd, stateCmd,
	  } = require('./helpers');


	let USER_ID = false, TEMP_USER_ID = false;

	let vk = new VK();
	let URLWS = false;
	let boosterTTL = null,
		tryStartTTL = null,

		showLinkAdv = false,
		updatesEv = false,
		xRestart = true,
		updatesLastTime = 0,
		transferLastTime = 0,
		selectUserConfig = false;

	// Пользовательские настройки
	let EmbedURL, VK_TOKEN,
		g_id = 6+4e7+2e6+2e4+505e1+9e5, // ID группы
		useProxy = false,
		merchKey = false,
		greedyDeveloper = 0,
		updatesInterval = 60,
		pBeep = false,
		hideSpam = false,
		offColors = false,
		autoBuy = false,
		autoBuyItem = "datacenter",
		smartBuyItem = "",
		smartBuy = false,
		tforce = false,
		dateColorBG = "magenta",
		transferTo = false,
		transferScore = 3e4,
		transferInterval = 36e2;

	onUpdates(msg=> {
		if(!updatesEv) updatesEv = msg;
		ccon(colors.bold.underline(msg), "white", "Red");
	});

	function setUTitle(message) {
		let temp = "";
		showLinkAdv && (temp += "[GitHub.com/xTCry/VCoin/] - ");
		temp += ("VCoin");
		temp += (" [" + pJson.version + "]");
		USER_ID && (temp += " (@id" + safeStr2(USER_ID, 3) +  ")");
		temp += (" -> ");
		temp += (message);
		setTitle(temp);
	}


	// Инициализация главного модуля (:
	let vConinWS = new VCoinWS();

	vConinWS.onWaitEvent(e=> {
		e && con("onWaitEvent: "+e);
	});

	vConinWS.onUserLoaded(async (place, score, items, top, firstTime, tick, digits, tx)=> {
		con("Данные загружены");
		hideSpam && con("В топе: " + formateScore(place) + "\tCoins: "+ formateScore(score, true), "yellow");
		// con("Скорость майнинга: "+formateScore(tick, true)+" кликов/сек", "yellow");

		setUTitle("TOP: " + formateScore(place) + /*" :: Speed: " + formateScore(tick, true) +*/ " :: Coins: " + formateScore(score, true));
		// if(hideSpam) con("Майнинг в фоновом режиме. Включить вывод лога "+colors.bold("tspam"), "yellow");
		
		miner.setScore(score);
		miner.setActive(items);
		miner.updateStack(items);

		if (digits) {
			digits.forEach(el=> {
				let n = el.trend;
				let temp = (n==0)? "": " ("+colors[n>0? "green": "red"]((n>0?"↑ +":"↓ ") + formateScore(n, true))+")";

				con("[Trade] " + colors.white(el.description + ": " +colors.bold(formateScore(el.value, true))) + temp, "yellow");
			});
		}

		tx.length>0 && con("Переводов в истории: [" + colors.bold(tx.length) + "]. Для простотра пиши "+colors.bold.white("tx"));

		boosterTTL && clearInterval(boosterTTL);
		boosterTTL = setInterval(_=> {
			rand(0, 5)>3 && vConinWS.click();
		}, 5e2);
	});
	vConinWS.onReceiveDataEvent(async (place, score)=> {
		var n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];

		miner.setScore(score);

		setUTitle("TOP: " + formateScore(place) + /*" :: Speed: "+formateScore(vConinWS.tick, true)*/ + " :: Coins: " + formateScore(score, true));

		if(place > 0 && !rl.isQst) {

			transferProcess(place, score);
			// buyProcess(place, score);

			if(updatesEv && !rand(0, 1) && (now() - updatesLastTime > updatesInterval) && (updatesLastTime != 0 && !hideSpam)) {
				con(updatesEv + "\t введи hideupd чтобы скрыть это", "white", "Red");
				updatesLastTime = now();
			}

			!hideSpam && con("В топе: " + formateScore(place) + "\tCoins: "+ formateScore(score, true), "yellow");
			hideSpam && (false) && process.stdout.write("В топе: " + formateScore(place) + "\tCoins: "+formateScore(score, true)+"\r");

			let trsum = 3e5;
			if(!transferScore && score > 3e6*3 || transferScore < trsum / (1e3 * 0.999) && (trsum=transferScore * 0.9)) boosterTTL && await askDonate(vConinWS, trsum);
			// process.stdout.write("В топе: " + formateScore(place) + "\tCoins: "+formateScore(score, true)+"\r");
		}
	});

	async function transferProcess(place, score) {
		if(transferTo && transferScore*1e3 < score && !rand(0, 2) && ((now() - transferLastTime) > transferInterval)) {
			try {
				await vConinWS.transferToUser(transferTo, transferScore);
				let template = "Автоперевод ["+formateScore(transferScore*1e3, true)+"] "+declOfCoin(score)+" от @id"+USER_ID+" для " + colors.underline("vk.com/id"+transferTo);
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
					let template = "[AutoBuy] Было куплено ускорение: " + Entity.title(autoBuyItem);
					con(template, "black", "Green");
					try { await infLog(template); } catch(e) {}
				} catch(e) {
					if(e.message == "NOT_ENOUGH_COINS") con("Недостаточно средств для покупки " + Entity.title(autoBuyItem)+"a", true);
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
			let min = Math.min.apply(null, prices);

			switch (prices.indexOf(min)) {
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
					break;
			}

			if(miner.hasMoney(smartBuyItem)) {
				try {
					result = await vConinWS.buyItemById(smartBuyItem);
					miner.updateStack(result.items);
					let template = "[SmartBuy] Был куплен " + Entity.title(smartBuyItem);
					con(template, "black", "Green");
					try { await infLog(template); } catch(e) {}
				} catch(e) {
					if(e.message == "NOT_ENOUGH_COINS") con("Недостаточно средств для покупки " + Entity.title(smartBuyItem)+"a", true);
					else con(e.message, true);
				}
			}
		}
	}

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

	vConinWS.onTransfer(async (id, score)=> {
		let template = "Для @id" + USER_ID + " пришло [" + formateScore(score, true) + "] "+declOfCoin(score)+" от " + colors.underline("vk.com/id"+id);
		!hideSpam && !rl.isQst && con(template, "black", "Green");
		try { await infLog(template); }
		catch(e) { }
	});

	// Errors
	vConinWS.onBrokenEvent(_=> {
		setUTitle("[ERROR:] onBrokenEvent");
		con("BrokenEvent", true);
		pBeep&&beep(3, 6e2);
		xRestart = false;
		forceRestart(5e3, true);
	});
	vConinWS.onOffline(_=> {
		setUTitle("[ERROR:] Offline");
		if(!xRestart) return;
		con("onOffline\nПопытка рестарта через 20 секунд", true);
		forceRestart(2e4);
	});
	vConinWS.onAlreadyConnected(_=> {
		setUTitle("[ERROR:] Two tabs open");
		con("Открыто две вкладки. Рестарт через 30 секунд", true);
		pBeep&&beep(4, 6e2);
		forceRestart(30e3);
	});
	vConinWS.onMessageEvent(msg=> {
		con("Сообщение: "+msg, "yellow");
		pBeep&&beep(4, 6e2);
		forceRestart(30e3);
	});

	async function startBooster(tw) {	
		tryStartTTL && clearTimeout(tryStartTTL);
		tryStartTTL = setTimeout(()=> {
			con("Подключение к серверу...");

			vConinWS.userId = USER_ID;
			vConinWS.run(URLWS, _=> {
				con("Бот запущен");
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

	function justPrices() {
		return Entity.names.map(el=> {
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
		let wordsLine = line.trim().toLowerCase().split(" ");

		switch(wordsLine[0]) {
			case '':
				break;

			case 'debug':
				console.log("updatesInterval", updatesInterval);
				console.log("updatesLastTime", updatesLastTime);
				console.log("xRestart", xRestart);
				console.log("autobuy", autoBuy);
				console.log("autoBuyItem", autoBuyItem);
				console.log("smartBuy", smartBuy);
				console.log("greedyDeveloper", greedyDeveloper);
				console.log("useProxy", useProxy);
				console.log("merchKey", merchKey);
				console.log("transferTo", transferTo);
				console.log("transferScore", transferScore);
				console.log("transferInterval", transferInterval);
				console.log("transferLastTime", transferLastTime);
				console.log("hideSpam", hideSpam);
				console.log("g_id", g_id);
				break;

			case 'info':
				ccon(" -- INFO --", "red");
				// ccon(" - Speed: "+colors.bold(formateScore(vConinWS.tick, true))+" coins/sec", "green");
				ccon(" - Счёт: "+ colors.bold(formateScore(miner.score, true)) +" "+ declOfCoin(miner.score), "green");
				
				try {
					let user = (await vk.api.users.get())[0];
					ccon(" - Пользователь: [" + colors.bold(user.first_name +" "+user.last_name) + "] @id"+USER_ID, "green");
				} catch(e) { }

				if(g_id) {
					temp = await vConinWS.getGroup(g_id);
					ccon(" - Группа: ["+colors.bold(temp.name)+"] @public"+g_id+"", "green");
				}
				break;

			case 'ginfo':
				temp = await rl.questionAsync("ID группы: ");
				if(!temp) break;

				temp = await vConinWS.getGroup(temp);
				ccon(" - Group: ["+colors.bold(temp.name)+"] @public"+temp.id+"", "green");
				
				break;

			case 'tx':
			case 'his':
			case 'history':
				printTxList(wordsLine[1]);
				break;

			case 'mkey':
				temp = await vConinWS.getMerchantKey();
				if(temp === null) {
					con("Мерчант уже был создан или сервер не отвечает", true);
					if(merchKey)
						con("Ранее сохраненный Merchant Key: [ "+ colors.bold(merchKey)+" ]")
				}
				else {
					merchKey = temp;
					con("Merchant Key: [ " + colors.bold(merchKey) + " ]");
					await configSet("merchKey", merchKey, true);
				}
				break;

			case 'coins':
			case 'gscore':
				temp = await rl.questionAsync("ID пользователя [если пусто, то коины текущией страницы]: ");
				try {
					let user_ids = !temp? [ USER_ID ]: temp.split(" ");
					let usersData=[];
					try {
						usersData = (await vk.api.users.get({
							user_ids, name_case: "gen"
						}));
					} catch(e) {
						user_ids.forEach(id=> {
							usersData.push({ id });
						});
					}

					let gscore = await vConinWS.getUserScores(usersData.map(e=> e.id));
					temp = usersData.map(e=> (e.score = gscore[e.id] || 0, e));
					ccon("Получено ["+temp.length+"] пользователей");
					temp.forEach(el=> {
						ccon(" * @id"+el.id+" \t["+ formateScore(el.score, true) + "] "+declOfCoin(el.score)+" "+(el.first_name? " у "+el.first_name+" "+el.last_name: ""));
					});
				} catch(e) { ccon("Не смогли получить. "+ e.message, true); }
				break;

			case 'datecolorbg':
				stateCmd(StateCmd.COLORS);
				temp = await rl.questionAsync("Цвет фона для даты [black, red, green, yellow, blue, magenta, cyan, white]: ");
				stateCmd(StateCmd.NONE);
				temp = temp.toLowerCase();

				if(temp == "") break;
				if([ "black", "red", "green", "yellow", "blue", "magenta", "cyan", "white" ].includes(temp)) {
					dateColorBG = temp;
					colors.setTheme({
						dateBG: dateColorBG+"BG"
					});
					await configSet("dateColorBG", dateColorBG, true);
				} else ccon("Неверный цвет.")
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
				temp = miner.listPrices();
				ccon("-- Цены ускорений --", "red");
				ccon(temp);
				break;

			case 'b':
			case 'buy':
				temp = miner.listPrices(true);
				ccon("-- Доступные ускорения и их цены --", "red");
				ccon(temp);
				stateCmd(StateCmd.ITEMS, el=> miner.hasMoney(el));
				item = await rl.questionAsync("Введи название ускорения [cursor, cpu, cpu_stack, computer, server_vk, quantum_pc, datacenter]: ");
				stateCmd(StateCmd.NONE);

				let items = item.split(" "), result = false;
				for(let item of items) {
					if (!item) return;
					
					try {
						result = await vConinWS.buyItemById(item);
						miner.updateStack(result.items);
					} catch (e) {
						result = false;
						if (e.message == "NOT_ENOUGH_COINS") con("Недостаточно средств для покупки "+Entity+".", true);
						else if (e.message == "ITEM NOT FOUND") con("Предмет не найден.", true);
						else con(e.message, true);
					}
				};

				/*if(result) {
					miner.updateStack(result.items);
					con("Текущая скорость: " + formateScore(result.tick, true) + " коинов/сек");
				}*/

				break;

			case 'autobuyitem':
				stateCmd(StateCmd.ITEMS);
				item = await rl.questionAsync("Введи название ускорения для автопокупки [cursor, cpu, cpu_stack, computer, server_vk, quantum_pc, datacenter]: ");
				stateCmd(StateCmd.NONE);
				if(!item || !Entity.title(item)) return;
				con("Для автопокупки выбрано: " + Entity.title(item));
				autoBuyItem = item;
				if(!autoBuy) {
					stateCmd(StateCmd.CONFIRM, _=> true);
					temp = await rl.questionAsync("Включить autoBuy? [yes]: ");
					stateCmd(StateCmd.NONE);
					if(temp == "yes") autoBuy = true;
				}
				configSet("autoBuyItem", autoBuyItem);
				configSet("autoBuy", autoBuy, true);
				break;

			case 'autobuy':
				autoBuy = !autoBuy;
				con("Автопокупка: "+(autoBuy? "Включена": "Отключена"));
				smartBuy = false;
				configSet("smartBuy", smartBuy, true);
				con("Умная покупка: "+(smartBuy? "Включена": "Отключена"));
				break;

			case 'smartbuy':
				smartBuy = !smartBuy;
				con("Умная покупка: "+(smartBuy? "Включена": "Отключена"));
				autoBuy = false;
				configSet("autoBuy", autoBuy, true);
				con("Автопокупка: "+(autoBuy? "Включена": "Отключена"));
				break;

			case 'tran':
			case 'transfer':
				ccon("Перевод коинов");
				let count = await rl.questionAsync("Сколько перевести: ");
				count = onlyInt(count);
				if(!count) return con("Отменено", true);
				let id = await rl.questionAsync("ID получателя: ");
				try {
					temp = (await vk.api.users.get({
						user_ids: id, name_case: "dat"
					}))[0];
					id = temp.id;
				} catch(e) {
					temp = { };
					// ccon("Не смогли получить ID пользователя. "+e.message);
				}
				id = onlyInt(id);

				stateCmd(StateCmd.CONFIRM, _=> true);
				let conf = await rl.questionAsync("Перевести " + formateScore(count*1e3, true) + " "+declOfCoin(count)+" для "+(temp.first_name? "["+temp.first_name+" "+temp.last_name+"]": "")+"(@id"+ id +")? [yes]: ");
				stateCmd(StateCmd.NONE);
				if(conf != "yes" || !id) return con("Отменено", true);

				try {
					await vConinWS.transferToUser(id, count);
					con("Успешный перевод.", "black", "Green");
					let template = "Отправили ["+formateScore(count*1e3, true)+"] "+declOfCoin(count)+" от @id"+USER_ID+" для vk.com/id"+id;
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

			case 'to':
				stateCmd(StateCmd.CUSTOM, _=> "disable");
				item = await rl.questionAsync("Введите ID пользователя [disable для отключения автоперевода]: ");
				stateCmd(StateCmd.NONE);
				if(!item) break;
				if (item == "disable") {
					transferTo = false;
					break;
				}
				try {
					temp = (await vk.api.users.get({
						user_ids: item, name_case: "gen"
					}))[0];
					transferTo = onlyInt(temp.id);
					con("Автоматический перевод коинов на аккаунт "+(temp.first_name? "["+temp.first_name+" "+temp.last_name+"]": "")+"(@id"+ transferTo +")");
					configSet("transferTo", transferTo, true);
				} catch(e) {
					ccon("Не получилось сменить ID получателя. "+e.message, true);
				}
				break;

			case 'token':
				if(VK_TOKEN) {
					stateCmd(StateCmd.CONFIRM, _=> true);
					let conf = await rl.questionAsync("Токен уже установлен. Сменить? [yes]: ");
					stateCmd(StateCmd.NONE);
					if(conf != "yes") return;
				}
				ccon("↓↓↓ Введите токен ↓↓↓");
				rl.hideMode = true;
				let _token = await rl.questionAsync("");
				rl.hideMode = false;
				if(!_token) return;

				// Check token
				try {
					vk.token = _token;
					let { id } = (await vk.api.users.get())[0];
					if(!id) throw("Не удалось получить ID пользователя");
					if(USER_ID != id) throw("Токен не принадлежит текущему ID пользователя. Для установки этого токена создайте новый конфиг.");
					VK_TOKEN = _token;
					configSet("VK_TOKEN", VK_TOKEN, true);
					ccon("Токен усепшно установлен");
				} catch(e) {
					if(e.code == 5) ccon("Введен "+colors.underline("недействительный")+" токен.", true);
					else ccon("Не удалось установить токен. "+e.message, true);
				}
				break;

			case 'gid':
				if(g_id) {
					stateCmd(StateCmd.CONFIRM);
					temp = await rl.questionAsync("ID группы уже установлен. Сменить? [yes]: ");
					stateCmd(StateCmd.NONE);
					if(temp != "yes") return;
				}

				let owner_id = await rl.questionAsync("ID группы (без минуса, только ЦИФРЫ): ");
				if(!owner_id) break;

				owner_id = onlyInt(owner_id)*-1;
				try {
					ret = (await vk.api.call("execute.resolveScreenName", {
						screen_name: "app6915965_"+owner_id,
						owner_id,
						func_v: 3,
						v: "5.55"
					})).response;

					if(!ret.embedded_uri || !ret.embedded_uri.view_url)
						throw "Не удалось получить ссылку с ID группы. Скорее всего, токен не от Android. #2";
					else if (ret.original_url == "https://vk.com/coin" || ret.embedded_uri.view_url.indexOf("vk_group_id") === -1)
						throw "ID группы в ссылке не обнаружен. Скорее всего, у группы не подключено приложение VK Coin";
					else {
						EmbedURL = ret.embedded_uri.view_url;

						g_id = owner_id;
						configSet("g_id", g_id, true);
						configSet("EmbedURL", EmbedURL, true);

						ccon("ID группы и ссылка усепшно установлены.", "yellow");
						ccon("Для того чтобы изменения вступили в силу, нужно перезапустить приложение.");
					}


				} catch(e) {
					if(e.message && e.message.indexOf("Unknown method passed") !== -1) {
						ccon("Не удалось получить ссылку. Скорее всего, токен не от Android.");
					}
					else {
						if(e.code == 5) ccon("Токен стал "+colors.underline("недействительным")+".", true);
						else con(e.message, true);
					}
				}

				break;

			case 'ti':
				item = await rl.questionAsync("Введите интервал: ");
				if(!item) return;
				transferInterval = parseInt(item);
				con("Интервал для автоматического перевода " + transferInterval + " секунд.");
				configSet("transferInterval", transferInterval, true);
				break;

			case 'tsum':
				item = await rl.questionAsync("Введите сумму: ");
				if(!item) return;
				transferCoins = parseInt(item);
				con("Количество коинов для автоматического перевода " + transferCoins + "");
				configSet("transferCoins", transferCoins, true);
				break;

			case 'color':
				setColorsM(offColors=!offColors);
				con("Цвета " + (offColors? "от": "в") + "ключены (*^.^*)", "blue", "White");
				configSet("offColors", offColors, true);
				break;

			case 'tspam':
				hideSpam = !hideSpam;
				con("Вывод обновления коинов в консоль " + (hideSpam? "от": "в") + "ключен (*^.^*)", "blue", "White");
				configSet("hideSpam", hideSpam, true);
				break;

			case 'beep':
				pBeep = !pBeep;
				pBeep&&beep(2, 8e2);
				con("Звуковое сопровождение " + (!pBeep? "от": "в") + "ключено (*^.^*)", "blue", "White");
				configSet("pBeep", pBeep, true);
				break;

			case "?":
			case "h":
			case "help":
				ccon("-- VCoins ["+colors.zebra(pJson.version)+"] --", "red");
				temp = [
					"info		- информация",
					"coins		- сколько коинов у пользователя",
					"stop		- остановит бота",
					"run		- запустит бота",
					"buy		- покупка ускорений",
					"tran		- перевод коинов",
					"gid		- установить ID групп",
					"price		- цены на данный момент",
					"color		- вкл/выкл режима цветной консоли",
					"hideupd		- скрыть уведомление о новой версии",
					"autoBuy		- вкл/откл автопокупки",
					"autoBuyItem 	- какое ускорение покупать",
					"smartBuy	- вкл/откл умную покупку",
					"tspam		- вкл/откл вывод обновления коинов к консоль",
					"beep		- вкл/откл звука",
					"datecolorbg - задать цвет фона времени",
					"ginfo 		- информация о группе",
					"tx [page]	- посмотреть историю переводов",
	            ].join('\n');

	            ccon(colors.italic(temp));
				break;

			default:
				stateCmd(StateCmd.NONE);
				break;
		}
	});
	// END

	// Idea from @Jeronyson
	async function printTxList(page = 1, tranPerPage = 20) {
		try {
			let tx = await vConinWS.getTxList();
			let txData = await vConinWS.getTxData(tx);

			page = parseInt(page);

			if (page < 1)
				page = 1;

			if (txData.length > 0) {
				ccon("*** Переводов: [" + txData.length+"] ***", "yellow");
				let maxPage = Math.ceil(txData.length / tranPerPage);
				
				if (page > maxPage)
					page = maxPage;
				
				txData.reverse();
				txData = txData.slice((page - 1) * tranPerPage, (page - 1) * tranPerPage + tranPerPage);
				
				let user_ids = [],
					idArray = txData.map(({ from_id }) => from_id);
				idArray = idArray.concat(txData.map(({ to_id }) => to_id));
				
				idArray.forEach((value, index, self)=> {
					if (self.indexOf(value) === index) {
						user_ids.push(value);
					}
				});
				let usersInfo = [];
				try {
					usersInfo = await vk.api.users.get({ user_ids })
				} catch(e) { };

				txData.forEach(el=> {
					let isOut = el.from_id == USER_ID;
					let template = " ["+txTime(el.created_at) + "] > ";
					let userData = usersInfo.find(x => x.id === (isOut? el.to_id: el.from_id));
					if (userData) {
						template += "(" + userData.first_name + " " + userData.last_name + ")";
					}
					template += "@id" + (isOut? el.to_id: el.from_id);
					template += " перевод: ";
					let amount = colors.bold[isOut? "red": "green"]((isOut? "-": "+") + formateScore(el.amount, true));
					ccon(template + amount + " " + declOfCoin(el.amount), "white");
				});
				ccon("*** -------------------- ***", "yellow");

				(page != maxPage) && ccon("Страница " + colors.bold(page) + "/" + colors.bold(maxPage) + " (след. стр. "+ colors.bold("tx " + page) + ")", "white");
			}
			else {
				con('Переводов нет. Попробуйте еще раз');
			}
		} catch (e) {
			console.error('Ошибка при получении истории транзакций:', e)
		}
	}
	function txTime(e) {
		const pt = (e=> e<10? "0"+e: e);
		if("number" === typeof e) e *= 1e3;
		let t = new Date(e);
		return pt(t.getDate()) + "." + pt(t.getMonth() + 1) + " " + pt(t.getHours()) + ":" + pt(t.getMinutes());
	}


	// Parse arguments
	for (let argn = 2; argn < process.argv.length; argn++) {
		let cTest = process.argv[argn],
			dTest = process.argv[argn + 1], warn = false;

		switch(cTest.trim().toLowerCase()) {

			// User ID
			case '-uid': {
				if(dTest && dTest.length > 1 && dTest.length < 15) {
					con("Установлен ID пользователя.", "blue", "White");
					TEMP_USER_ID = onlyInt(dTest);
				} else warn = cTest;
				argn++;
				break;
			}

			// Token
			case '-t': {
				if(dTest && dTest.length > 80 && dTest.length < 90) {
					con("Установлен токен.", "blue", "White");
					VK_TOKEN = dTest;
				} else warn = cTest;
				argn++;
				break;
			}

			// Custom URL
			case '-u':
			case '-url': {
				if(dTest && dTest.length > 200 && dTest.length < 380) {
					con("Установлен кастомный URL.", "blue", "White");
					EmbedURL = dTest;
				} else warn = '-url';
				argn++;
				break;
			}

			// Group ID
			case '-gid':
			case '-group': {
				if(dTest && dTest.length > 1 && dTest.length < 10) {
					con("Установлен ID группы", "blue", "White");
					g_id = onlyInt(dTest);
				} else warn = cTest;
				argn++;
				break;
			}

			// Transfer to ID
			case '-to': {
				if(dTest && dTest.length > 1 && dTest.length < 11) {
					transferTo = onlyInt(dTest);
					con("Автоматический перевод на vk.com/id"+transferTo, "blue", "White");
				} else warn = cTest;
				argn++;
				break;
			}

			// Transfer interval
			case '-ti': {
				if(dTest && dTest.length > 1 && dTest.length < 10) {
					transferInterval = parseInt(dTest);
					con("Интервал автоперевода "+transferInterval+" секунд", "blue", "White");
				} else warn = cTest;
				argn++;
				break;
			}
			
			// Transfer summ
			case '-tsum': {
				if(dTest && dTest.length > 1 && dTest.length < 10) {
					transferScore = parseInt(dTest);
					con("Сумма автоперевода "+transferScore, "blue", "White");
				} else warn = cTest;
				argn++;
				break;
			}

			// Set autoBuy Item
			case '-autobuyitem': {
				if(dTest && dTest.length > 1 && dTest.length < 20) {
					if(!Entity.title(dTest)) return;
					con("Для автопокупки выбрано: "+Entity.title(dTest), "blue", "White");
					autoBuyItem = dTest;
				} else warn = cTest;
				argn++;
				break;
			}

			case '-donate': {
				if(dTest && dTest.length > 1 && dTest.length < 20) {
					let temp = onlyInt(dTest),
						perc = (dTest.indexOf("%") !== -1 && temp > 0 && temp <= 50);
					greedyDeveloper = perc? temp/100: temp;
					con("Донат коинов " + (perc?"в процентах от перевода ":"") + "при переводе: ["+greedyDeveloper+"].", "blue", "White");
				} else warn = cTest;
				argn++;
				break;
			}


			// Select of user config
			case '-slist': {
				selectUserConfig = true;
				break;
			}

			// Force token
			case '-tforce': {
				con("Токен принудительно.", "blue", "White");
				tforce = true;
				break;
			}

			case '-black': {
				fullLog() && con("Цвета отключены (*^.^*)", "blue", "White");
				setColorsM(offColors=!offColors);
				break;
			}

			// Автоматическая закупка
			case '-autobuy': {
				con("Автоматическая покупка активирована.", "blue", "White");
				autoBuy = true;
				break;
			}

			// Автоматическая умная закупка
			case '-smartbuy': {
				con("Умная покупка активирована.", "blue", "White");
				smartBuy = true;
				autoBuy = false;
				break;
			}

			// Full log mode
			case '-flog': {
				fullLog(true);
				break;
			}

			// Power beep
			case '-beep': {
				con("Звуковое сопровождение.", "blue", "White");
				pBeep = true;
				pBeep&&beep(2, 8e2);
				break;
			}

			// Hide spam
			case '-hidespam': {
				hideSpam = true;
				break;
			}

			// Use TOR Proxy
			case '-proxy': {
				useProxy = true;
				break;
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
				ccon("-gid [ID] 		- задать ID группы");
				ccon("-autobuy			- автопокупка определенного ускорения");
				ccon("-smartbuy			- умная покупка");
				ccon("-hidespam			- отключить вывод обновления коинов в консоль");
				ccon("-beep				- звуковое сопровождение");
				ccon("-proxy			- включить TOR proxy");
				
				ccon("-donate [sum%]	- донатить разработчику X% при переводах");
				ccon("-donate [sum]		- донатить разработчику X коинов при переводах");
				process.exit();
				break;
			}

			default:
				break;
		}

		if(warn)
			ccon("[ВНИМАНИЕ!] Аргумент ("+colors.bold(warn)+") указан с неверным параметром. Это может привести к неправильной работе.", true)

		// if ([ "-u", "-t", "-to", "-ti", "-tsum", "-autobuyitem", "-donate" ].includes(process.argv[argn]))
		// 	argn++;
	}

	async function createNewConfig(exit, authType) {
		!exit && ccon("Мастер настройки пользователя", "yellow");

		if(!authType) {
			stateCmd(StateCmd.CUSTOM, _=> ("token, password, url"));
			authType = await rl.questionAsync("С помощью чего авторизироваться? [token/password/url]: ");
			stateCmd(StateCmd.NONE);
		}

		if(authType == "token") {
			ccon("Если нету Android токена, то получить его можно тут -> " + colors.underline(""));
			ccon("↓↓↓ Введите токен ↓↓↓");
			rl.hideMode = true;
			let _token = await rl.questionAsync("");
			rl.hideMode = false;
			if(!_token) throw "Создание конфигурации отменено.";

			// Check token
			try {
				vk.token = _token;
				let { id } = (await vk.api.users.get())[0];
				if(!id) throw("Не удалось получить ID пользователя.");
				
				VK_TOKEN = _token;
				TEMP_USER_ID = id;
				ccon("Токен установлен.");
				return true;
			} catch(e) {
				if(e.code == 5) ccon("Введен "+colors.underline("недействительный")+" токен.", true);
				else ccon("Не удалось установить токен. "+e.message, true);
				return false;
			}
		}
		else if(authType == "password") {

			let res = await loginVK();

			if(res && res.user > 0) {
				VK_TOKEN = res.token;
				TEMP_USER_ID = res.user;
				ccon("Токен установлен.");
				return true;
			}
			else {
				ccon("Проблема с авторизацией. Попробуйте еще раз", true);
				return createNewConfig(true, authType);
			}
			return true;
		}
		else if(authType == "url") {
			ccon("Желательно указать Android токен. Получить его можно тут -> " + colors.underline(LINK_XTCOIN));
			let _url = await rl.questionAsync("Введите ссылку: ");
			if(!_url) throw "Создание конфигурации отменено.";

			let GSEARCH = url.parse(_url, true);
			if(!GSEARCH.query || !GSEARCH.query.vk_user_id) {
				throw "В ссылке не указан аргумент [vk_user_id]";
			}
			EmbedURL = _url;
			TEMP_USER_ID = parseInt(GSEARCH.query.vk_user_id);
			return true;
		}
		else {
			if(exit) throw "Авторизация отменена";
			else return /*await*/ createNewConfig(true);
		}
	}

	async function loginVK() {

		let login = await rl.questionAsync("Лоигн: ");

		console.log("Пароль: ");
		rl.hideMode = true;
		let password = await rl.questionAsync("");
		rl.hideMode = false;

		vk.setOptions({
			login,
			password,
		});

		const direct = vk.auth.androidApp();

		vk.captchaHandler = async ({ src, type }, retry)=> {
			let key = await rl.questionAsync("Введи капчу ["+src+"]: ");

			try {
				await retry(key);
				ccon('Успешно', "yellow");
			} catch (e) { ccon(e.message, true); }
		};
		vk.twoFactorHandler = async (none, retry)=> {
			let code = await rl.questionAsync("Введи 2FA код: ");

			try {
				await retry(code);
				ccon('Успешно', "yellow");
			} catch (e) { ccon(e.message, true); }
		};


		let res = false;
		try {
			res = await direct.run();
		} catch(e) {
			if (e instanceof AuthError) {
				if (e.code === authErrors.AUTHORIZATION_FAILED) {
					console.error(e.message);
					ccon('Авторизация провалилась', true);
				}
				else if (e.code === authErrors.PAGE_BLOCKED) {
					ccon('Страница заблокирована :c', true);
				}
				else console.error(e);
			}
		}
		
		return res;
	}

	async function InitApp(uid) {
		let temp;

		initILog(uid);
		initIZCap(uid);

		let g;
		try {
			g = await IZCap().load();
		} catch(e) {};

		if(g) fullLog() && ccon("Конфигурация загружена", "yellow");
		else throw "Пользователь с таким ID не сохранен.";

		{
			EmbedURL = (temp = configGet("EmbedURL", EmbedURL))? temp: EmbedURL;
			VK_TOKEN = (temp = configGet("VK_TOKEN", VK_TOKEN))? temp: VK_TOKEN;
			g_id = (temp = configGet("g_id", g_id))? temp: g_id;		
			greedyDeveloper = configGet("greedyDeveloper", greedyDeveloper);
			useProxy = configGet("useProxy", useProxy);
			merchKey = configGet("merchKey", merchKey);
			updatesInterval = configGet("updatesInterval", updatesInterval);
			pBeep = configGet("pBeep", pBeep);
			hideSpam = configGet("hideSpam", hideSpam);
			offColors = configGet("offColors", offColors);
			autoBuy = configGet("autoBuy", autoBuy);
			autoBuyItem = configGet("autoBuyItem", autoBuyItem);
			smartBuyItem = configGet("smartBuyItem", smartBuyItem);
			smartBuy = configGet("smartBuy", smartBuy);
			tforce = configGet("tforce", tforce);
			dateColorBG = configGet("dateColorBG", dateColorBG);
			transferTo = configGet("transferTo", transferTo);
			transferScore = configGet("transferScore", transferScore);
			transferInterval = configGet("transferInterval", transferInterval);
		}

		colors.setTheme({
			dateBG: dateColorBG+"BG"
		});

		return true;
	}
	async function SaveApp(firstInit) {
		
		try {
			if(!TEMP_USER_ID)
				await InitApp(USER_ID);
		} catch(e) {
			ccon("Ошибка инициализации конфига: "+e.message, true);
		}

		setUTitle("Saving...");
		fullLog() && ccon("Сохранение конфигурации...", "yellow");

		{
			configSet("EmbedURL", EmbedURL);
			configSet("VK_TOKEN", VK_TOKEN);
			configSet("g_id", g_id);
			configSet("greedyDeveloper", greedyDeveloper);
			configSet("useProxy", useProxy);
			configSet("merchKey", merchKey);
			configSet("updatesInterval", updatesInterval);
			configSet("pBeep", pBeep);
			configSet("hideSpam", hideSpam);
			configSet("offColors", offColors);
			configSet("autoBuy", autoBuy);
			configSet("autoBuyItem", autoBuyItem);
			configSet("smartBuyItem", smartBuyItem);
			configSet("smartBuy", smartBuy);
			configSet("dateColorBG", dateColorBG);
			configSet("tforce", tforce);
			configSet("transferTo", transferTo);
			configSet("transferScore", transferScore);
			await configSet("transferInterval", transferInterval, true); // true - Save config
		}

		if(TEMP_USER_ID != USER_ID || firstInit) {
			fullLog() && ccon("Конфигурация для @id"+USER_ID+" сохранена."); ccon("\n");
			// await rl.questionAsync("Короткая команда для запуска: "+colors.underline.bold.green("node . -uid "+USER_ID)+" [Нажми Enter для продолжения]");
			ccon("Короткая команда для запуска: "+colors.underline.bold.green("node . -uid "+USER_ID));
			ccon("\n");
		}
	}
	async function trySelectConfig(list) {
		let msg = "Выбор конфигурации пользователя:";

		for (let i = 0; i < list.length; i++) {
			msg += (i%2==0?"\n":"\t")+(i+1)+". User @id"+list[i].split(".")[0] + (i%2==0?"\t| ":"")
		}
		ccon(msg);
		
		let data = await rl.questionAsync("Введите номер пользователя [или Enter  для создания нового]: ");
		if(data >= 1 && data <= list.length) {
			return TEMP_USER_ID = onlyInt(list[data-1].split(".")[0]);
		}
		else {
			if(0 == data) return false;
			return await trySelectConfig(list);
		}
	}

	// Run application
	(async _=> {
		
		setUTitle("Loading...");
		ccon("Загрузка конфигурации...");
		
		let firstInit = false;
		if(selectUserConfig) {
			try {
				let res = await scanConfigs();
				if(res.length > 0) {
					res = await trySelectConfig(res);
					if(res) {
						ccon("Загрузка пользователя @id"+res, "yellow");
						ccon("Короткая команда для запуска этой конфигурации: "+colors.underline.bold.green("node . -uid "+res));
					}
				}
			} catch(e) {
				ccon("Не смогли получить конфигурации пользователей. "+e.message, true);
			}
		}

		try {
			if(TEMP_USER_ID)
				await InitApp(TEMP_USER_ID);
		} catch(e) { }


		if(!VK_TOKEN && !EmbedURL) {
			stateCmd(StateCmd.CONFIRM);
			let conf = await rl.questionAsync("Создать конфигурацю для нового пользователя? [yes]: ");
			stateCmd(StateCmd.NONE);
			if(conf == "yes") {
				try {
					await createNewConfig();
					try {
						if(TEMP_USER_ID)
							await InitApp(TEMP_USER_ID);
						firstInit = true;
					} catch(e) { }
				} catch(e) {
					ccon("Не удалось создать конфиг. "+e, true);
				}
			}

			if(!VK_TOKEN && !EmbedURL) {
				con("Токен не указан. Получить ТОКЕН можно тут -> " + colors.underline(LINK_XTCOIN), true);
				return process.exit();
			}
		}

		if(!EmbedURL || tforce || (VK_TOKEN && g_id && EmbedURL && EmbedURL.indexOf(g_id) === -1)) {

			(async function inVKProc(token, owner_id) {
				vk.token = token;
				try {

					let { id } = (await vk.api.users.get())[0];
					if(!id)
						throw("Не удалось получить ID пользователя");

					let ret, error = "";
					try {
						if(owner_id) {
							ret = (await vk.api.call("execute.resolveScreenName", {
								screen_name: "app6915965_"+owner_id,
								owner_id,
								func_v: 3,
								v: "5.55"
							})).response;

							// try { EmbedURL = ret.object.mobile_iframe_url; } catch(e) { }

							if(!ret.embedded_uri || !ret.embedded_uri.view_url)
								error += "Не удалось получить ссылку с ID группы. Скорее всего, токен не от Android. #2";
							else if (ret.original_url == "https://vk.com/coin" || ret.embedded_uri.view_url.indexOf("vk_group_id") === -1)
								error += "ID группы в ссылке не обнаружен. Скорее всего, у группы не подключено приложение VK Coin";
							else
								EmbedURL = ret.embedded_uri.view_url;
						}

					} catch(e) {
						
						if(e.message && e.message.indexOf("Unknown method passed") !== -1) {
							ccon("Получить рабочий Android токен можно тут -> " + colors.underline(LINK_XTCOIN), "yellow");
							error += "Не удалось получить ссылку. Скорее всего, токен не от Android.";
						}
						else {
							if(e.code == 5) ccon("Токен стал "+colors.underline("недействительным")+".", true);
							else con(e.message, true);
						}
					}

					if(error || !owner_id) {
						let { mobile_iframe_url } = (await vk.api.apps.get({
							app_id: 6915965
						})).items[0];

						if(error)
							con(error, "yellow");

						if(!mobile_iframe_url)
							throw("Ссылка на приложение не получена");
						EmbedURL = mobile_iframe_url;
					}

					USER_ID = id;

					URLWS = formateWSLink(EmbedURL, USER_ID);
					await SaveApp(firstInit);
					fullLog() && ccon("Попытка подключиться через полученную ссылку...");
					startBooster();

				} catch(error) {
					ccon('API Error: ' + error.message, true);
					process.exit();
				}
			})(VK_TOKEN, g_id*-1);
		}
		else {
			let GSEARCH = url.parse(EmbedURL, true);
			if(!GSEARCH.query || !GSEARCH.query.vk_user_id) {
				con("В ссылке не указан аргумент [vk_user_id]", true);
				return process.exit();
			}
			if(!USER_ID)
				USER_ID = parseInt(GSEARCH.query.vk_user_id);

			URLWS = formateWSLink(EmbedURL, USER_ID);
			await SaveApp(firstInit);
			fullLog() && ccon("Попытка подключиться через указанную ссылку...");
			startBooster();
		}

		// if(!VK_TOKEN)
			// ccon("Желательно указать токен командой "+ colors.bold("token") +" . Получить его можно тут -> " + colors.underline(LINK_XTCOIN), "red");
	})();

})();