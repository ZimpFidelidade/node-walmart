'use strict';

require('dotenv').load();

const lab = exports.lab = require('lab').script();
const expect = require('code').expect;
const lib = require('../index');
var libInit;

const productValidation = function(productObj) {
	expect(productObj).to.be.an.object();

	expect(productObj.productId).to.be.an.number();
	expect(new Date(productObj.lastUpdate)).to.be.an.date();
	expect(productObj.name).to.be.an.string();
	expect(productObj.description).to.be.an.string();
	expect(productObj.categories).to.be.an.array();
	expect(productObj.categories[0].id).to.be.an.number();
	expect(productObj.categories[0].name).to.be.an.string();
	expect(productObj.active).to.be.an.boolean();
	expect(productObj.brand).to.be.an.object();
	expect(productObj.brand.id).to.be.an.number();
	expect(productObj.brand.name).to.be.an.string();
	expect(productObj.attributes).to.be.an.array();
	expect(productObj.attributes[0].name).to.be.an.string();
	expect(productObj.attributes[0].values).to.be.an.array();
	expect(productObj.attributes[0].values[0]).to.be.an.string();
	expect(productObj.skus).to.be.an.array();
	expect(productObj.skus[0].id).to.be.an.number();
	expect(productObj.skus[0].name).to.be.an.string();
	expect(productObj.skus[0].active).to.be.an.boolean();
	expect(productObj.skus[0].specializations).to.be.an.array();
	expect(productObj.skus[0].eans).to.be.an.array();
	expect(productObj.skus[0].eans[0]).to.be.an.string();
	expect(productObj.skus[0].dimensions).to.be.an.object();
	expect(productObj.skus[0].dimensions.height).to.be.an.number();
	expect(productObj.skus[0].dimensions.length).to.be.an.number();
	expect(productObj.skus[0].dimensions.weight).to.be.an.number();
	expect(productObj.skus[0].dimensions.width).to.be.an.number();

	expect(productObj.skus[0].offers).to.be.an.array();
	expect(productObj.skus[0].offers[0]).to.be.an.object();
	expect(productObj.skus[0].offers[0].active).to.be.an.boolean();
	expect(productObj.skus[0].offers[0].available).to.be.an.boolean();
	expect(productObj.skus[0].offers[0].discountPrice.BRL).to.be.an.number();
	expect(productObj.skus[0].offers[0].listPrice.BRL).to.be.an.number();
	expect(productObj.skus[0].offers[0].seller).to.be.an.object();
	expect(productObj.skus[0].offers[0].seller.id).to.be.an.string();
	expect(productObj.skus[0].offers[0].seller.name).to.be.an.string();


	expect(productObj.skus[0].images).to.be.an.array();
	expect(productObj.skus[0].images[0]).to.be.an.object();
	expect(productObj.skus[0].images[0].url).to.be.an.string();
	expect(productObj.skus[0].images[0].width).to.be.an.number();
	expect(productObj.skus[0].images[0].height).to.be.an.number();
}

lab.describe('products', { timeout: 0 }, () => {

	lab.beforeEach((done) => {
		libInit = lib.init({
			code: process.env.WALMART_CODE,
			id: process.env.WALMART_ID,
			secret: process.env.WALMART_SECRET
		}, 'development');
		done();
	});

	lab.test('getPartialCatalog', (done) => {
		libInit.getPartialCatalog()
			.then((products) => {
				let productObj = products.products[0];
				expect(new Date(products.creationDate)).to.be.a.date();
				expect(new Date(products.beginChangeTime)).to.be.a.date();

				expect(products.products).to.be.an.array().and.have.length(1);
				productValidation(productObj);

				done();
			});
	});

	lab.test('getFullCatalog', (done) => {
		libInit.getFullCatalog()
			.then((products) => {
				let productObj = products.products[0];
				expect(new Date(products.creationDate)).to.be.a.date();
				expect(new Date(products.beginChangeTime)).to.be.a.date();

				expect(products.products).to.be.an.array();
				productValidation(productObj);

				done();
			});
	});

});
