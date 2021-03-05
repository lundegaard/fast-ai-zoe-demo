import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import createRandomString from 'crypto-random-string';
import { useModal } from '@fast-ai/ui-components';
import { ZoeConsole } from '@fast-ai/zoe-console';
import { useEventCallback } from '@restart/hooks';

import { useForm } from '../components';
import { featuresDescriptor } from '../featuresDescriptor';

import PredictionsModal, {
	ClosingReasons as PredictionsModalClosingReasons,
} from './PredictionsModal';

const getApplicationId = () =>
	`demo-${createRandomString({ length: 10, type: 'distinguishable' })}`;

const DemoForm = ({ renderForm: FormComponent, defaultValues, name }) => {
	const { openModal: openPredictionsModal } = useModal({
		component: PredictionsModal,
	});
	const [applicationId, setApplicationId] = useState(getApplicationId());
	const [disableConsoleRefresh, setDisableConsoleRefresh] = useState(false);
	const {
		Form,
		meta: { isSubmitting, canSubmit, isValid },
		attemptSubmit: handleClickSubmit,
		send,
		register,
		getFieldValue,
		reset,
		values,
	} = useForm({
		defaultValues,
		name,
		onSubmit: async (values) => {
			setDisableConsoleRefresh(true);
			send({ data: values, applicationId });

			openPredictionsModal({
				applicationId,
				onClose: ({ reason }) => {
					if (reason === PredictionsModalClosingReasons.CLICK_ON_TRY_AGAIN) {
						reset();
						setApplicationId(getApplicationId());
						setDisableConsoleRefresh(false);
					}
				},
			});
		},
	});

	const sendValues = useEventCallback(
		() => isValid && send({ data: values, inProgress: true, applicationId })
	);

	useEffect(() => {
		if (applicationId) {
			register(applicationId);
			sendValues();
		}
	}, [applicationId, register, sendValues]);

	return (
		<Fragment>
			<Form onBlur={sendValues}>
				<FormComponent
					handleClickSubmit={handleClickSubmit}
					canSubmit={canSubmit}
					getFieldValue={getFieldValue}
					isSubmitting={isSubmitting}
				/>
			</Form>

			<ZoeConsole
				applicationId={applicationId}
				descriptor={featuresDescriptor}
				disableRefresh={disableConsoleRefresh}
			/>
		</Fragment>
	);
};

DemoForm.propTypes = {
	defaultValues: PropTypes.object,
	name: PropTypes.string.isRequired,
	renderForm: PropTypes.elementType.isRequired,
};

export default DemoForm;
