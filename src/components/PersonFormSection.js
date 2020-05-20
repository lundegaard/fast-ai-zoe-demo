import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { hasOnlyDigits, isEmail, isRequired } from 'validarium';
import { FormattedMessage, useIntl } from 'gatsby-theme-fast-ai';

import m from '../intl/messages';
import { MaritalStatus, getEducationByLanguage, mapLookup } from '../lookups';
import { isBirthNumber } from '../validations';

import { HalfCol, NumberTextField, SelectField, TextField } from './forms';

const emptyOption = { value: '' };

const PersonFormSection = ({ fieldPrefix }) => {
	const intl = useIntl();
	const Education = useMemo(() => getEducationByLanguage(intl.locale), [intl.locale]);

	return (
		<Fragment>
			<HalfCol>
				<TextField
					validate={isRequired}
					label={<FormattedMessage {...m.givenName} />}
					field={`${fieldPrefix}.givenName`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					validate={isRequired}
					label={<FormattedMessage {...m.familyName} />}
					field={`${fieldPrefix}.familyName`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					label={<FormattedMessage {...m.birthNumber} />}
					field={`${fieldPrefix}.birthNumber`}
					validate={isBirthNumber}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					label={<FormattedMessage {...m.streetAddress} />}
					field={`${fieldPrefix}.address.streetAddress`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					label={<FormattedMessage {...m.streetLocality} />}
					field={`${fieldPrefix}.address.streetLocality`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					label={<FormattedMessage {...m.postalCode} />}
					field={`${fieldPrefix}.address.postalCode`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					label={<FormattedMessage {...m.phoneNumber} />}
					field={`${fieldPrefix}.phoneNumber`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					validate={isEmail}
					label={<FormattedMessage {...m.email} />}
					field={`${fieldPrefix}.email`}
				/>
			</HalfCol>

			<HalfCol>
				<SelectField
					label={<FormattedMessage {...m.maritalStatus} />}
					field={`${fieldPrefix}.maritalStatus`}
					name={`${fieldPrefix}_basic_information_marital_status`}
					items={[
						emptyOption,
						...mapLookup((status) => ({
							value: status,
							label: status ? intl.formatMessage(m[`maritalStatus_${status}`]) : status,
						}))(MaritalStatus),
					]}
				/>
			</HalfCol>

			<HalfCol>
				<SelectField
					label={<FormattedMessage {...m.education} />}
					field={`${fieldPrefix}.educationLevel`}
					name={`${fieldPrefix}_basic_information_education_level`}
					items={[
						emptyOption,
						...mapLookup((level) => ({
							value: level,
							label: level ? intl.formatMessage(m[`${Education.name}_${level}`]) : level,
						}))(Education),
					]}
				/>
			</HalfCol>

			<HalfCol>
				<NumberTextField
					label={<FormattedMessage {...m.netIncomeMain} />}
					field={`${fieldPrefix}.balance.netIncomeMain`}
					name={`${fieldPrefix}_monthly_income_info_income`}
					validate={hasOnlyDigits}
				/>
			</HalfCol>

			<HalfCol>
				<NumberTextField
					label={<FormattedMessage {...m.expenditureAnotherInstallment} />}
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
