import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Flex, Heading, Link, Text } from '@fast-ai/ui-components';
import { FormattedMessage } from 'gatsby-theme-fast-ai';

import m from '../intl/messages';
import { AmountFormatter, DurationFormatter } from '../formatters';

import { CheckboxField, FullCol, SliderField } from './forms';

const LoanFormSection = ({ monthlyFee }) => (
	<Fragment>
		<FullCol>
			<SliderField
				label={<FormattedMessage {...m.loanInfoAmount} />}
				field="loanInfo.amount"
				renderValue={AmountFormatter}
				min={0}
				max={10000000}
				step={1}
			/>
		</FullCol>
		<FullCol>
			<SliderField
				label={<FormattedMessage {...m.numberOfInstalments} />}
				field="loanInfo.numberOfInstalments"
				renderValue={DurationFormatter}
				min={1}
				max={360}
				step={1}
			/>
		</FullCol>

		<FullCol>
			<Flex justifyContent="space-between" alignItems="center">
				<Heading as="div" mb={0} mt={0}>
					<FormattedMessage {...m.totalAmountPerMonth} />
				</Heading>
				<Heading as="h2" mb={0} mt={0}>
					<AmountFormatter>{monthlyFee}</AmountFormatter>
				</Heading>
			</Flex>
		</FullCol>

		<FullCol>
			<CheckboxField
				label={
					<Text fontSize={[1, 1, 1, 2]} p={0} m={0}>
						<FormattedMessage
							{...m.terms}
							values={{
								// eslint-disable-next-line react/display-name
								a: (...children) => <Link href="#" children={children} />,
							}}
						/>
					</Text>
				}
				field="terms"
			/>
		</FullCol>
	</Fragment>
);

LoanFormSection.propTypes = {
	coborrowerChoice: PropTypes.string,
	monthlyFee: PropTypes.node,
};
export default LoanFormSection;
