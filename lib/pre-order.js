'use strict';

var preOrderAPI = {

	getPaymentMethods(skuList) {
		return Promise.resolve()
			.then(() => {
				return this.validateSkuList(skuList);
			})
			.then((objToPost) => {
				return this.makeRequest('POST', `/paymentMethods`, objToPost)
			})
			.then((paymentResponse) => {
				if(paymentResponse.body.summary.statusCode !== 200) {
					return this.errorHandler('order', 'paymentsNotFound', paymentResponse.body);
				}

				return paymentResponse.body.paymentMethods.methods;
			})
			.catch((errorResponse) => {
				return this.errorHandler('order', errorResponse.response.body.summary.errors[0].type, errorResponse.response.body);
			});
	},

	simulateOrder(simulateObj) {
		return Promise.resolve()
			.then(() => {
				return this.validateSimulateObj(simulateObj);
			})
			.then((objToPost) => {
				return this.makeRequest('POST', `/simulate`, objToPost)
			})
			.then((simulateResponse) => {
				if(simulateResponse.body.summary.statusCode !== 200) {
					return this.errorHandler('order', simulateResponse.body.summary.errors[0].type, simulateResponse.body);
				}

				delete simulateResponse.body.summary;
				return simulateResponse.body;
			})
			.catch((errorResponse) => {
				console.log(errorResponse);
				let errorBody = errorResponse.response.body;
				return this.errorHandler('order', errorBody.summary.errors[0].type, errorBody);
			});
	},

	getCreditCardToken(cardObj) {
		// I don't have access to this function, so i don't know if it works. If you do, please check that and send a PR.
		return Promise.resolve()
			.then(() => {
				return this.validateCreditCard(cardObj);
			})
			.then((finalCardObj) => {
				return this.makeRequest('POST', `/tokenizer`, finalCardObj);
			})
			.then((tokenResponse) => {
				if(tokenResponse.body.summary.statusCode !== 200) {
					return this.errorHandler('order', 'installmentsNotFound', tokenResponse.body);
				}

				delete simulateResponse.body.summary;
				return tokenResponse.body;
			});
	},

	getInstallments(skuList, paymentObj) {
		// I don't have access to this function, so i don't know if it works. If you do, please check that and send a PR.
		return Promise.all([
				this.validateSkuList(skuList),
				this.validatePaymentObj(paymentObj)
			])
			.then((promiseReturn) => {
				return this.makeRequest('POST', `/installments`, {
					itemsGroup: promiseReturn[0],
					payment: promiseReturn[1]
				})
			})
			.then((installmentsResponse) => {
				if(installmentsResponse.body.summary.statusCode !== 200) {
					return this.errorHandler('order', 'installmentsNotFound', installmentsResponse.body);
				}

				return installmentsResponse.body;
			});
	}

};

module.exports = preOrderAPI;
