const ignorePatterns = ['/.history/', '/node_modules/', '/es/', '/dist/', '/lib/'];
module.exports = {
	snapshotSerializers: ['enzyme-to-json/serializer'],
	setupFilesAfterEnv: ['<rootDir>/testsSetup.js'],
	transform: {
		'^.+\\.js$': 'babel-jest',
		'^.+\\.svg$': 'jest-svg-transformer',
	},
	modulePathIgnorePatterns: ['.cache'],
	testPathIgnorePatterns: ignorePatterns,
	coveragePathIgnorePatterns: ignorePatterns,
	transformIgnorePatterns: [
		'/node_modules/(?!intl-messageformat|intl-messageformat-parser|gatsby-theme-fast-ai|ramda).+\\.js$',
	],
};
