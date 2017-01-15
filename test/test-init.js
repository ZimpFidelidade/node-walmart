'use strict';

const lab = exports.lab = require('lab').script();
const expect = require('code').expect;

const lib = require('../index');

lab.describe('init', () => {
	lab.test('Should validate Data', () => {
		var referenceError = new Error('You need to send your credentials to initialize the module');
		expect(lib.init()).to.throw(referenceError);
	});
});
