import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'gatsby-theme-fast-ai';
import { Radio } from '@fast-ai/ui-components';

import m from '../intl/messages';
import { CoborrowerChoice, mapLookup } from '../lookups';

import { FormSubheading, FullCol, RadioGroupField } from './forms';
import PersonFormSection from './PersonFormSection';

const BorrowersFormSection = ({ coborrowerChoice }) => (
	<Fragment>
		<PersonFormSection fieldPrefix="borrower" />
		<FullCol>
			<RadioGroupField
				legend={<FormattedMessage {...m.coborrowerChoice} />}
				field="webdata.coborrowerChoice"
			>
				{mapLookup((value) => (
					<Radio
						key={value}
						value={value}
						label={<FormattedMessage {...m[`${CoborrowerChoice.name}_${value}`]} />}
					/>
				))(CoborrowerChoice)}
			</RadioGroupField>
		</FullCol>

		{CoborrowerChoice.values.NON_SINGLE === coborrowerChoice && (
			<Fragment>
				<FullCol>
					<FormSubheading>
						<FormattedMessage {...m.coborrowerTitle} />
					</FormSubheading>
				</FullCol>

				<PersonFormSection fieldPrefix="coborrower" />
			</Fragment>
		)}
	</Fragment>
);

BorrowersFormSection.propTypes = { coborrowerChoice: PropTypes.string };

export default BorrowersFormSection;
