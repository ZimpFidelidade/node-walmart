'use strict';

const lab = exports.lab = require('lab').script();
const expect = require('code').expect;
const lib = require('../index');
var libInit;

const addressObj = {
	address: "Av Nova independencia",
	number: "37",
	complement: "ap 113",
	neighborhood: "Brooklyn novo",
	postalCode: "04570000",
	city: "São Paulo",
	state: "SP"
};

lab.describe('sendOrder', () => {

	lab.beforeEach((done) => {
		libInit = lib.init({
			code: process.env.WALMART_CODE,
			id: process.env.WALMART_ID,
			secret: process.env.WALMART_SECRET
		}, 'development');
		done();
	});

	lab.test('sendOrder without params', (done) => {
		libInit.sendOrder().catch((sendOrderError) => {
			expect(sendOrderError).to.be.an.object();
			expect(sendOrderError.success).to.be.equal(false);
			expect(sendOrderError.code).to.be.an.string().and.equal('missingOrderObj');
			expect(sendOrderError.message).to.be.an.string().and.equal('You need to send the order object');
			done();
		});
	});

	lab.test('sendOrder without payments', (done) => {
		libInit.sendOrder({
			genericOrderId: '123123123'
		}).catch((sendOrderError) => {
			expect(sendOrderError).to.be.an.object();
			expect(sendOrderError.success).to.be.equal(false);
			expect(sendOrderError.code).to.be.an.string().and.equal('missingPaymentOrder');
			expect(sendOrderError.message).to.be.an.string().and.equal('You need to send the payment object');
			done();
		});
	});

	lab.test('sendOrder with invalid payment object', (done) => {
		libInit.sendOrder({
			payments: {}
		}).catch((sendOrderError) => {
			expect(sendOrderError).to.be.an.object();
			expect(sendOrderError.success).to.be.equal(false);
			expect(sendOrderError.code).to.be.an.string().and.equal('invalidPaymentOrder');
			expect(sendOrderError.message).to.be.an.string().and.equal('You need to send a valid payment object');
			done();
		});
	});

	lab.test('sendOrder without skuList', (done) => {
		libInit.sendOrder({
			payments: {
				total: 299.8,
				type: 'POST_PAID',
				billingAddress: addressObj
			}
		}).catch((sendOrderError) => {
			expect(sendOrderError).to.be.an.object();
			expect(sendOrderError.success).to.be.equal(false);
			expect(sendOrderError.code).to.be.an.string().and.equal('missingSkuOrder');
			done();
		});
	});

	lab.test('sendOrder with invalid skuList', (done) => {
		libInit.sendOrder({
			payments: { total: 299.8, type: 'POST_PAID', billingAddress: addressObj },
			skuList: {}
		}).catch((sendOrderError) => {
			expect(sendOrderError).to.be.an.object();
			expect(sendOrderError.success).to.be.equal(false);
			expect(sendOrderError.code).to.be.an.string().and.equal('invalidSkuOrder');
			done();
		});
	});

	lab.test('sendOrder without customer', (done) => {
		libInit.sendOrder({
			payments: { total: 299.8, type: 'POST_PAID', billingAddress: addressObj },
			skuList: [{
				quantity: 1,
				skuId: "884418",
				sellerId: "1",
				price: { BRL: 149.9 },
				discountPrice: { BRL: 149.9 },
				sla: { id: "1", duration: { value: '5' } }
			}]
		}).catch((sendOrderError) => {
			expect(sendOrderError).to.be.an.object();
			expect(sendOrderError.success).to.be.equal(false);
			expect(sendOrderError.code).to.be.an.string().and.equal('missingCustomer');
			done();
		});
	});

	lab.test('sendOrder with an invalid customer', (done) => {
		libInit.sendOrder({
			payments: { total: 299.8, type: 'POST_PAID', billingAddress: addressObj },
			skuList: [{
				quantity: 1,
				skuId: "884418",
				sellerId: "1",
				price: { BRL: 149.9 },
				discountPrice: { BRL: 149.9 },
				sla: { id: "1", duration: { value: '5' } }
			}],
			customer: {}
		}).catch((sendOrderError) => {
			expect(sendOrderError).to.be.an.object();
			expect(sendOrderError.success).to.be.equal(false);
			expect(sendOrderError.code).to.be.an.string().and.equal('invalidCustomer');
			done();
		});
	});

	lab.test('sendOrder with with wrong shipping values', (done) => {
		libInit.sendOrder({
			payments: { total: 299.8, type: 'POST_PAID', billingAddress: addressObj },
			skuList: [{
				quantity: 1,
				skuId: "884418",
				sellerId: "1",
				price: { BRL: 149.9 },
				discountPrice: { BRL: 149.9 },
				sla: { id: "1", duration: { value: '5' } }
			}],
			customer:{
				firstName: "Jose chaves",
				lastName: "Silva",
				birthDate: "22/02/1991",
				gender: "M",
				email: "jose.chaves@gmail.com",
				phones: [{ type:"MOBILE", number:"1999999999" }],
				document: "36668139680"
			},
			shipping: { }
		}).catch((sendOrderError) => {
			expect(sendOrderError).to.be.an.object();
			expect(sendOrderError.success).to.be.equal(false);
			expect(sendOrderError.code).to.be.an.string().and.equal('invalidOrderObj');
			done();
		});
	});

	lab.test('sendOrder with wrong SLA or erros form the API', { timeout: 10000 }, (done) => {
		libInit.sendOrder({
			payments: { total: 299.8, type: 'POST_PAID', billingAddress: addressObj },
			skuList: [{
				quantity: 1,
				skuId: "884418",
				sellerId: "1",
				price: { BRL: 149.9 },
				discountPrice: { BRL: 149.9 },
				sla: { id: "1", duration: { value: '5' } }
			}],
			customer:{
				firstName: "Jose chaves",
				lastName: "Silva",
				birthDate: "22/02/1991",
				gender: "M",
				email: "jose.chaves@gmail.com",
				phones: [{ type:"MOBILE", number:"1999999999" }],
				document: "36668139680"
			},
			shipping: {
				recipient: "Casa",
				recipientPhone: "1199963325",
				recipientDocument: "74768418406",
				recipientEmail: "test@test.com",
				address: addressObj
			}
		}).catch((sendOrderError) => {
			expect(sendOrderError).to.be.an.object();
			expect(sendOrderError.success).to.be.equal(false);
			expect(sendOrderError.code).to.be.an.string().and.equal('SML_INVALID_SLA');
			done();
		});
	});

	lab.test('sendOrder success', { timeout: 30000 }, (done) => {
		let finalOrderObj = {
			payments: { type: 'POST_PAID', billingAddress: addressObj },
			skuList: [{
				quantity: 1,
				skuId: "884418",
				sellerId: "1",
				price: { BRL: 149.9 },
				discountPrice: { BRL: 149.9 },
				sla: { id: "1", duration: { value: '5' } }
			}],
			customer:{
				firstName: "Jose chaves",
				lastName: "Silva",
				birthDate: "22/02/1991",
				gender: "M",
				email: "jose.chaves@gmail.com",
				phones: [{ type:"MOBILE", number:"1999999999" }],
				document: "36668139680"
			},
			shipping: {
				recipient: "Casa",
				recipientPhone: "1199963325",
				recipientDocument: "74768418406",
				recipientEmail: "test@test.com",
				address: addressObj
			}
		};

		libInit.getPartialCatalog()
			.then((products) => {
				return libInit.simulateOrder({
					postalCode: '04570000',
					payments: { type: 'POST_PAID' },
					skuList: [{
						skuId: products.products[0].skus[0].id,
						sellerId: products.products[0].skus[0].offers[0].seller.id,
						quantity: 1
					}]
				})
			})
			.then((res) => {
				finalOrderObj.skuList[0].skuId = res.itemsGroup.items[0].offer.skuId;
				finalOrderObj.skuList[0].discountPrice = res.itemsGroup.items[0].discountPrice;
				finalOrderObj.skuList[0].price = res.itemsGroup.items[0].offer.availability.price;
				finalOrderObj.skuList[0].sla = res.itemsGroup.items[0].delivery.slas[0];

				finalOrderObj.payments.totalValue = finalOrderObj.skuList[0].price.BRL + finalOrderObj.skuList[0].sla.price.BRL;

				return libInit.sendOrder(finalOrderObj);
			})
			.then((sendOrderResult) => {
				expect(sendOrderResult)
					.to.be.an.object()
					.and.to.only.include(['transactionId', 'orderId']);

				expect(sendOrderResult.transactionId).to.be.an.string();
				expect(sendOrderResult.orderId).to.be.an.number();
				done();
			});
	});

});
