import React from 'react';
import { Page, Seo } from 'gatsby-theme-fast-ai';
import { ModalProvider, ModalRoot } from '@fast-ai/ui-components';

import DemoForm from '../containers/DemoForm';

const Index = () => (
	<ModalProvider>
		<Page>
			<Seo title="Demo" />
			<DemoForm />
			<ModalRoot />
		</Page>
	</ModalProvider>
);

export default Index;
