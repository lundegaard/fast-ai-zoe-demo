import {
	applySpec,
	both,
	complement,
	compose,
	equals,
	filter,
	head,
	ifElse,
	join,
	length,
	not,
	nth,
	o,
	prop,
	split,
	test,
	when,
	whereEq,
} from 'ramda';
import { createValidation, hasLengthInInterval, hasOnlyDigits, validate } from 'validarium';

import m from './intl/messages';

export const parseRC = compose(
	ifElse(
		({ len }) => len === 10,
		(x) => ({ ...x, year: x.year > 53 ? x.year + 1900 : x.year + 2000 }),
		(x) => ({ ...x, year: x.year > 53 ? x.year + 1800 : x.year + 1900 })
	),
	when(
		({ day }) => day > 40,
		(x) => ({ ...x, ecp: true, day: x.day - 20 })
	),
	when(
		({ month }) => month > 20,
		(x) => ({ ...x, 'rc+': true, month: x.month - 20 })
	),
	ifElse(
		({ month }) => month > 50,
		(x) => ({ ...x, sex: 'f', month: x.month - 50 }),
		(x) => ({ ...x, sex: 'm' })
	),
	applySpec({
		value: join(''),
		len: o(length, join('')),
		year: o(Number, head),
		month: o(Number, nth(1)),
		day: o(Number, nth(2)),
		suffix: nth(3),
	}),
	filter(Boolean),
	split(/([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{3,4})/)
);

const isDateValid = (d) => isNaN(d.getTime());

const isRC000 = createValidation(
	compose(not, both(o(test(/000$/), prop('suffix')), o(equals(9), prop('len'))), parseRC),
	m.validationsRc000
);
const isEcpAndRCPlus = createValidation(
	compose(not, whereEq({ ecp: true, 'rc+': true }), parseRC),
	m.validationsRcEcpAndRcPlus
);

const rcRepresentsValidDate = createValidation(
	compose(
		complement(isDateValid),
		({ day, month, year }) => new Date([year, month, day].join('-')),
		parseRC
	),
	m.validationsRcInvalidDate
);
const rcHasValidSuffix = createValidation(
	compose(
		not,
		both(
			({ len, suffix }) =>
				(len === 9 && Number(suffix) < 600) || (len === 10 && Number(suffix) < 6000),
			whereEq({ ecp: true })
		),
		parseRC
	),
	m.validationsRcInvalidSuffix
);
const rcHasInvalidModulo = createValidation(
	compose((x) => x % 11 === 0, Number, prop('value'), parseRC),
	m.validationsRcInvalidModulo
);

/**
 * Validation of czech ID number.
 *
 * @seek https://www.cssz.cz/web/cz/standardni-kontrola-rodneho-cisla-a-evidencniho-cisla-pojistence
 */
export const isBirthNumber = validate([
	hasOnlyDigits,
	hasLengthInInterval(9, 10),
	isRC000,
	isEcpAndRCPlus,
	rcRepresentsValidDate,
	rcHasValidSuffix,
	rcHasInvalidModulo,
]);
