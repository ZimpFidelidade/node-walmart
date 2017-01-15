'use strict';

const got = require('got');
const jszip = require('jszip')();
const pkg = require('../package.json');
const helper = require('./helper.js');

var coreAPI = {

	rootUrl: 'https://api.walmart.com.br/api/v2',
	env: false,
	keys: false,

	init(keys, env) {
		if(env && env === 'development') {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
			coreAPI.rootUrl = 'https://186.209.165.148/api/v2';
		}

		coreAPI.env = (env || 'production');
		coreAPI.keys = keys;

		return coreAPI;
	},

	makeRequest(method, url, data) {
		return coreAPI.auth().then(() => {
			return coreAPI.sendRequest(method, url, data);
		});
	},

	checkGzip(res) {
		if(res.headers['content-disposition'] && res.headers['content-disposition'].includes('zip')) {
			res.body = coreAPI.getZipContent(res.body);
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
				'user-agent': `node-walmart/${pkg.version} (https://github.com/ZimpFidelidade/node-walmart)`,
				'Content-Type': 'application/json'
			}
		};

		if(data) {
			gotParams.body = JSON.stringify(data);
		}

		if(coreAPI.keys.token) {
			gotParams.headers['Authorization'] = coreAPI.keys.token;
		}

		if(url.includes('catalogs')) {
			gotParams.encoding = 'buffer';
		}

		return got(`${coreAPI.rootUrl}${url}`, gotParams)
			.then((requestResponse) => {
				if(requestResponse.headers['content-length'] && parseInt(requestResponse.headers['content-length'], 10) !== requestResponse.body.length) {
					return coreAPI.makeRequest(method, url, data);
				}

				requestResponse = coreAPI.checkGzip(requestResponse);
				return coreAPI.parseResponse(requestResponse);
			}).then((jsonResponse) => {
				if(jsonResponse.summary && jsonResponse.summary.statusCode !== 200) {
					return helper.errorHandler('main', 0, jsonResponse.summary.errors.message);
				}

				return jsonResponse;
			})
			.catch((requestError) => {
				try {
					requestError.response.body = JSON.parse(requestError.response.body);
					return Promise.reject(requestError);
				} catch (e) {
					return Promise.reject(requestError);
				}
			});
	},

	auth() {
		return coreAPI.sendRequest('POST', '/authenticate', {
			client_id: coreAPI.keys.id,
			client_secret: coreAPI.keys.secret,
			grant_type: 'client_credentials'
		})
		.then((requestResponse) => {
			coreAPI.keys.token = requestResponse.body.access_token;
			return true;
		});
	}

};

module.exports = Object.create(coreAPI);
