'use strict';

const got = require('got');
const pkg = require('../package.json');

var coreAPI = {

	rootUrl: 'https://api.walmart.com.br/api/v2',
	env: false,
	keys: false,

	init(keys, env) {
		if(env && env === 'development') {
			coreAPI.rootUrl = 'https://186.209.165.148/api/v2';
		}

		coreAPI.env = (env || 'production');
		coreAPI.keys = keys;

		return coreAPI;
	},

	makeRequest(method, url, data) {
		return this.auth().then(() => {



		});
	},

	sendRequest(method, url, data) {
		return got(`${coreAPI.rootUrl}${url}`, {
			method: method,
			body: data,
			timeout: 3000,
			headers: {
				'user-agent': `node-walmart/${pkg.version} (https://github.com/ZimpFidelidade/node-walmart)`
			}
		})
		.then(console.log)
		.catch(console.log);
	},

	auth() {
		return this.sendRequest('POST', '/authenticate', {
			client_id: coreAPI.keys.id,
			client_secret: coreAPI.keys.secret,
			grant_type: 'client_credentials'
		})
		.then(console.log)
		.catch(console.log);
	}

};

module.exports = Object.create(coreAPI);
