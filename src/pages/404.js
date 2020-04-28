import React from 'react';
import { Text } from '@fast-ai/ui-components';
import { FormattedMessage, Page, Seo, useIntl } from 'gatsby-theme-fast-ai';

import m from '../intl/messages';

const ErrorPage = () => {
	const intl = useIntl();

	return (
		<Page>
			<Seo title={intl.formatMessage(m.errorPageTitle)} />
			<Text>
				<FormattedMessage {...m.errorPageContent} />
			</Text>
		</Page>
	);
};

export default ErrorPage;
