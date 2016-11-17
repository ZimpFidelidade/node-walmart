'use strict';

var errorAPI = {

	errorObj: {
		main: {
			0: 'Request Error',
			'missingCredentials': 'You need to pass your credentials to initialize the module'
		}
	},

	errorHandler(section, code, errorResponse, throwError) {
		var returnedError = { success: false },
			message = 'Error Unknow';

		if(errorAPI.errorObj[section][code]) {
			message = errorAPI.errorObj[section][code];
		}

		returnedError.code = code;
		returnedError.message = message;

		if(errorResponse) {
			delete errorResponse.response;
			returnedError.errorResponse = errorResponse;
		}

		if(throwError) {
			throw Error(returnedError.message);
		}

		return Promise.reject(returnedError);
	}

};

module.exports = Object.create(errorAPI);
