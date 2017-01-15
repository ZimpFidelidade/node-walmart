'use strict';

const coreAPI = require('./lib/core');
const Helpers = require('./lib/helper');
const Products = require('./lib/products');
const PreOrder = require('./lib/pre-order');
const Order = require('./lib/order');
const Joi = require('joi');

var Walmart = {

	validateData(initializeData) {
		const initialDataschema = Joi.object().keys({
			code: Joi.string().alphanum().min(3).max(7).required(),  // eslint-disable-line no-magic-numbers
			id: Joi.string().alphanum().min(64).max(64).required(),  // eslint-disable-line no-magic-numbers
			secret: Joi.string().alphanum().min(64).max(64).required() // eslint-disable-line no-magic-numbers
		}).required();
		const validatedData = Joi.validate(initializeData, initialDataschema);

		if(validatedData.error) {
			return Helpers.errorHandler('main', 'missingCredentials', validatedData.error);
		}
	},

	init(config, env) {
		Walmart.validateData(config);

		const coreInit = coreAPI.init(config, env);

		return Object.assign(
			config,
			Helpers,
			coreInit,
			Products,
			PreOrder,
			Order
		);
	}

};

module.exports = Walmart;
