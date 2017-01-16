'use strict';

const lab = exports.lab = require('lab').script();
const expect = require('code').expect;
const lib = require('../index');
var libInit;
var skuObj = { skuId: "884418", sellerId: 1 };

lab.describe('simulateOrder', () => {

	lab.beforeEach((done) => {
		skuObj = { skuId: "884418", sellerId: 1 };
		libInit = lib.init({
			code: process.env.WALMART_CODE,
			id: process.env.WALMART_ID,
			secret: process.env.WALMART_SECRET
		}, 'development');
		done();
	});

	lab.test('simulateOrder erro without passing any param', (done) => {
		libInit.simulateOrder().catch((simulateError) => {
			expect(simulateError).to.be.an.object();
			expect(simulateError.success).to.be.equal(false);
			expect(simulateError.code).to.be.an.string().and.equal('missingSimulateObj');
			expect(simulateError.message).to.be.an.string().and.equal('You need to send a valid simulate object');
			done();
		});
	});

	lab.test('simulateOrder error by INATICVE SKU', { timeout: 10000 }, (done) => {
		skuObj.skuId = "123";
		libInit.simulateOrder({
			postalCode: '24470-170',
			skuList: skuObj,
			payments: { type: 'POST_PAID' }
		}).catch((simulateError) => {
			expect(simulateError).to.be.an.object();
			expect(simulateError.success).to.be.equal(false);
			expect(simulateError.code).to.be.an.string().and.equal('INACTIVE');
			expect(simulateError.message).to.be.an.string().and.equal('Some items are inactive');
			done();
		});
	});

	lab.test('simulateOrder error by Unknow Error', { timeout: 10000 }, (done) => {
		skuObj.skuId = "46393";
		libInit.simulateOrder({
			postalCode: '24470-170',
			skuList: skuObj,
			payments: { type: 'POST_PAID' }
		}).catch((simulateError) => {
			expect(simulateError).to.be.an.object();
			expect(simulateError.success).to.be.equal(false);
			expect(simulateError.code).to.be.an.string().and.equal('AVAILABILITY_GENERIC_ERROR');
			expect(simulateError.message).to.be.an.string().and.equal('Error Unknow');
			done();
		});
	});

	lab.test('simulateOrder error by missing params', { timeout: 10000 }, (done) => {
		libInit.simulateOrder({
			skuList: skuObj,
			payments: { type: 'POST_PAID' }
		}).catch((simulateError) => {
			expect(simulateError).to.be.an.object();
			expect(simulateError.success).to.be.equal(false);
			expect(simulateError.code).to.be.an.string().and.equal('invalidSimulateObj');
			expect(simulateError.message).to.be.an.string().and.equal('You need to send a valid simulate object');
			done();
		});
	});

	lab.test('simulateOrder error with invalid payment params', { timeout: 10000 }, (done) => {
		libInit.simulateOrder({
			skuList: skuObj,
			payments: { }
		}).catch((simulateError) => {
			expect(simulateError).to.be.an.object();
			expect(simulateError.success).to.be.equal(false);
			expect(simulateError.code).to.be.an.string().and.equal('invalidPayment');
			expect(simulateError.message).to.be.an.string().and.equal('You need to send a valid payment object');
			done();
		});
	});

	lab.test('simulateOrder error with missing payment params', { timeout: 10000 }, (done) => {
		libInit.simulateOrder({
			postalCode: '24470-170',
			skuList: skuObj
		}).catch((simulateError) => {
			expect(simulateError).to.be.an.object();
			expect(simulateError.success).to.be.equal(false);
			expect(simulateError.code).to.be.an.string().and.equal('missingPayment');
			expect(simulateError.message).to.be.an.string().and.equal('You need to send the payment object');
			done();
		});
	});

	lab.test('simulateOrder error with invalid seller', { timeout: 10000 }, (done) => {
		libInit.simulateOrder({
			postalCode: '24470-170',
			skuList: [skuObj, { skuId: 46393, sellerId: 'vtex_loja_modelo' }],
			payments: [{ type: 'POST_PAID' }]
		}).catch((simulateError) => {
			expect(simulateError).to.be.an.object();
			expect(simulateError.success).to.be.equal(false);
			expect(simulateError.code).to.be.an.string().and.equal('INVALID_SELLER');
			expect(simulateError.message).to.be.an.string().and.equal('The seller provided is invalid');
			done();
		});
	});

	lab.test('simulateOrder success', { timeout: 10000 }, (done) => {
		libInit.simulateOrder({
			postalCode: '04570000',
			skuList: skuObj,
			payments: { type: 'POST_PAID' }
		}).then((simulateResult) => {
			expect(simulateResult).to.be.an.object();
			expect(simulateResult.transactionId).to.be.an.string();
			expect(simulateResult.itemsGroup).to.be.an.object();
			expect(simulateResult.itemsGroup.items).to.be.an.array();
			expect(simulateResult.itemsGroup.discounts).to.be.an.array();

			expect(simulateResult.itemsGroup.items[0]).to.be.an.object();
			expect(simulateResult.itemsGroup.items[0].quantity).to.be.a.number();
			expect(simulateResult.itemsGroup.items[0].discountPrice.BRL).to.be.a.number();

			expect(simulateResult.itemsGroup.items[0].offer).to.be.an.object();
			expect(simulateResult.itemsGroup.items[0].offer.sellerId).to.be.a.string();
			expect(simulateResult.itemsGroup.items[0].offer.skuId).to.be.a.number();
			expect(simulateResult.itemsGroup.items[0].offer.availability).to.be.a.object();
			expect(simulateResult.itemsGroup.items[0].offer.availability.stock).to.be.a.number();
			expect(simulateResult.itemsGroup.items[0].offer.availability.realStock).to.be.a.boolean();
			expect(simulateResult.itemsGroup.items[0].offer.availability.price.BRL).to.be.a.number();
			expect(simulateResult.itemsGroup.items[0].offer.availability.listPrice.BRL).to.be.a.number();

			expect(simulateResult.itemsGroup.items[0].delivery).to.be.an.object();
			expect(simulateResult.itemsGroup.items[0].delivery.available).to.be.a.boolean();
			expect(simulateResult.itemsGroup.items[0].delivery.slas).to.be.an.array();
			expect(simulateResult.itemsGroup.items[0].delivery.slas[0].id).to.be.a.string();
			expect(simulateResult.itemsGroup.items[0].delivery.slas[0].type).to.be.a.string();
			expect(simulateResult.itemsGroup.items[0].delivery.slas[0].price.BRL).to.be.a.number();
			expect(simulateResult.itemsGroup.items[0].delivery.slas[0].duration).to.be.an.object();
			expect(simulateResult.itemsGroup.items[0].delivery.slas[0].duration.unit).to.be.an.string();
			expect(simulateResult.itemsGroup.items[0].delivery.slas[0].duration.value).to.be.an.string();

			done();
		});
	});



	lab.test('simulateOrder success with arrays', { timeout: 10000 }, (done) => {
		libInit.simulateOrder({
			postalCode: '04570000',
			skuList: [skuObj, { skuId: "999", sellerId: 1 }],
			payments: [{ type: 'POST_PAID' }]
		}).then((simulateResult) => {
			expect(simulateResult).to.be.an.object();
			expect(simulateResult.transactionId).to.be.an.string();
			expect(simulateResult.itemsGroup).to.be.an.object();
			expect(simulateResult.itemsGroup.items).to.be.an.array();
			expect(simulateResult.itemsGroup.discounts).to.be.an.array();

			expect(simulateResult.itemsGroup.items[0]).to.be.an.object();
			expect(simulateResult.itemsGroup.items[0].quantity).to.be.a.number();
			expect(simulateResult.itemsGroup.items[0].discountPrice.BRL).to.be.a.number();

			expect(simulateResult.itemsGroup.items[0].offer).to.be.an.object();
			expect(simulateResult.itemsGroup.items[0].offer.sellerId).to.be.a.string();
			expect(simulateResult.itemsGroup.items[0].offer.skuId).to.be.a.number();
			expect(simulateResult.itemsGroup.items[0].offer.availability).to.be.a.object();
			expect(simulateResult.itemsGroup.items[0].offer.availability.stock).to.be.a.number();
			expect(simulateResult.itemsGroup.items[0].offer.availability.realStock).to.be.a.boolean();
			expect(simulateResult.itemsGroup.items[0].offer.availability.price.BRL).to.be.a.number();
			expect(simulateResult.itemsGroup.items[0].offer.availability.listPrice.BRL).to.be.a.number();

			expect(simulateResult.itemsGroup.items[0].delivery).to.be.an.object();
			expect(simulateResult.itemsGroup.items[0].delivery.available).to.be.a.boolean();
			expect(simulateResult.itemsGroup.items[0].delivery.slas).to.be.an.array();
			expect(simulateResult.itemsGroup.items[0].delivery.slas[0].id).to.be.a.string();
			expect(simulateResult.itemsGroup.items[0].delivery.slas[0].type).to.be.a.string();
			expect(simulateResult.itemsGroup.items[0].delivery.slas[0].price.BRL).to.be.a.number();
			expect(simulateResult.itemsGroup.items[0].delivery.slas[0].duration).to.be.an.object();
			expect(simulateResult.itemsGroup.items[0].delivery.slas[0].duration.unit).to.be.an.string();
			expect(simulateResult.itemsGroup.items[0].delivery.slas[0].duration.value).to.be.an.string();

			done();
		});
	});

});
