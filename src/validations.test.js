import * as R from 'ramda';

import { isBirthNumber, parseRC } from './validations';

const expectMessage = (message, result) =>
	expect(R.path(['message', 'id'], result)).toEqual(message);

describe('isVparseRCalidRC', () => {
	it('parses male', () => {
		expect(parseRC('2005050014')).toMatchObject({ sex: 'm', month: 5 });
	});

	it('parses female', () => {
		expect(parseRC('2055050019')).toMatchObject({ sex: 'f', month: 5 });
	});

	it('parses rc+ for male', () => {
		expect(parseRC('2025050014')).toMatchObject({ sex: 'm', month: 5 });
	});

	it('parses rc+ for female', () => {
		expect(parseRC('2075050019')).toMatchObject({ sex: 'f', month: 5 });
	});

	it('parses ecp', () => {
		expect(parseRC('2005410014')).toMatchObject({ ecp: true });
	});

	describe('parses year', () => {
		it('for rc length===4', () => {
			expect(parseRC('5405050014')).toMatchObject({ year: 1954 });
			expect(parseRC('5305050014')).toMatchObject({ year: 2053 });
		});

		it('for rc length===3', () => {
			expect(parseRC('540505001')).toMatchObject({ year: 1854 });
			expect(parseRC('530505001')).toMatchObject({ year: 1953 });
		});
	});
});

describe('isBirthNumber', () => {
	it('controls that value is numeric', () => {
		expectMessage('validarium.hasOnlyDigits', isBirthNumber('20050500L4'));
	});

	it('controls length', () => {
		expectMessage('validarium.hasLengthInInterval', isBirthNumber('20050500'));
		expectMessage(
			'validarium.hasLengthInInterval',
			isBirthNumber('20050500144')
		);
	});

	it('controls when Length===9 and suffix===000', () => {
		expectMessage('validations.rc000', isBirthNumber('200505000'));
	});

	it('controls when ecp===true and rc+===true', () => {
		expectMessage('validations.rcEcpAndRcPlus', isBirthNumber('2075450144'));
	});

	it('controls date', () => {
		expectMessage('validations.rcInvalidDate', isBirthNumber('2013050014'));
		expectMessage('validations.rcInvalidDate', isBirthNumber('2012320014'));
	});

	describe('controls suffixes', () => {
		it('for rc length===4', () => {
			expectMessage('validations.rcInvalidSuffix', isBirthNumber('2005455999'));
		});

		it('for rc length===3', () => {
			expectMessage('validations.rcInvalidSuffix', isBirthNumber('200545599'));
		});
	});

	it('controls valid modulo', () => {
		expectMessage('validations.rcInvalidModulo', isBirthNumber('9407250293'));
	});
	it('pass valid rc', () => {
		expect(isBirthNumber('0108012729')).toBeFalsy();
		expect(isBirthNumber('9407250292')).toBeFalsy();
	});
});
