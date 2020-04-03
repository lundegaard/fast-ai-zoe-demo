import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Heading, Modal } from '@fast-ai/ui-components';
import { FormattedMessage } from 'gatsby-theme-fast-ai';
import { noop } from 'ramda-extension';

import { fetchPredictionsAndFeatures } from '../sa';
import m from '../intl/messages';

export const ClosingReasons = {
	CLICK_ON_TRY_AGAIN: 'CLICK_ON_TRY_AGAIN',
};

const PredictionsModal = ({ applicationId, onClose = noop, closeModal, ...rest }) => {
	const [predictions, setPredictions] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		const execute = async () => {
			try {
				const currentPredictions = await fetchPredictionsAndFeatures(applicationId);

				setPredictions(currentPredictions);
			} catch (error) {
				setPredictions(null);
			} finally {
				setIsLoading(false);
			}
		};
		execute();
	}, [applicationId]);

	return (
		<Modal sx={{ textAlign: 'center', p: 4 }} {...rest}>
			<Heading as="h2" mt={1}>
				<FormattedMessage {...m.predictionsModalHeading} />
			</Heading>
			{isLoading ? (
				<FormattedMessage {...m.loadingPredictions} />
			) : (
				<pre>{JSON.stringify(predictions, null, 2)}</pre>
			)}
			<Button
				onClick={() => {
					onClose({ reason: ClosingReasons.CLICK_ON_TRY_AGAIN });
					closeModal();
				}}
			>
				<FormattedMessage {...m.tryAgainLabel} />
			</Button>
		</Modal>
	);
};
PredictionsModal.propTypes = {
	applicationId: PropTypes.string,
	closeModal: PropTypes.func,
	onClose: PropTypes.func,
};

export default PredictionsModal;
