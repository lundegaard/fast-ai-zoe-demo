import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { hasOnlyDigits, isEmail, isRequired } from 'validarium';
import { FormattedMessage, useIntl } from 'gatsby-theme-fast-ai';
import { fromPairs, map, o } from 'ramda';

import m from '../intl/messages';
import { MaritalStatus, getEducationByLanguage, mapLookup } from '../lookups';
import { isBirthNumber } from '../validations';

import { HalfCol, NumberTextField, SelectField, TextField } from './forms';

const emptyOption = { value: '' };

const labels = o(
	fromPairs,
	map((messageId) => [messageId, <FormattedMessage {...m[`${messageId}`]} />])
)([
	'givenName',
	'familyName',
	'birthNumber',
	'streetAddress',
	'streetLocality',
	'postalCode',
	'phoneNumber',
	'email',
	'maritalStatus',
	'educationLevel',
	'netIncomeMain',
	'expenditureAnotherInstallment',
]);

const PersonFormSection = ({ fieldPrefix }) => {
	const intl = useIntl();
	const Education = useMemo(() => getEducationByLanguage(intl.locale), [
		intl.locale,
	]);

	const maritalStatusItems = useMemo(
		() => [
			emptyOption,
			...mapLookup((status) => ({
				value: status,
				label: status
					? intl.formatMessage(m[`maritalStatus_${status}`])
					: status,
			}))(MaritalStatus),
		],
		[intl]
	);

	const educationLevelItems = useMemo(
		() => [
			emptyOption,
			...mapLookup((level) => ({
				value: level,
				label: level
					? intl.formatMessage(m[`${Education.name}_${level}`])
					: level,
			}))(Education),
		],
		[Education, intl]
	);

	return (
		<Fragment>
			<HalfCol>
				<TextField
					validate={isRequired}
					label={labels.givenName}
					field={`${fieldPrefix}.givenName`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					validate={isRequired}
					label={labels.familyName}
					field={`${fieldPrefix}.familyName`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					label={labels.birthNumber}
					field={`${fieldPrefix}.birthNumber`}
					validate={isBirthNumber}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					label={labels.streetAddress}
					field={`${fieldPrefix}.address.streetAddress`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					label={labels.streetLocality}
					field={`${fieldPrefix}.address.streetLocality`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					label={labels.postalCode}
					field={`${fieldPrefix}.address.postalCode`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					label={labels.phoneNumber}
					field={`${fieldPrefix}.phoneNumber`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					validate={isEmail}
					label={labels.email}
					field={`${fieldPrefix}.email`}
				/>
			</HalfCol>

			<HalfCol>
				<SelectField
					label={labels.maritalStatus}
					field={`${fieldPrefix}.maritalStatus`}
					name={`${fieldPrefix}_basic_information_marital_status`}
					items={maritalStatusItems}
				/>
			</HalfCol>

			<HalfCol>
				<SelectField
					label={labels.educationLevel}
					field={`${fieldPrefix}.educationLevel`}
					name={`${fieldPrefix}_basic_information_education_level`}
					items={educationLevelItems}
				/>
			</HalfCol>

			<HalfCol>
				<NumberTextField
					label={labels.netIncomeMain}
					field={`${fieldPrefix}.balance.netIncomeMain`}
					name={`${fieldPrefix}_monthly_income_info_income`}
					validate={hasOnlyDigits}
				/>
			</HalfCol>

			<HalfCol>
				<NumberTextField
					label={labels.expenditureAnotherInstallment}
					field={`${fieldPrefix}.balance.expenditureAnotherInstallment`}
					name={`${fieldPrefix}_monthly_income_info_another_regular_income`}
					validate={hasOnlyDigits}
				/>
			</HalfCol>
		</Fragment>
	);
};

PersonFormSection.propTypes = { fieldPrefix: PropTypes.string };

export default PersonFormSection;
