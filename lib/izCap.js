/*
	File: izCap.js
	Description: JSON file core
	Created by: xTCry
	Date: 09.04.2019 02:39
*/
const fs = require('fs');

let izCS = [];

class izCap {
	
	constructor(cachepath, cachefile, saveChanged = true, autoload = true, defVal = {}) {
		
		izCS.push(this);
		this.isExitSave = false;
		
		this.cachepath = cachepath;

		try {
			if (!fs.existsSync(this.cachepath))
				mkdirAsync(this.cachepath).then();
		} catch(e) { }

		if(cachefile) {
			this.cachefile = cachepath+cachefile+'.json';
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
		let exists = await existsAsync(this.cachefile);
		if(exists) {
			return new Promise((resolve, reject) => {
				fs.readFile(this.cachefile, (err, data)=> {
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
			fs.writeFile(this.cachefile, JSON.stringify(this.arrayCap, null, '\t'), (err)=> {
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

	static async scan(cachepath) {
		let arrayFiles = [];
		return new Promise((resolve, reject) => {
			if (!fs.existsSync(cachepath))
				return resolve(arrayFiles);

			fs.readdir(cachepath, (err, files)=> {
				if(err)
					return reject(err);
				
				if(files.length == 0)
					return resolve(arrayFiles);

				files
				.map(function(v) { 
					return {
						name: v,
						time: fs.statSync(cachepath + v).mtime.getTime()
					}; 
				})
				.sort( (a, b) => (a.time - b.time) )
				.map(v => v.name)
				.forEach((file, key, files) => {
					if(file.startsWith(".")) return;
									
					arrayFiles.push(file);

					if (key === files.length - 1) {
						resolve(arrayFiles);
					}

				});
			});
		});
	}
	
	static fastSave(cachepath, cachefile, value) {
		let _cachefile = cachepath+cachefile+'.json';
		
		fs.writeFile(_cachefile, JSON.stringify(value, null, '\t'), (err)=> {
			if (err) throw err;
		});
		return this;
	}
	
	static fastLoad(cachepath, cachefile, _cb) {
		let _cachefile = cachepath+cachefile+'.json'
		
		fs.exists(_cachepath, exists=> {
			if(exists) {
				fs.readFile(_cachefile, (err, data)=> {
					if(err) throw err;
					_cb(JSON.parse(data.toString()));
				});
			}
			else _cb(false)
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
function mkdirAsync(path) {
	return new Promise( (resolve, reject)=> {
		try {
			path = path.replace(/\/$/, '').split('/');
			for (var i = 1; i <= path.length; i++) {
				var segment = path.slice(0, i).join('/');
				(segment.length > 0 && !fs.existsSync(segment)) ? fs.mkdirSync(segment) : null ;
			}
		} catch(e) { }
		resolve();
	});
}

module.exports = izCap;
