const path = require('path');

module.exports = (api) => {
	api.cache.never();

	require('dotenv').config({
		path: path.join(__dirname, `.env.${process.env.NODE_ENV}`),
	});

	return {
		presets: [
			[
				'babel-preset-react-union',
				{
					test: process.env.NODE_ENV === 'test',
					loose: true,
					library: false,
					universal: false,
				},
			],
		],
		plugins: [
			[
				'transform-inline-environment-variables',
				{
					include: ['TENANT_ID', 'API_URL', 'SA_DISTRIBUTION_URL'],
				},
			],
		],
	};
};
