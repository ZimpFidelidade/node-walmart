'use strict';

const coreAPI = require('./lib/core');
const Helpers = require('./lib/helper');
const Joi = require('joi');

var Walmart = {

	validateData(data) {
		const schema = Joi.object().keys({
			code: Joi.string().alphanum().min(3).max(7),
    		id: Joi.string().alphanum().min(64).max(64).required(),
    		secret: Joi.string().alphanum().min(64).max(64).required(),
		});
		const result = Joi.validate(data, schema);

		if(result.error) {
			return Helpers.errorHandler('main', 'missingCredentials', result.error, true);
		}
	},

	init(config, env) {
		Walmart.validateData(config);

		const coreInit = coreAPI.init(config, env);

		return Object.assign(
			config,
			coreInit,
			Helpers
		);
	}

};

module.exports = Walmart;
