import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDebounce, useIdleTime, useModal } from '@fast-ai/ui-components';
import { useInterval } from '@restart/hooks';
import createRandomString from 'crypto-random-string';

import Forms from '../constants/Forms';
import { fetchFeatures, logFeatures } from '../predictions';
import { useTimeout } from '../hooks';
import { DemoForm as DemoFormUi, useDevConsole, useForm } from '../components';

import PredictionsModal, {
	ClosingReasons as PredictionsModalClosingReasons,
} from './PredictionsModal';

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
	const { openModal: openPredictionsModal } = useModal({
		component: PredictionsModal,
	});
	const [applicationId, setApplicationId] = useState(getApplicationId());
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
		name: Forms.ZOE_DEMO,
		onSubmit: async (values) => {
			send({ data: values, applicationId });

			openPredictionsModal({
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

		setStatsReady(false);

		register(applicationId);

		devConsole.replace({
			'Application ID': applicationId,
			'Tenant ID': process.env.TENANT_ID,
		});
	}, [applicationId]);

	const sendValues = useCallback(
		() => isValid && send({ data: values, inProgress: true, applicationId }),
		[isValid, applicationId, values, send]
	);

	const handleFormBlur = useCallback(() => statsReady && sendValues(), [
		statsReady,
		sendValues,
	]);

	useTimeout(
		() => {
			setStatsReady(true);
			sendValues();
		},
		4000,
		[applicationId]
	);

	const { isIdle } = useIdleTime();

	useInterval(
		() => {
			if (document.hidden || isIdle || !statsReady) {
				return;
			}

			fetchFeatures({ applicationId }).then(
				(features) => void devConsole.log(logFeatures(features))
			);
		},
		loggingInterval,
		false, // is paused
		true // run immediately
	);

	const monthlyFee =
		getFieldValue('loanInfo.amount') /
		getFieldValue('loanInfo.numberOfInstalments');

	const [monthlyFeeDebounced] = useDebounce(monthlyFee, 200);
	const coborrowerChoice = getFieldValue('webdata.coborrowerChoice');

	return (
		<Form onBlur={handleFormBlur}>
			<DemoFormUi
				handleClickSubmit={handleClickSubmit}
				coborrowerChoice={coborrowerChoice}
				canSubmit={canSubmit}
				isSubmitting={isSubmitting}
				monthlyFee={monthlyFeeDebounced}
			/>
		</Form>
	);
};

// handleFormBlur={handleFormBlur}
DemoForm.propTypes = { loggingInterval: PropTypes.number };

export default DemoForm;
