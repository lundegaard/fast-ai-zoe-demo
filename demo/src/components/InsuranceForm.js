import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Row, useDebounce } from '@fast-ai/ui-components';
import { fromPairs, map, o } from 'ramda';
import { FormattedMessage } from 'gatsby-theme-fast-ai';

import m from '../intl/messages';

import PersonFormSection from './PersonFormSection';

import { FormHeading, FullCol, SummarySection } from '.';

const summaryLabels = {
	amount: <FormattedMessage {...m.insuranceInfoAmount} />,
	numberOfInstallments: (
		<FormattedMessage {...m.insuranceNumberOfInstalments} />
	),
	total: <FormattedMessage {...m.insuranceTotalAmountPerMonth} />,
};

const personLabels = o(
	fromPairs,
	map(([label, messageId]) => [
		label,
		<FormattedMessage {...m[`${messageId || label}`]} />,
	])
)([
	['givenName'],
	['familyName'],
	['birthNumber'],
	['streetAddress'],
	['addressLocality'],
	['postalCode'],
	['phoneNumber'],
	['email'],
	['maritalStatus'],
	['educationLevel'],
	['netIncomeMain', 'insuranceMaxClaimAmount'],
	['expenditureAnotherInstallment', 'insuranceMinClaimAmount'],
]);

const InsuranceForm = ({
	handleClickSubmit,
	canSubmit,
	isSubmitting,
	getFieldValue,
	name,
}) => {
	const monthlyFee =
		getFieldValue('loanInfo.amount') /
		getFieldValue('loanInfo.numberOfInstallments');

	const [monthlyFeeDebounced] = useDebounce(monthlyFee, 200);

	return (
		<Row flexWrap="wrap">
			<Col span={[12, 12, 6]}>
				<Row flexWrap="wrap">
					<FullCol>
						<FormHeading>
							<FormattedMessage {...m.personalInfoTitle} />
						</FormHeading>
					</FullCol>

					<PersonFormSection labels={personLabels} fieldPrefix="borrower" />
				</Row>
			</Col>
			<Col span={[12, 12, 6]}>
				<Row flexWrap="wrap">
					<FullCol>
						<FormHeading>
							<FormattedMessage {...m.insuranceSetupInsuranceTitle} />
						</FormHeading>
					</FullCol>

					<SummarySection
						labels={summaryLabels}
						formName={name}
						monthlyFee={monthlyFeeDebounced}
					/>

					<FullCol>
						<Button
							onClick={handleClickSubmit}
							variant="secondary"
							width={1}
							disabled={!canSubmit || isSubmitting}
						>
							<FormattedMessage {...m.apply} />
						</Button>
					</FullCol>
				</Row>
			</Col>
		</Row>
	);
};

InsuranceForm.propTypes = {
	canSubmit: PropTypes.bool,
	coborrowerChoice: PropTypes.node,
	getFieldValue: PropTypes.func,
	handleClickSubmit: PropTypes.func,
	isSubmitting: PropTypes.bool,
	monthlyFee: PropTypes.number,
	name: PropTypes.string,
};

InsuranceForm.displayName = 'InsuranceForm';

export default InsuranceForm;
