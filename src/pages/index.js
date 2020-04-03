import React from 'react';
import { Page, Seo } from 'gatsby-theme-fast-ai';
import { ModalProvider, ModalRoot } from '@fast-ai/ui-components';

import { DevConsole, DevConsoleProvider } from '../components';
import DemoForm from '../containers/DemoForm';

const Index = () => (
	<DevConsoleProvider>
		<ModalProvider>
			<Page>
				<Seo title="Demo" />
				<DemoForm />

				<DevConsole title="zoe@lundegaard.ai:~ smartfeatures$" />
				<ModalRoot />
			</Page>
		</ModalProvider>
	</DevConsoleProvider>
);

export default Index;
