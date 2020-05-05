import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Flex, Heading, Link, Text, useModal } from '@fast-ai/ui-components';
import { FormattedMessage } from 'gatsby-theme-fast-ai';

import m from '../intl/messages';
import { AmountFormatter, DurationFormatter } from '../formatters';
import TermsModal from '../containers/TermsModal';

import { CheckboxField, FullCol, SliderField } from './forms';

const LoanFormSection = ({ monthlyFee }) => {
	const { openModal: openTermsModal } = useModal({ component: TermsModal });

	return (
		<Fragment>
			<FullCol>
				<SliderField
					label={<FormattedMessage {...m.loanInfoAmount} />}
					renderValue={AmountFormatter}
					field="loanInfo.amount"
					min={20000}
					max={1000000}
					step={10000}
				/>
			</FullCol>
			<FullCol>
				<SliderField
					label={<FormattedMessage {...m.numberOfInstalments} />}
					field="loanInfo.numberOfInstalments"
					renderValue={DurationFormatter}
					min={6}
					max={120}
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
									a: (...children) => (
										<Link
											href="#"
											onClick={(event) => {
												event.preventDefault();
												openTermsModal();
											}}
											children={children}
										/>
									),
								}}
							/>
						</Text>
					}
					field="terms"
				/>
			</FullCol>
		</Fragment>
	);
};

LoanFormSection.propTypes = {
	coborrowerChoice: PropTypes.string,
	monthlyFee: PropTypes.node,
};
export default LoanFormSection;
