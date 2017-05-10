'use strict';

const Joi = require('joi');
const generatePassword = require('@luanmuniz/password-generator').generate;

var orderAPI = {

	sendOrder(orderObj) {
		return Promise.resolve()
			.then(() => {
				return this.validateOrderObj(orderObj);
			})
			.then((validatedObj) => {
				return this.formatOrderObj(validatedObj);
			})
			.then((objToPost) => {
				return this.makeRequest('POST', '/orders', objToPost);
			})
			.then((simulateResponse) => {
				if(simulateResponse.body.summary.statusCode !== 200) {
					return this.errorHandler('order', jsonResponse.body.summary.errors[0].type, jsonResponse.body);
				}

				delete simulateResponse.body.summary;
				return simulateResponse.body;
			})
			.catch((errorResponse) => {
				if(errorResponse.success === false) {
					return Promise.reject(errorResponse);
				}

				return this.errorHandler('order', errorResponse.response.body.summary.errors[0].type, errorResponse.response.body);
			});
	},

	validateOrderObj(orderObj) {
		if(!orderObj) {
			return this.errorHandler('validation', 'missingOrderObj');
		}

		if(!orderObj.genericOrderId) {
			orderObj.genericOrderId = this.generateGenericId();
		}

		return Promise.all([
			this.validatePaymentOrder(orderObj.payments),
			this.validateSkuOrder(orderObj.skuList),
			this.validateCustomer(orderObj.customer)
		])
		.then((promiseReturn) => {
			orderObj.itemsGroup = promiseReturn[1];

			delete orderObj.skuList;
			delete orderObj.type;

			return this.generateCardToken(promiseReturn[0]);
		})
		.then((generateCardReturn) => {
			orderObj.payments = generateCardReturn;

			orderObj = Joi.validate(orderObj, this.orderSchema);
			if(orderObj.error) {
				return this.errorHandler('validation', 'invalidOrderObj', orderObj.error);
			}

			return orderObj.value;
		});
	},

	formatOrderObj(orderObj) {
		orderObj.locale = { currency: orderObj.currency };
		delete orderObj.currency;

		let birthArray = orderObj.customer.birthDate.toISOString().split('T')[0].split('-');

		orderObj.customer.birthDate = `${birthArray[2]}/${birthArray[1]}/${birthArray[0]}`;

		orderObj.itemsGroup.items.forEach((item, itemIndex) => {
			if(!item.sla.price) {
				orderObj.itemsGroup.items[itemIndex].sla.price = { BRL: 0 };
			}
		});

		return orderObj;
	},

	/* $lab:coverage:off$ */
	generateCardToken(paymentObj) {
		if(!Array.isArray(paymentObj)) {
			paymentObj = [ paymentObj ];
		}

		if(paymentObj[0].paymentMethod === 'POST_PAID') {
			return Promise.resolve(paymentObj);
		}

		let allPromises = [];

		paymentObj.forEach((thisPayment) => {
			let thisPaymentPromise = this.getCreditCardToken({
				creditCardNumber: thisPayment.creditCard.number,
				securityCode: thisPayment.creditCard.securityCode
			}).then((cardObj) => {
				delete thisPayment.creditCard.number;
				delete thisPayment.creditCard.securityCode;

				thisPayment.creditCard.encryptedNumber = cardObj.encryptedNumber;
				return thisPayment;
			});

			allPromises.push(thisPaymentPromise);
		});

		return Promise.all(allPromises);
	},
	/* $lab:coverage:on$ */

	generateGenericId() {
		return generatePassword(10, {
			allowUppercase: true,
			symbols: false
		});
	}

};

module.exports = orderAPI;
