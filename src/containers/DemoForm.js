import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
	Button,
	Col,
	Heading,
	Row,
	useDebounce,
	useIdleTime,
	useModal,
} from '@fast-ai/ui-components';
import { useInterval } from '@restart/hooks';
import { FormattedMessage } from 'gatsby-theme-fast-ai';
import createRandomString from 'crypto-random-string';

import { fetchFeatures, logFeatures } from '../predictions';
import m from '../intl/messages';
import { FullCol, LoanInfo, PersonalInfo, useDevConsole, useForm } from '../components';

import PredictionsModal, {
	ClosingReasons as PredictionsModalClosingReasons,
} from './PredictionsModal';

const FormHeading = (props) => <Heading as="h2" mt={0} mb={4} {...props} />;

const borrower = {
	givenName: '',
	familyName: '',
	education: '',
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
		streetLocality: '',
		postalCode: '',
	},
};

const defaultValues = {
	webdata: { coborrowerChoice: 'SINGLE' },
	loanInfo: {
		numberOfInstalments: 12,
		amount: 100000,
	},
	borrower,
	coborrower: borrower,
};

const getApplicationId = () =>
	`demo-${createRandomString({ length: 10, type: 'distinguishable' })}`;

const DemoForm = ({ loggingInterval = 2000 }) => {
	const { openModal } = useModal({ component: PredictionsModal });
	const [applicationId, setApplicationId] = useState(getApplicationId());
	const initTimeoutRef = useRef();
	const [statsReady, setStatsReady] = useState(false);

	const {
		Form,
		meta: { isSubmitting, canSubmit, isValid },
		getFieldValue,
		attemptSubmit: handleClickSubmit,
		send,
		register,
		reset,
		values,
	} = useForm({
		defaultValues,
		name: 'zoeDemo',
		onSubmit: async (values) => {
			send({ data: values, applicationId });

			openModal({
				applicationId,
				onClose: ({ reason }) => {
					if (reason === PredictionsModalClosingReasons.CLICK_ON_TRY_AGAIN) {
						reset();
						setApplicationId(getApplicationId());
					}
				},
			});
		},
	});

	const devConsole = useDevConsole();

	useEffect(() => {
		if (!applicationId) {
			return;
		}

		register(applicationId);

		devConsole.replace({ 'Application ID': applicationId, 'Tenant ID': process.env.TENANT_ID });

		clearTimeout(initTimeoutRef.current);

		const newTimeout = setTimeout(() => setStatsReady(true), 4000);

		clearTimeout.current = newTimeout;

		setStatsReady(false);
		return () => clearTimeout(newTimeout);
	}, [applicationId]);

	const { isIdle } = useIdleTime();

	useInterval(
		() => {
			if (document.hidden || isIdle || !statsReady) {
				return;
			}

			fetchFeatures(applicationId).then((features) => void devConsole.log(logFeatures(features)));
		},
		loggingInterval,
		false, // is paused
		true // run immediately
	);

	useEffect(() => {
		if (isValid && statsReady) {
			send({ data: values, inProgress: true, applicationId });
		}
	}, [values, applicationId, isValid, statsReady, send]);

	const monthlyFee =
		getFieldValue('loanInfo.amount') / getFieldValue('loanInfo.numberOfInstalments');

	const [monthlyFeeDebounced] = useDebounce(monthlyFee, 200);

	return (
		<Form>
			<Row flexWrap="wrap">
				<Col span={[12, 12, 6]}>
					<Row flexWrap="wrap">
						<FullCol>
							<FormHeading>
								<FormattedMessage {...m.personalInfoTitle} />
							</FormHeading>
						</FullCol>

						<PersonalInfo fieldPrefix="borrower" />
					</Row>
				</Col>
				<Col span={[12, 12, 6]}>
					<Row flexWrap="wrap">
						<FullCol>
							<FormHeading>
								<FormattedMessage {...m.setupLoanTitle} />
							</FormHeading>
						</FullCol>

						<LoanInfo monthlyFee={monthlyFeeDebounced} />

						<FullCol>
							<Button
								onClick={handleClickSubmit}
								variant="secondary"
								width={1}
								disabled={!canSubmit || isSubmitting}
							>
								<FormattedMessage {...m.apply} />
							</Button>
						</FullCol>
					</Row>
				</Col>
			</Row>
		</Form>
	);
};

DemoForm.propTypes = { loggingInterval: PropTypes.number };

export default DemoForm;
