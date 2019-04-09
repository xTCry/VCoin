/*
	File: izCap.js
	Description: JSON file core
	Created by: xTCry
	Date: 09.04.2019 02:39
*/
const fs = require('fs');

let izCS = [];

class izCap {
	
	constructor(cachefile = false, defVal = {}, saveChanged = true, autoload = true) {
		
		izCS.push(this)
		this.isExitSave = false
		
		this.cachefile = cachefile;

		if(cachefile) {
			this.cachepath = cachefile+'.json';
			this.saveChanged = saveChanged;
			
			this.arrayCap = defVal;
			this.loaded = false;
			this.onLoad = [];
			autoload && this.load();
		}
	}
	
	addLoad(f) {
		this.onLoad.push(f);
		return this;
	}
	
	async load() {
		let exists = await existsAsync(this.cachepath);
		if(exists) {
			return new Promise((resolve, reject) => {
				fs.readFile(this.cachepath, (err, data)=> {
					if(err) return reject(err);

					this.arrayCap = JSON.parse(data.toString());
					this.loaded = true;

					for (let i = this.onLoad.length - 1; i >= 0; i--) {
						this.onLoad[i] && this.onLoad[i]()
					}
					resolve(this.arrayCap);
				});
			});
		}
		else {
			return false;
			/*await this.save(false, false);
			this.loaded = true;
			return this.arrayCap;*/
		}
	}
	
	save(zExit=false, infot=true, _cb=false) {
		return new Promise((resolve, reject) => {
			fs.writeFile(this.cachepath, JSON.stringify(this.arrayCap, null, '\t'), (err)=> {
				if (err) return reject(err);

				if(zExit) this.isExitSave = true;

				if (infot) {
					let temp = "Saved: "+this.cachefile;
					if(_h && _h.con) _h.con(temp, "green");
					else console.log(temp);
				}
				if(_cb) _cb();
				resolve(true);
			});
		});
	}

	get(data, def) {
		let val = this.arrayCap[data]
		return (val === undefined && def !== undefined) ? def : val;
	}
	async set(data, value, ssave=false, inlog=false) {
		this.arrayCap[data] = value
		if(this.saveChanged || ssave)
			return await this.save(false, inlog);
		return this;
	}
	
	static fastSave(cachefile, value) {
		var _cachepath = cachefile+'.json';
		
		fs.writeFile(_cachepath, JSON.stringify(value, null, '\t'), (err)=> {
			if (err) throw err;
		});
		return this;
	}
	
	static fastLoad(_cb) {
		let _cachepath = cachefile+'.json'
		
		fs.exists(_cachepath, exists=> {
			if(exists) {
				fs.readFile(_cachepath, (err, data)=> {
					if(err) throw err
						_cb(JSON.parse(data.toString()));
				});
			}
			else
				_cb(false)
		});
		return this;
	}
	
	static izCap() {
		return new izCap();
	}
	
	static reizCS() {
		izCS = [];
	}
	static izCS() {
		return izCS;
	}
	
};


function existsAsync(path) {
	return new Promise( (resolve, reject)=> fs.exists(path, exists=> resolve(exists)) );
}

module.exports = izCap;
