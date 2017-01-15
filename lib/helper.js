'use strict';

const Joi = require('joi');
const Schemas = require('./schemas');

var errorAPI = {

	skuListSchema: Schemas.skuListSchema,
	paymentSchema: Schemas.paymentSchema,
	creditCardSchema: Schemas.creditCardSchema,
	simulateSchema: Schemas.simulateSchema,
	orderSchema: Schemas.orderSchema,

	errorObj: {
		main: {
			0: 'Request Error',
			missingCredentials: 'You need to send your credentials to initialize the module'
		},

		products: {
			0: 'Request Error',
			missingProductId: 'You need to send the product ID',
			missingSkuId: 'You need to send the sku ID',
			productNotFound: 'This product doesn\'t exist',
			skuNotFound: 'This sku doesn\'t exist',
			GONE: 'Requested resource is inactive'
		},

		validation: {
			missingList: 'You need to send the list of sku ID',
			invalidSkuList: 'You need to send a valid sku list',
			missingPayment: 'You need to send the payment object',
			invalidPayment: 'You need to send a valid payment object',
			missingOrderObj: 'You need to send the order object',
			invalidOrderObj: 'You need to send a valid order object',
		},

		order: {
			0: 'Request Error',
			'LGT0115': 'Some items are not avaliable',
			'LGT0402': 'There is no delivery avaliable to this address.',
			STOCK_UNAVAILABLE: 'Some items are not avaliable',
			STOCK_OVERFLOW: 'Some items can\'t be delivery',
			INACTIVE: 'Some items are inactive',
			paymentsNotFound: 'Payment Method not found for those products',
			installmentsNotFound: 'Installments not found for those products',
			SML_INVALID_SLA: 'THis product doesn\'t have a SLA that match the one provided'
		}
	},

	validateCreditCard(creditCardObj) {
		if(!creditCardObj) {
			return this.errorHandler('validation', 'missingCreditCardObj');
		}

		creditCardObj = Joi.validate(creditCardObj, this.creditCardSchema);
		if(creditCardObj.error) {
			return this.errorHandler('validation', 'invalidCreditCard', creditCardObj.error);
		}

		return creditCardObj;
	},

	validateSkuList(skuList) {
		if(!skuList) {
			return this.errorHandler('validation', 'missingList');
		}

		if(!Array.isArray(skuList)) {
			skuList = [ skuList ];
		}

		skuList = Joi.validate(skuList, this.skuListSchema);
		if(skuList.error) {
			return this.errorHandler('validation', 'invalidSkuList', skuList.error);
		}

		let finalList = { items: [] };

		skuList.value.forEach((thisItem) => {
			finalList.items.push({
				offer: {
					sellerId: thisItem.sellerId + '',
					skuId: thisItem.skuId
				},
				quantity: thisItem.quantity
			});
		});

		return Promise.resolve(finalList);
	},

	validatePaymentObj(paymentObj) {
		if(!paymentObj) {
			return this.errorHandler('validation', 'missingPayment');
		}

		if(!Array.isArray(paymentObj)) {
			paymentObj = [ paymentObj ];
		}

		paymentObj = Joi.validate(paymentObj, this.paymentSchema);
		if(paymentObj.error) {
			return this.errorHandler('validation', 'invalidPayment', paymentObj.error);
		}

		return Promise.resolve({
			methods: paymentObj.value
		});
	},

	validateSimulateObj(simulateObj) {
		if(!simulateObj) {
			return this.errorHandler('validation', 'missingSimulateObj');
		}

		return Promise.all([
			this.validateSkuList(simulateObj.skuList),
			this.validatePaymentObj(simulateObj.payment)
		]).then((promiseReturn) => {
			simulateObj.skuList = promiseReturn[0];
			simulateObj.payment = promiseReturn[1];

			simulateObj = Joi.validate(simulateObj, this.simulateSchema);
			if(simulateObj.error) {
				return this.errorHandler('validation', 'invalidSimulateObj', simulateObj.error);
			}

			return simulateObj.value;
		}).then((formatedObj) => {
			return {
				locale: { currency: formatedObj.currency },
				itemsGroup: formatedObj.skuList,
				payments: formatedObj.payment,
				delivery: {
					address: {
						country: formatedObj.country,
						postalCode: formatedObj.postalCode
					}
				}
			}
		});
	},

	errorHandler(section, code, errorResponse, returnPromise) {
		var returnedError = { success: false },
			message = 'Error Unknow';

		if(errorAPI.errorObj[section][code]) {
			message = errorAPI.errorObj[section][code];
		}

		returnedError.code = code;
		returnedError.message = message;

		if(errorResponse) {
			delete errorResponse.response;
			returnedError.errorResponse = errorResponse;
		}

		if(returnPromise) {
			return Promise.reject(returnedError);
		}

		throw Error(returnedError.message);
	}

};

module.exports = errorAPI;
