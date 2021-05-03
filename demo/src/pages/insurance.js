import React from 'react';
import { Page, Seo } from 'gatsby-theme-fast-ai';
import { ModalProvider, ModalRoot } from '@fast-ai/ui-components';

import Forms from '../constants/Forms';
import DemoForm from '../containers/DemoForm';
import InsuranceForm from '../components/InsuranceForm';

const borrower = {
	givenName: '',
	familyName: '',
	educationLevel: '',
	maritalStatus: '',
	birthNumber: '',
	email: '',
	phoneNumber: '',
	balance: {
		netIncomeMain: '',
		expenditureAnotherInstallment: '',
	},
	address: {
		streetAddress: '',
		addressLocality: '',
		postalCode: '',
	},
};

const defaultValues = {
	webdata: { coborrowerChoice: 'SINGLE' },
	loanInfo: {
		numberOfInstallments: 12,
		amount: 100000,
	},
	borrower,
	coborrower: borrower,
};

const Insurance = () => (
	<ModalProvider>
		<Page>
			<Seo title="Zoe.ai for Insurance" />
			<DemoForm
				name={Forms.INSURANCE}
				renderForm={InsuranceForm}
				defaultValues={defaultValues}
			/>
			<ModalRoot />
		</Page>
	</ModalProvider>
);

export default Insurance;
