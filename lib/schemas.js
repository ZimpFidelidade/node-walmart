'use strict';

const Joi = require('joi');
/* $lab:coverage:off$ */
const customJoi = Joi.extend({
	base: Joi.string().trim().lowercase().replace(/[^\d]+/g, '').length(11), // eslint-disable-line no-magic-numbers
	name: 'string',
	language: { cpf: 'must be a valid CPF number' },
	rules: [{
		name: 'cpf',
		description: 'Valid CPF number',
		validate(params, value, state, options) {
			if(!value) {
				return this.createError('string.cpf', { value }, state, options);
			}

			let sumFirst = 0;
			let sumSecond = 0;
			let verFrist = 0;
			let verSecond = 0;
			let cpf = value;

			if( !cpf
				|| cpf === '00000000000' || cpf === '11111111111' // eslint-disable-line operator-linebreak
				|| cpf === '22222222222' || cpf === '33333333333' // eslint-disable-line operator-linebreak
				|| cpf === '44444444444' || cpf === '55555555555' // eslint-disable-line operator-linebreak
				|| cpf === '66666666666' || cpf === '77777777777' // eslint-disable-line operator-linebreak
				|| cpf === '88888888888' || cpf === '99999999999' // eslint-disable-line operator-linebreak
			) {
				return this.createError('string.cpf', { value }, state, options);
			}

			for(let x = 0; x < 9; x++) { // eslint-disable-line id-length,no-magic-numbers
				sumFirst += parseInt(cpf.charAt(x), 10) * (10 - x);
			}

			for(let y = 0; y < 10; y++) { // eslint-disable-line id-length
				sumSecond += parseInt(cpf.charAt(y), 10) * (11 - y); // eslint-disable-line no-magic-numbers
			}

			verFrist = 11 - (sumFirst % 11); // eslint-disable-line no-magic-numbers
			verSecond = 11 - (sumSecond % 11); // eslint-disable-line no-magic-numbers

			if(verFrist > 9) { // eslint-disable-line no-magic-numbers
				verFrist = 0;
			}

			if(verSecond > 9) { // eslint-disable-line no-magic-numbers
				verSecond = 0;
			}

			if(verFrist !== parseInt(cpf.charAt(9), 10) || verSecond !== parseInt(cpf.charAt(10), 10)) { // eslint-disable-line no-magic-numbers
				return this.createError('string.cpf', { value }, state, options);
			}

			return cpf;
		}
	}]
});
/* $lab:coverage:on$ */

const skuListSchema = Joi.array().items(
	Joi.object().keys({
		skuId: Joi.number().min(1).required(),
		sellerId: Joi.alternatives([ Joi.string(), Joi.number() ]).required(),
		quantity: Joi.number().min(1).default(1).optional()
	})
).max(10).min(1);

const paymentSchema = Joi.array().items(
	Joi.object().keys({
		type: Joi.string().trim().uppercase().valid([ 'CREDIT_CARD', 'POST_PAID' ]).required(),
		name: Joi.string().trim().max(50).uppercase().optional(),
		value: Joi.string().creditCard().optional(),
		bin: Joi.string().trim().length(6).regex(/^[0-9]+$/, 'numbers').optional()
	})
).max(2).min(1);

const creditCardSchema = Joi.object().keys({
	creditCardNumber: Joi.string().creditCard().required(),
	securityCode: Joi.string().trim().min(3).max(4).regex(/^[0-9]+$/, 'numbers').required()
});

const simulateSchema = Joi.object().keys({
	skuList: Joi.object().keys({
		items: Joi.array().items(
			Joi.object().keys({
				offer: Joi.object().keys({
					skuId: Joi.number().required(),
					sellerId: Joi.string().required()
				}),
				quantity: Joi.number().default(1).optional()
			})
		).max(10).min(1)
	}),
	payments: Joi.object().keys({ methods: paymentSchema }),
	postalCode: Joi.string().trim().replace('-', '').length(8).regex(/^[0-9]+$/, 'numbers').required(),
	currency: Joi.string().default('BRL').optional(),
	country: Joi.string().default('BRA').optional()
});

const addressSchema = Joi.object().keys({
	address: Joi.string().max(150).required(), // eslint-disable-line no-magic-numbers
	number: Joi.string().trim().regex(/^[0-9]+$/, 'numbers').required(),
	complement: Joi.string().max(100).optional(),
	neighborhood: Joi.string().max(50).required(),
	reference: Joi.string().max(100).optional(),
	postalCode: Joi.string().trim().replace('-', '').length(8).regex(/^[0-9]+$/, 'numbers').required(),
	city: Joi.string().max(100).required(),
	state: Joi.string().trim().length(2).uppercase().required(),
	country: Joi.string().max(5).default('BRA').optional(),
	type: Joi.string().trim().uppercase().valid([ 'RESIDENTIAL', 'BUSINESS' ]).default('RESIDENTIAL').optional()
});

const skuOrderSchema = Joi.array().items(Joi.object().keys({
	quantity: Joi.number().default(1).optional(),
	discounts: Joi.array().items(Joi.object().keys({
		id: Joi.string().max(100).required(),
		type: Joi.string().max(100).required(),
		duration: Joi.object().optional()
	})).optional(),

	offer: Joi.object().keys({
		skuId: Joi.number().required(),
		sellerId: Joi.string().required(),
		price: Joi.object().length(1).pattern(/^[A-Z]{3}$/, Joi.number()).required()
	}),

	discountPrice: Joi.object().length(1).pattern(/^[A-Z]{3}$/, Joi.number()).required(),

	sla: Joi.object().keys({
		type: Joi.string().trim().valid([ 'Agendada', 'Normal', 'Expressa' ]).default('Normal').optional(),
		id: Joi.string().max(100).required(),
		price: Joi.object().length(1).pattern(/^[A-Z]{3}$/, Joi.number()).optional(),
		duration: Joi.object().keys({
			unit: Joi.string().trim().uppercase().valid([ 'DAY', 'BUSINESS_DAY', 'WEEK', 'HOUR', 'DATE' ]).default('BUSINESS_DAY').optional(),
			value: Joi.string().required()
		}).required()
	}).required()
}));

const paymentOrderSchema = Joi.array().items(Joi.object().keys({
	totalValue: Joi.number().min(1).max(999999).required(), // eslint-disable-line no-magic-numbers
	paymentMethod: Joi.string().trim().uppercase().valid([ 'CREDIT_CARD', 'POST_PAID' ]).required(),
	billingAddress: addressSchema
}));

const customerSchema = Joi.object().keys({
	firstName: Joi.string().trim().required(),
	lastName: Joi.string().trim().required(),
	birthDate: Joi.date().max('now').required(),
	gender: Joi.string().trim().length(1).uppercase().valid([ 'M', 'F' ]).required(),
	type: Joi.string().default('INDIVIDUAL').optional(),
	email: Joi.string().email().required(),
	phones: Joi.array().items(
		Joi.object().keys({
			type: Joi.string().trim().uppercase().valid([ 'HOME', 'WORK', 'MOBILE' ]).default('MOBILE').required(),
			number: Joi.string().trim().replace('+', '').min(10).max(14).regex(/^[0-9]+$/, 'numbers').required() // eslint-disable-line no-magic-numbers
		})
	),
	document: customJoi.string().cpf().required(),
	stateInscription: Joi.string().default(null).max(50).optional() // eslint-disable-line no-magic-numbers
});

const orderSchema = Joi.object().keys({
	currency: Joi.string().default('BRL').length(3).optional(),
	genericOrderId: Joi.string().alphanum().max(60).default(null).optional(),

	customer: customerSchema.required(),

	shipping: Joi.object().keys({
		recipient: Joi.string().trim().required(),
		recipientPhone: Joi.string().trim().replace('+', '').min(10).max(14).regex(/^[0-9]+$/, 'numbers').required(), // eslint-disable-line no-magic-numbers
		recipientDocument: customJoi.string().cpf().required(),
		recipientEmail: Joi.string().email().required(),
		type: Joi.string().default('CPF').optional(),
		address: addressSchema.required()
	}).required(),

	payments: paymentOrderSchema.required(),

	itemsGroup: Joi.object().keys({
		items: skuOrderSchema.required()
	})
});

module.exports = {
	skuListSchema,
	paymentSchema,
	creditCardSchema,
	simulateSchema,
	skuOrderSchema,
	paymentOrderSchema,
	customerSchema,
	orderSchema
};
