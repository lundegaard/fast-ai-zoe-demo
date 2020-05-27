import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Row } from '@fast-ai/ui-components';
import { FormattedMessage } from 'gatsby-theme-fast-ai';

import m from '../intl/messages';

import { BorrowersFormSection, FormHeading, FullCol, LoanFormSection } from '.';

// Passing shallow props to be able to memoize and increase the performance of the form
const DemoForm = memo(
	({
		component: Form,
		handleClickSubmit,
		monthlyFee,
		handleFormBlur,
		coborrowerChoice,
		canSubmit,
		isSubmitting,
	}) => (
		<Form onBlur={handleFormBlur}>
			<Row flexWrap="wrap">
				<Col span={[12, 12, 6]}>
					<Row flexWrap="wrap">
						<FullCol>
							<FormHeading>
								<FormattedMessage {...m.personalInfoTitle} />
							</FormHeading>
						</FullCol>

						<BorrowersFormSection coborrowerChoice={coborrowerChoice} />
					</Row>
				</Col>
				<Col span={[12, 12, 6]}>
					<Row flexWrap="wrap">
						<FullCol>
							<FormHeading>
								<FormattedMessage {...m.setupLoanTitle} />
							</FormHeading>
						</FullCol>

						<LoanFormSection monthlyFee={monthlyFee} />

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
		</Form>
	)
);
DemoForm.propTypes = {
	canSubmit: PropTypes.bool,
	coborrowerChoice: PropTypes.node,
	component: PropTypes.elementType,
	handleClickSubmit: PropTypes.func,
	handleFormBlur: PropTypes.func,
	isSubmitting: PropTypes.bool,
	monthlyFee: PropTypes.number,
};
DemoForm.displayName = 'DemoForm';
export default DemoForm;
