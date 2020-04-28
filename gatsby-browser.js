const { deleteAllCookies } = require('./src/utils');

exports.onRouteUpdate = () => {
	window.sa('send', 'pageview');
};

exports.onClientEntry = () => {
	// For demo purposses clear all previous sessions.
	// You don't need to do that in your application.
	deleteAllCookies();
};
