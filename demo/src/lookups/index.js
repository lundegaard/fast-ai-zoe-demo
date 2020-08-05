import { valueMirror } from 'ramda-extension';
import { compose, curry, map, prop, values } from 'ramda';

export const MaritalStatus = {
	name: 'maritalStatus',
	values: valueMirror(['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED']),
};

export const CoborrowerChoice = {
	name: 'coborrowerChoice',
	values: valueMirror(['SINGLE', 'NON_SINGLE']),
};

/** @see http://www.europass.cz/wp-content/uploads/porovnani1.pdf */
export const EducationCS = {
	name: 'educationCS',
	values: valueMirror(['b', 'j', 'e', 'k', 'n', 'r', 't', 'v']),
};

export const EducationISCED97 = {
	name: 'educationISCED97',
	values: valueMirror(['1', '2', '3', '4', '5', '6']),
};

export const EducationNonStandard = {
	name: 'educationNonStandard',
	values: valueMirror([
		'ELEMENTARY',
		'SECONDARY',
		'SECONDARY_WITH_MATURITA',
		'TERTIARY',
		'UNIVERSITY',
	]),
};

// export const getEducationByLanguage = language =>
// 	language === 'cs' ? EducationCS : EducationISCED97;

export const getEducationByLanguage = () => EducationNonStandard;

export const mapLookup = curry((mapping, lookup) =>
	compose(values, map(mapping), prop('values'))(lookup)
);
