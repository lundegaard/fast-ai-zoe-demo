import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Flex, Heading, Link, Text, useModal } from '@fast-ai/ui-components';
import { FormattedMessage, useIntl } from 'gatsby-theme-fast-ai';

import m from '../intl/messages';
import { AmountFormatter, DurationFormatter } from '../formatters';
import TermsModal from '../containers/TermsModal';

import { CheckboxField, FullCol, SliderField } from './forms';

const SummarySection = ({ labels, monthlyFee, formName }) => {
	const { locale } = useIntl();

	const AmountFormatterIntl = useMemo(
		() => ({ children }) => (
			<AmountFormatter children={(locale === 'cs' ? 1 : 0.045) * children} />
		),
		[locale]
	);

	const { openModal: openTermsModal } = useModal({ component: TermsModal });
	const checkboxLabel = useMemo(
		() => (
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
									openTermsModal({ formName });
								}}
								children={children}
							/>
						),
					}}
				/>
			</Text>
		),
		[openTermsModal, formName]
	);

	return (
		<Fragment>
			<FullCol>
				<SliderField
					label={labels.amount}
					renderValue={AmountFormatterIntl}
					field="loanInfo.amount"
					min={20000}
					max={1000000}
					step={10000}
				/>
			</FullCol>
			<FullCol>
				<SliderField
					label={labels.numberOfInstalments}
					field="loanInfo.numberOfInstalments"
					renderValue={DurationFormatter}
					min={6}
					max={120}
					step={1}
				/>
			</FullCol>

			<FullCol>
				<Flex justifyContent="space-between" alignItems="center">
					<Heading variant="subHeading2" as="div" mb={0} mt={0}>
						{labels.total}
					</Heading>

					<Heading variant="subHeading2" as="h2" mb={0} mt={0}>
						<AmountFormatter>{monthlyFee}</AmountFormatter>
					</Heading>
				</Flex>
			</FullCol>

			<FullCol>
				<CheckboxField label={checkboxLabel} field="terms" />
			</FullCol>
		</Fragment>
	);
};

SummarySection.propTypes = {
	coborrowerChoice: PropTypes.string,
	formName: PropTypes.string,
	labels: PropTypes.shape({
		amount: PropTypes.node,
		numberOfInstalments: PropTypes.node,
		total: PropTypes.node,
	}),
	monthlyFee: PropTypes.node,
};
export default SummarySection;
