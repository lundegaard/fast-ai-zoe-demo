import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { hasLengthInInterval, hasOnlyDigits, isEmail, isRequired } from 'validarium';
import { FormattedMessage, useIntl } from 'gatsby-theme-fast-ai';

import m from '../intl/messages';
import { MaritalStatus, getEducationByLanguage } from '../lookups';

import { HalfCol, NumberTextField, SelectField, TextField } from './forms';

const isBirthNumber = hasLengthInInterval(9, 10);

const PersonalInfo = ({ fieldPrefix }) => {
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
					items={['', ...MaritalStatus.values].map((status) => ({
						value: status,
						label: status ? intl.formatMessage(m[`maritalStatus_${status}`]) : status,
					}))}
				/>
			</HalfCol>

			<HalfCol>
				<SelectField
					label={<FormattedMessage {...m.education} />}
					field={`${fieldPrefix}.education`}
					items={['', ...Education.values].map((level) => ({
						value: level,
						label: level ? intl.formatMessage(m[`${Education.name}_${level}`]) : level,
					}))}
				/>
			</HalfCol>

			<HalfCol>
				<NumberTextField
					label={<FormattedMessage {...m.netIncomeMain} />}
					field={`${fieldPrefix}.balance.netIncomeMain`}
					validate={hasOnlyDigits}
				/>
			</HalfCol>

			<HalfCol>
				<NumberTextField
					label={<FormattedMessage {...m.expenditureAnotherInstallment} />}
					field={`${fieldPrefix}.balance.expenditureAnotherInstallment`}
					validate={hasOnlyDigits}
				/>
			</HalfCol>
		</Fragment>
	);
};

PersonalInfo.propTypes = { fieldPrefix: PropTypes.string };

export default PersonalInfo;
