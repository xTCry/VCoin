/*
	File: AntMiner.js
	Description: Miner & Entities
	Created by: xTCry
	Date: 08.04.2019 23:21
*/

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
		let price = Entity.items[e].price,
			count = 0;

		this.stack.forEach(el=> {
			if(el.value === e)
				count = el.count;
		});
		return Entity.calcPrice(price, count + 1);
	}

	updateStack(items) {
		this.stack = Entity.generateStack( items.filter(e=> ("bonus" !== e)) );

		let total = 0;
		this.stack.forEach(function(e) {
			let n = e.value,
				a = e.count;
			total += Entity.items[n].amount * a;
		});

		this.total = total;
	}

}

class Entity {

	static get titles() {
		return {
			cursor: "Курсор",
			cpu: "Видеокарта",
			cpu_stack: "Стойка видеокарт",
			computer: "Суперкомпьютер",
			server_vk: "Сервер ВКонтакте",
			quantum_pc: "Квантовый компьютер",
			datacenter: "Датацентр",
			vkp1: "Аккаунт VK Pay",
			vkp2: "Расширенный аккаунт",
		};
	}

	static get items() {
		return {
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
			}
		};
	}

	static get names() {
		return [
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

	static generateStack(e) {
		let t = arguments.length > 1 && void 0 !== arguments[1]? arguments[1]: (e, t)=> (e === t),
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
					if(t(n.value, e)) {
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

	static calcPrice(price, count) {
		return (count <= 1)? price: Math.ceil(1.3 * this.calcPrice(price, count - 1));
	}

	/*static hashPassCoin(e, t) {
		return e + t - 1;
	}*/

	static formateScore(e) {
		return (arguments.length > 1 && void 0 !== arguments[1] && arguments[1])?
			function(e, t, n, a) {
				var r, o, c, s, i;

				r = parseInt(e = (+e || 0).toFixed(t), 10) + "";
				(o = r.length) > 3 ? o %= 3 : o = 0;

				i = o? (r.substr(0, o) + a): "";
				c = r.substr(o).replace(/(\d{3})(?=\d)/g, "$1" + a);
				s = t? n + Math.abs(e - r).toFixed(t).replace(/-/, 0).slice(2): "";

				return i + c + s;
			}(e / 1e3, 3, ",", " "):
			(e / 1e3).toFixed(3).toString().replace(".", ",");
	}
}

module.exports = { Entity, Miner };