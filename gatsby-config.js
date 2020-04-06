const path = require('path');

const { author } = require('./package.json');

require('dotenv').config({
	path: path.join(__dirname, `.env.${process.env.NODE_ENV}`),
});

const siteMetadata = {
	author,
	description: '',
	title: 'Zoe.ai',
};

module.exports = {
	siteMetadata,
	pathPrefix: `/demo`,
	plugins: [
		{
			resolve: require.resolve('gatsby-theme-fast-ai'),
			options: {
				intlOptions: {
					languages: ['en', 'cs'],
					path: `${__dirname}/src/intl`,
					defaultLanguage: 'cs',
				},
				siteMetadata,
			},
		},
		{
			resolve: require.resolve('./src/plugins/gatsby-plugin-s-analytics'),
			options: {
				tenantId: process.env.TENANT_ID,
				usePlugins: ['s-apm', 's-form', 's-biometrics'],
			},
		},
	],
};
