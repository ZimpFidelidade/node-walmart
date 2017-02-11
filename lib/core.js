'use strict';

const got = require('got');
const jszip = require('jszip')();
const pkg = require('../package.json');
const helper = require('./helper.js');

var coreAPI = {

	init(keys, env) {
		coreAPI.rootUrl = 'https://api.walmart.com.br/api/v2';

		if(env !== 'production') {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
			coreAPI.rootUrl = 'https://186.209.165.148/api/v2';
		}

		coreAPI.env = env;
		coreAPI.keys = keys;

		return coreAPI;
	},

	makeRequest(method, url, data) {
		return this.auth().then(() => {
			return this.sendRequest(method, url, data);
		});
	},

	checkGzip(res) {
		if(res.headers['content-disposition'] && res.headers['content-disposition'].includes('zip')) {
			res.body = this.getZipContent(res.body);
		}

		res.body = res.body.toString('utf8');
		return res;
	},

	getZipContent(zippedFile) {
		const zipContent = jszip.load(zippedFile);
		const fileNames = Object.keys(zipContent.files);

		return zipContent.file(fileNames[0]).asText();
	},

	parseResponse(response) {
		try {
			response.body = JSON.parse(response.body);
			return response;
		} catch (e) {
			return response;
		}
	},

	sendRequest(method, url, data) {
		let gotParams = {
			method: method,
			timeout: 3000,
			headers: {
				'user-agent': `node-walmart/${pkg.version} (${pkg.homepage})`,
				'content-type': 'application/json'
			}
		};

		if(data) {
			gotParams.body = JSON.stringify(data);
		}

		if(this.keys.token) {
			gotParams.headers['Authorization'] = this.keys.token;
		}

		if(url.includes('catalogs')) {
			gotParams.encoding = 'buffer';
		}

		return got(`${this.rootUrl}${url}`, gotParams)
			.then((requestResponse) => {
				if(requestResponse.headers['content-length'] && parseInt(requestResponse.headers['content-length'], 10) !== requestResponse.body.length) {
					return this.makeRequest(method, url, data);
				}

				requestResponse = this.checkGzip(requestResponse);
				return this.parseResponse(requestResponse);
			}).then((jsonResponse) => {
				if(jsonResponse.summary && jsonResponse.summary.statusCode !== 200) {
					return this.errorHandler('main', 0, jsonResponse.summary.errors.message);
				}

				return jsonResponse;
			})
			.catch((requestError) => {
				if(requestError.response) {
					let responseObject = this.parseResponse(requestError.response);
					requestError.response.body = responseObject.body;
				}

				return Promise.reject(requestError);
			});
	},

	auth() {
		return this.sendRequest('POST', '/authenticate', {
			client_id: this.keys.id,
			client_secret: this.keys.secret,
			grant_type: 'client_credentials'
		})
		.then((requestResponse) => {
			this.keys.token = requestResponse.body.access_token;
			return true;
		});
	}

};

module.exports = coreAPI;
