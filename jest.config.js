const ignorePatterns = [
	'/.history/',
	'/node_modules/',
	'/es/',
	'/public/',
	'/dist/',
	'/lib/',
];
module.exports = {
	globals: {
		__PATH_PREFIX__: '',
	},
	snapshotSerializers: ['enzyme-to-json/serializer'],
	setupFilesAfterEnv: ['<rootDir>/testsSetup.js'],
	transform: {
		'^.+\\.jsx?$': '<rootDir>/jestPreprocess.js',
		'^.+\\.svg$': 'jest-svg-transformer',
	},
	modulePathIgnorePatterns: ['.cache'],
	testPathIgnorePatterns: ignorePatterns,
	coveragePathIgnorePatterns: ignorePatterns,
	transformIgnorePatterns: [
		'/node_modules/(?!(gatsby)|intl-messageformat|intl-messageformat-parser|gatsby-theme-fast-ai|ramda).+\\.js$',
	],
};
