import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Row, useDebounce } from '@fast-ai/ui-components';
import { FormattedMessage } from 'gatsby-theme-fast-ai';
import { fromPairs, map, o } from 'ramda';

import m from '../intl/messages';

import { BorrowersFormSection, FormHeading, FullCol, SummarySection } from '.';

const summaryLabels = {
	amount: <FormattedMessage {...m.loanInfoAmount} />,
	numberOfInstalments: <FormattedMessage {...m.numberOfInstalments} />,
	total: <FormattedMessage {...m.totalAmountPerMonth} />,
};

const personLabels = o(
	fromPairs,
	map((messageId) => [messageId, <FormattedMessage {...m[`${messageId}`]} />])
)([
	'givenName',
	'familyName',
	'birthNumber',
	'streetAddress',
	'addressLocality',
	'postalCode',
	'phoneNumber',
	'email',
	'maritalStatus',
	'educationLevel',
	'netIncomeMain',
	'expenditureAnotherInstallment',
]);

const LoansForm = ({
	handleClickSubmit,
	canSubmit,
	isSubmitting,
	getFieldValue,
	name,
}) => {
	const coborrowerChoice = getFieldValue('webdata.coborrowerChoice');

	const monthlyFee =
		getFieldValue('loanInfo.amount') /
		getFieldValue('loanInfo.numberOfInstalments');

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

					<BorrowersFormSection
						personLabels={personLabels}
						coborrowerChoice={coborrowerChoice}
					/>
				</Row>
			</Col>
			<Col span={[12, 12, 6]}>
				<Row flexWrap="wrap">
					<FullCol>
						<FormHeading>
							<FormattedMessage {...m.setupLoanTitle} />
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

LoansForm.propTypes = {
	canSubmit: PropTypes.bool,
	coborrowerChoice: PropTypes.node,
	getFieldValue: PropTypes.func,
	handleClickSubmit: PropTypes.func,
	isSubmitting: PropTypes.bool,
	monthlyFee: PropTypes.number,
	name: PropTypes.string,
};

LoansForm.displayName = 'LoansForm';

export default LoansForm;
