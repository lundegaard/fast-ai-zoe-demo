import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Flex, Heading, Link, Radio, Text } from '@fast-ai/ui-components';
import { FormattedMessage } from 'gatsby-theme-fast-ai';

import m from '../intl/messages';
import { CoborrowerChoice } from '../lookups';
import { AmountFormatter, DurationFormatter } from '../formatters';

import { CheckboxField, FullCol, RadioGroupField, SliderField } from './forms';

const LoanInfo = ({ monthlyFee }) => (
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
			<RadioGroupField
				legend={<FormattedMessage {...m.coborrowerChoice} />}
				field="webdata.coborrowerChoice"
			>
				{CoborrowerChoice.values.map((value) => (
					<Radio
						key={value}
						value={value}
						label={<FormattedMessage {...m[`${CoborrowerChoice.name}_${value}`]} />}
					/>
				))}
			</RadioGroupField>
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

LoanInfo.propTypes = {
	monthlyFee: PropTypes.node,
};
export default LoanInfo;
