/*
	File: iLog.js
	Description: Log core
	Created by: xTCry
	Date: 08.04.2019 22:20
*/
const fs = require('fs');
const cachedir = "./";

class iLog {
	
    static iLog() {
        return new iLog();
    }
	constructor(fileName = false, subDir = false) {
		
		this.cPath = cachedir + (subDir? subDir+"/": "");

		try {
			if (!fs.existsSync(this.cPath))
				mkdirAsync(this.cPath).then();
		} catch(e) { }

		this.logFile = this.cPath + (fileName? fileName: "multi_log")+'.html';
		this.isSET = false;
		
		fs.exists(this.logFile, (exists)=> {
			this.isSET = exists;
			if(!exists) {
				let template = "<table border=1><caption>iLog Core</caption> <tr><th>Time</th> <th>Data</th></tr>";
				fs.writeFile(this.logFile, template, (err)=> {
					if (err) throw err;
					// console.log('iLog dile created!');
					this.isSET = true;
				});
			}
		});
	}
	
	async log(text, color="black", bgColor="black", date=undefined) {
		date = date || _h.dateF();
		if(!isNaN(color)) {
			date = _h.dateF(color);
			color = "black";
		}
		if(!isNaN(bgColor)) {
			date = _h.dateF(bgColor);
			bgColor = "black";
		}
		if(!bgColor) bgColor = "black";
		if(!color) color = "black";

		text = text.replace(/(?:\r\n|\r|\n)/g, '<br>');
		var style = color!="black" ? "style='background:"+bgColor+"'" : "";
		var template = "\n<tr> <td>"+date+"</td> <td><font color="+color+" "+style+">"+text+"</font></td> </tr>\n";
		
		await appendFileAsync(this.logFile, template);
    }
	
};

function appendFileAsync(path, data) {
	return new Promise( (resolve, reject)=> fs.appendFile(path, data, err=> resolve(err)) );
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

module.exports = iLog;
