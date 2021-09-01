import React from 'react';
import { Page, Seo } from 'gatsby-theme-fast-ai';
import { ModalProvider, ModalRoot } from '@fast-ai/ui-components';

import DemoForm from '../containers/DemoForm';
import LoansForm from '../components/LoansForm';
import Forms from '../constants/Forms';

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
const Loans = () => (
	<ModalProvider>
		<Page>
			<Seo title="Zoe.ai for Loans" />
			<DemoForm
				name={Forms.LOANS}
				renderForm={LoansForm}
				defaultValues={defaultValues}
			/>
			<ModalRoot />
		</Page>
	</ModalProvider>
);

export default Loans;
