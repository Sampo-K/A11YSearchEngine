"use strict";

const axios = require('axios');
const crawl = require('json-web-crawler');
const fs = require('fs');
const settings = require('./settings');

// Default URL is the english WCAG 2.2
let url = "https://www.w3.org/TR/WCAG22";

// If valid parameter is given, use it as URL
var urlParam = process.argv.slice(2);
if (urlParam.length == 1) {
	url = urlParam[0];
}

console.log('<=== Settings ===>');
console.log(settings);
console.log('URL: ' + url);
console.log('<=== Settings ===>');

axios.get(url).then((response) => {
    console.log("Got HTML now parsing...");
    crawl(response.data, settings).then((data) => {
		//console.log(data);
		writeFile(JSON.stringify(data));
    })
    .catch((err) => {
        console.log("Parsing failed: " + err);
    });
})
.catch((err) => {
    console.log("Fetching html data failed: " + err);
});


const writeFile = (JSONdata) => {
	try {
		fs.writeFile('wcag.json', JSONdata, (err) => {
			if (err) throw err;
			console.log('JSON written successfully');
		})
	}
	catch(err) {
		console.log('Error in writing the file: ' + err);
	};
};


