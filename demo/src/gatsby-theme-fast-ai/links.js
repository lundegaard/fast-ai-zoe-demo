import React from 'react';
import { FormattedMessage } from 'gatsby-theme-fast-ai';

import m from '../intl/messages';

export const links = [
	{ label: <FormattedMessage {...m.pageLoans} />, to: '/loans' },
	{ label: <FormattedMessage {...m.pageInsurance} />, to: '/insurance' },
	{ label: <FormattedMessage {...m.pageFaq} />, to: '/faq' },
];
