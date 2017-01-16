'use strict';

var productAPI = {

	getFullCatalog() {
		return this.makeRequest('GET', '/catalogs/full')
			.then((response) => {
				return response.body;
			});
	},

	getPartialCatalog() {
		return this.makeRequest('GET', '/catalogs/partial')
			.then((response) => {
				return response.body;
			});
	},

	/* $lab:coverage:off$ */
	getProduct(productId) {
		if(!productId) {
			return this.errorHandler('products', 'missingProductId', {}, true);
		}

		return this.makeRequest('GET', `/products/${productId}`)
			.then((response) => {
				if(!response.body.product) {
					return this.errorHandler('products', 'productNotFound');
				}

				return response.body.product;
			})
			.catch((errorResponse) => {
				return this.errorHandler('products', errorResponse.response.body.summary.errors[0].type, errorResponse.response.body);
			});
	},

	getSku(skuId) {
		if(!skuId) {
			return this.errorHandler('products', 'missingSkuId', {}, true);
		}

		return this.makeRequest('GET', `/skus/${skuId}`)
			.then((response) => {
				if(!response.body.sku) {
					return this.errorHandler('products', 'skuNotFound');
				}

				return response.body.sku;
			})
			.catch((errorResponse) => {
				return this.errorHandler('products', errorResponse.response.body.summary.errors[0].type, errorResponse.response.body);
			});
	}
	/* $lab:coverage:on$ */

};

module.exports = productAPI;
