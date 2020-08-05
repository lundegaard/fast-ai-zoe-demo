import React from 'react';
import { Heading, Text } from '@fast-ai/ui-components';
import { FormattedMessage, Page, Seo } from 'gatsby-theme-fast-ai';

import m from '../intl/messages';

const Index = () => (
	<Page>
		<Seo title="FAQ" />

		<Heading>
			<FormattedMessage {...m.pageFaq} />
		</Heading>

		<Text>
			<FormattedMessage {...m.pageFaqPerex} />
		</Text>
	</Page>
);

export default Index;
