'use strict';

const lab = exports.lab = require('lab').script();
const expect = require('code').expect;
const lib = require('../index');

lab.describe('init', () => {

	lab.test('Should not validate data', (done) => {
		expect(lib.init).to.throw(Error, 'You need to send your credentials to initialize the module');
		expect(lib.init.bind({})).to.throw(Error, 'You need to send your credentials to initialize the module');
		expect(lib.init.bind({ code: '123' })).to.throw(Error, 'You need to send your credentials to initialize the module');
		done();
	});

	lab.test('Should validate data', (done) => {
		let libInit = lib.init({
			code: "12345",
			id: "u5w9XbRSKa3aGSoIJ0wpu5w9XbRSKa3aGSoIJ0wpu5w9XbRSKa3aGSoIJ0wpKTS3",
			secret: "u5w9XbRSKa3aGSoIJ0wpu5w9XbRSKa3aGSoIJ0wpu5w9XbRSKa3aGSoIJ0wpKTS3"
		});

		expect(libInit).to.be.an.object();
		expect(libInit.env).to.be.equal('development');
		expect(libInit.rootUrl).to.be.equal('https://186.209.165.148/api/v2');
		done();
	});

	lab.test('Should validate data with another env', (done) => {
		let libInit = lib.init({
			code: "12345",
			id: "u5w9XbRSKa3aGSoIJ0wpu5w9XbRSKa3aGSoIJ0wpu5w9XbRSKa3aGSoIJ0wpKTS3",
			secret: "u5w9XbRSKa3aGSoIJ0wpu5w9XbRSKa3aGSoIJ0wpu5w9XbRSKa3aGSoIJ0wpKTS3"
		}, 'production');

		expect(libInit).to.be.an.object();
		expect(libInit.env).to.be.equal('production');
		expect(libInit.rootUrl).to.be.equal('https://api.walmart.com.br/api/v2');
		done();
	});
});
