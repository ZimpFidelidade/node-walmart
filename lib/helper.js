'use strict';

const Joi = require('joi');
const Schemas = require('./schemas');

var errorAPI = {

	skuListSchema: Schemas.skuListSchema,
	paymentSchema: Schemas.paymentSchema,
	creditCardSchema: Schemas.creditCardSchema,
	simulateSchema: Schemas.simulateSchema,
	skuOrderSchema: Schemas.skuOrderSchema,
	paymentOrderSchema: Schemas.paymentOrderSchema,
	customerSchema: Schemas.customerSchema,
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
			missingSkuOrder: 'You need to send the list of sku ID',
			invalidSkuOrder: 'You need to send a valid sku list',
			missingPayment: 'You need to send the payment object',
			invalidPayment: 'You need to send a valid payment object',
			missingPaymentOrder: 'You need to send the payment object',
			invalidPaymentOrder: 'You need to send a valid payment object',
			missingOrderObj: 'You need to send the order object',
			invalidOrderObj: 'You need to send a valid order object',
			missingCustomer: 'You need to send a valid customer object',
			invalidCustomer: 'You need to send a valid customer object',
			missingSimulateObj: 'You need to send a valid simulate object',
			invalidSimulateObj: 'You need to send a valid simulate object'
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
			SML_INVALID_SLA: 'This product doesn\'t have a SLA that match the one provided'
		},

		preorder: {
			INACTIVE: 'Some items are inactive',
			INVALID_SELLER: 'The seller provided is invalid'
		}
	},

	/* $lab:coverage:off$ */
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
	/* $lab:coverage:on$ */

	validateSkuOrder(skuObj) {
		if(!skuObj) {
			return this.errorHandler('validation', 'missingSkuOrder');
		}

		if(!Array.isArray(skuObj)) {
			skuObj = [ skuObj ];
		}

		skuObj.forEach((thisSku,thisIndex) => {
			if(thisSku.price !== Object(thisSku.price)) {
				thisSku.price = { BRL: thisSku.price };
			}

			if(thisSku.discountPrice !== Object(thisSku.discountPrice)) {
				thisSku.discountPrice = { BRL: thisSku.discountPrice };
			}

			if(thisSku.discountPrice.sla) {
				delete skuObj[thisIndex].discountPrice.sla;
			}

			skuObj[thisIndex].offer = {
				skuId: thisSku.skuId,
				sellerId: thisSku.sellerId,
				price: thisSku.price
			};

			delete skuObj[thisIndex].skuId;
			delete skuObj[thisIndex].sellerId;
			delete skuObj[thisIndex].price;
		});

		skuObj = Joi.validate(skuObj, this.skuOrderSchema);
		if(skuObj.error) {
			return this.errorHandler('validation', 'invalidSkuOrder', skuObj.error);
		}

		return Promise.resolve({ items: skuObj.value });
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

	validatePaymentOrder(paymentObj) {
		if(!paymentObj) {
			return this.errorHandler('validation', 'missingPaymentOrder');
		}

		if(!Array.isArray(paymentObj)) {
			paymentObj = [ paymentObj ];
		}

		paymentObj.forEach((thisPayment, thisIndex) => {
			if(!thisPayment.totalValue) {
				paymentObj[thisIndex].totalValue = thisPayment.total;
				delete paymentObj[thisIndex].total;
			}

			if(!thisPayment.paymentMethod) {
				paymentObj[thisIndex].paymentMethod = thisPayment.type;
				delete paymentObj[thisIndex].type;
			}

			if(!thisPayment.paymentMethod) {
				paymentObj[thisIndex].paymentMethod = thisPayment.type;
				delete paymentObj[thisIndex].type;
			}
		});

		paymentObj = Joi.validate(paymentObj, this.paymentOrderSchema);
		if(paymentObj.error) {
			return this.errorHandler('validation', 'invalidPaymentOrder', paymentObj.error);
		}

		return Promise.resolve(paymentObj.value);
	},

	validateCustomer(customerObj) {
		if(!customerObj) {
			return this.errorHandler('validation', 'missingCustomer');
		}

		if(customerObj.birthDate) {
			let splitedDate = customerObj.birthDate.split('/');
			customerObj.birthDate = new Date(splitedDate[2], splitedDate[1], splitedDate[0]);
		}

		customerObj = Joi.validate(customerObj, this.customerSchema);
		if(customerObj.error) {
			return this.errorHandler('validation', 'invalidCustomer', customerObj.error);
		}

		return Promise.resolve(customerObj.value);
	},

	validateSimulateObj(simulateObj) {
		if(!simulateObj) {
			return this.errorHandler('validation', 'missingSimulateObj');
		}

		return Promise.all([
			this.validateSkuList(simulateObj.skuList),
			this.validatePaymentObj(simulateObj.payments)
		]).then((promiseReturn) => {
			simulateObj.skuList = promiseReturn[0];
			simulateObj.payments = promiseReturn[1];

			simulateObj = Joi.validate(simulateObj, this.simulateSchema);
			if(simulateObj.error) {
				return this.errorHandler('validation', 'invalidSimulateObj', simulateObj.error);
			}

			return simulateObj.value;
		}).then((formatedObj) => {
			return {
				locale: { currency: formatedObj.currency },
				itemsGroup: formatedObj.skuList,
				payments: formatedObj.payments,
				delivery: {
					address: {
						country: formatedObj.country,
						postalCode: formatedObj.postalCode
					}
				}
			}
		});
	},

	errorHandler(section, code, errorResponse, throwError) {
		var returnedError = { success: false },
			message = 'Error Unknow';

		if(errorAPI.errorObj[section][code]) {
			message = errorAPI.errorObj[section][code];
		}

		returnedError.code = code;
		returnedError.message = message;

		if(errorResponse) {
			delete errorResponse.response;
			delete errorResponse.isJoi;
			delete errorResponse.annotate;
			delete errorResponse._object;
			delete errorResponse.details;
			returnedError.errorResponse = errorResponse;
		}

		if(throwError) {
			throw Error(returnedError.message);
		}

		return Promise.reject(returnedError);
	}

};

module.exports = errorAPI;
