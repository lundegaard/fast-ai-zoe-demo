import React, { Fragment, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Flex, Gauge, Heading, Modal, Text } from '@fast-ai/ui-components';
import { FormattedMessage } from 'gatsby-theme-fast-ai';
import { compose, map, path, prop, toPairs } from 'ramda';
import { isArray, noop } from 'ramda-extension';

import { Features, Models, fetchPredictionsAndFeatures } from '../predictions';
import m from '../intl/messages';

export const ClosingReasons = {
	CLICK_ON_TRY_AGAIN: 'CLICK_ON_TRY_AGAIN',
};

const selectResults = ({ models, features }) => ({
	models: compose(
		map(([modelId, value]) => ({ modelId, value })),
		toPairs,
		map(prop('predictionProbability'))
	)(models),
	features: compose(
		map(([featureId, value]) => ({ featureId, value })),
		toPairs
	)(features),
});

const OptionalFormattedMessage = ({ id, messages }) =>
	path([id, 'id'], messages) ? <FormattedMessage {...messages[id]} /> : id;

OptionalFormattedMessage.propTypes = {
	id: PropTypes.node,
	messages: PropTypes.object,
};

const ResultGauge = ({ value, title, ...rest }) => (
	<Flex flexDirection="column" justifyContent="center" {...rest}>
		<Gauge value={value == null ? 0 : value} mb={-4} />
		<Heading as="h4" sx={{ whiteSpace: 'nowrap' }}>
			{title}
		</Heading>
	</Flex>
);

ResultGauge.propTypes = {
	title: PropTypes.node,
	value: PropTypes.number,
};

const PredictionsModal = ({ applicationId, onClose = noop, closeModal, ...rest }) => {
	const [results, setResults] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	const { features = [], models = [] } = results || {};

	const refetchData = useCallback(async () => {
		try {
			const currentPredictions = await fetchPredictionsAndFeatures(
				applicationId,
				[Models.DEFAULT],
				[Features.BEHAVIOUR_LYING_INDEX, Features.BEHAVIOUR_SUSPICIOUS]
			);

			setResults(selectResults(currentPredictions));
		} catch (error) {
			setResults(null);
		} finally {
			setIsLoading(false);
		}
	}, [applicationId]);

	useEffect(() => {
		refetchData();
	}, [refetchData]);

	return (
		<Modal sx={{ textAlign: 'center', p: 4 }} {...rest}>
			<Heading as="h2" mt={1}>
				<FormattedMessage {...m.predictionsModalHeading} />
			</Heading>

			<Text fontSize={4}>
				<FormattedMessage {...m.predictionsModalDescription} />
			</Text>

			<Box m={4}>
				{isLoading ? (
					<FormattedMessage {...m.loadingPredictions} />
				) : (
					<Fragment>
						<Flex justifyContent="center" flexWrap="wrap">
							{isArray(models) &&
								models.map(({ modelId, value }) => (
									<ResultGauge
										id={modelId}
										value={value}
										key={modelId}
										title={<OptionalFormattedMessage messages={m} id={`modelTitle__${modelId}`} />}
										m={3}
									/>
								))}
							{isArray(features) &&
								features.map(({ featureId, value }) => (
									<ResultGauge
										key={featureId}
										id={featureId}
										value={value}
										title={
											<OptionalFormattedMessage messages={m} id={`featureTitle__${featureId}`} />
										}
										m={3}
									/>
								))}
						</Flex>
					</Fragment>
				)}
			</Box>

			<Button
				variant="secondary"
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
