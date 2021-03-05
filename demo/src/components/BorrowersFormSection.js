import React, { Fragment, memo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'gatsby-theme-fast-ai';
import { Radio } from '@fast-ai/ui-components';

import m from '../intl/messages';
import { CoborrowerChoice, mapLookup } from '../lookups';

import { FormSubheading, FullCol, RadioGroupField } from './forms';
import PersonFormSection, { PersonLabelsType } from './PersonFormSection';

const coborrowerChoiceLegend = <FormattedMessage {...m.coborrowerChoice} />;
const coborrowerChoices = mapLookup((value) => (
	<Radio
		key={value}
		value={value}
		label={<FormattedMessage {...m[`${CoborrowerChoice.name}_${value}`]} />}
	/>
))(CoborrowerChoice);

const BorrowersFormSection = ({ coborrowerChoice, personLabels }) => (
	<Fragment>
		<PersonFormSection fieldPrefix="borrower" labels={personLabels} />

		<FullCol>
			<RadioGroupField
				legend={coborrowerChoiceLegend}
				field="webdata.coborrowerChoice"
			>
				{coborrowerChoices}
			</RadioGroupField>
		</FullCol>

		{CoborrowerChoice.values.NON_SINGLE === coborrowerChoice && (
			<Fragment>
				<FullCol>
					<FormSubheading>
						<FormattedMessage {...m.coborrowerTitle} />
					</FormSubheading>
				</FullCol>

				<PersonFormSection fieldPrefix="coborrower" labels={personLabels} />
			</Fragment>
		)}
	</Fragment>
);

BorrowersFormSection.propTypes = {
	coborrowerChoice: PropTypes.string,
	personLabels: PersonLabelsType.isRequired,
};

export default memo(BorrowersFormSection);
