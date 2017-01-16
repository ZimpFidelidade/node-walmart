'use strict';

const lab = exports.lab = require('lab').script();
const expect = require('code').expect;
const lib = require('../index');
var libInit;
var skuObj = { skuId: "884418", sellerId: 1 };

lab.describe('getPaymentMethods', () => {

	lab.beforeEach((done) => {
		skuObj = { skuId: "884418", sellerId: 1 };
		libInit = lib.init({
			code: process.env.WALMART_CODE,
			id: process.env.WALMART_ID,
			secret: process.env.WALMART_SECRET
		}, 'development');
		done();
	});

	lab.test('getPaymentMethods success', { timeout: 10000 }, (done) => {
		libInit.getPaymentMethods(skuObj)
			.then((payments) => {
				expect(payments).to.be.an.array();
				expect(payments[0]).to.be.an.object();
				expect(payments[0].name).to.be.a.string();
				expect(payments[0].type).to.be.a.string();

				done();
			});
	});

	lab.test('getPaymentMethods success with array', { timeout: 10000 }, (done) => {
		libInit.getPaymentMethods([skuObj, { skuId: 46393, sellerId: 'vtex_loja_modelo' }])
			.then((payments) => {
				expect(payments).to.be.an.array();
				expect(payments[0]).to.be.an.object();
				expect(payments[0].name).to.be.a.string();
				expect(payments[0].type).to.be.a.string();

				done();
			});
	});

	lab.test('getPaymentMethods erro without passing any param', (done) => {
		libInit.getPaymentMethods()
			.catch((paymentsError) => {
				expect(paymentsError).to.be.an.object();
				expect(paymentsError.success).to.be.equal(false);
				expect(paymentsError.code).to.be.an.string().and.equal('missingList');
				expect(paymentsError.message).to.be.an.string().and.equal('You need to send the list of sku ID');
				done();
			});
	});

	lab.test('getPaymentMethods erro passing wrong params', (done) => {
		libInit.getPaymentMethods({ id: "123", sellerId: 1 })
			.catch((paymentsError) => {
				expect(paymentsError).to.be.an.object();
				expect(paymentsError.success).to.be.equal(false);
				expect(paymentsError.code).to.be.an.string().and.equal('invalidSkuList');
				expect(paymentsError.message).to.be.an.string().and.equal('You need to send a valid sku list');
				done();
			});
	});

});
