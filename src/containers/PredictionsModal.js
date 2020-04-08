import React, { Fragment, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Flex, Gauge, Heading, Modal, Text } from '@fast-ai/ui-components';
import { FormattedMessage, useIntl } from 'gatsby-theme-fast-ai';
import { compose, map, prop, toPairs } from 'ramda';
import { isArray, noop } from 'ramda-extension';

import { Features, Models, fetchPredictionsAndFeatures } from '../predictions';
import { OptionalFormattedMessage } from '../components';
import m from '../intl/messages';

export const ClosingReasons = {
	CLICK_ON_TRY_AGAIN: 'CLICK_ON_TRY_AGAIN',
	ERROR: 'ERROR',
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

const ResultGauge = ({ value, title, ...rest }) => {
	const { formatNumber } = useIntl();

	const formatGaugeNumber = (x) => formatNumber(x, { maximumFractionDigits: 1 });
	return (
		<Flex flexDirection="column" justifyContent="center" {...rest}>
			{' '}
			<Gauge
				format={(x) => `${formatGaugeNumber(x * 100)}%`}
				formatLegend={(x) => formatGaugeNumber(x * 100)}
				value={value == null ? 0 : value}
				mb={-4}
			/>
			<Text fontSize={4} m={0} sx={{ whiteSpace: 'nowrap' }}>
				{title}
			</Text>
		</Flex>
	);
};

ResultGauge.propTypes = {
	title: PropTypes.node,
	value: PropTypes.number,
};

const PredictionsModal = ({ applicationId, onClose = noop, closeModal, ...rest }) => {
	const [results, setResults] = useState(null);
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	const { features = [], models = [] } = results || {};

	const refetchData = useCallback(async () => {
		try {
			const currentPredictions = await fetchPredictionsAndFeatures({
				applicationId,
				models: [Models.DEFAULT],
				features: [Features.BEHAVIOUR_LYING_INDEX, Features.BEHAVIOUR_SUSPICIOUS],
			});

			setResults(selectResults(currentPredictions));
		} catch (error) {
			setResults(null);
			setError(error);
		} finally {
			setIsLoading(false);
		}
	}, [applicationId]);

	useEffect(() => {
		refetchData();
	}, [refetchData]);

	const description = (
		<Text fontSize={4}>
			<FormattedMessage {...m.predictionsModalDescription} />
		</Text>
	);

	const getContent = () => {
		if (isLoading) {
			return <FormattedMessage {...m.loadingPredictions} />;
		}

		if (error) {
			return (
				<Text fontWeight="bold" fontSize={4}>
					<FormattedMessage {...m.unexpectedError} />
				</Text>
			);
		}

		return (
			<Flex justifyContent="center" flexWrap="wrap">
				{isArray(models) &&
					models.map(({ modelId, value }) => (
						<ResultGauge
							key={modelId}
							id={modelId}
							value={value}
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
							title={<OptionalFormattedMessage messages={m} id={`featureTitle__${featureId}`} />}
							m={3}
						/>
					))}
			</Flex>
		);
	};

	return (
		<Modal sx={{ textAlign: 'center', p: 4 }} {...rest}>
			<Heading as="h2" mt={1}>
				<FormattedMessage {...m.predictionsModalHeading} />
			</Heading>

			{!error && description}

			<Box m={4}>{getContent()}</Box>

			{!error ? (
				<Button
					variant="secondary"
					onClick={() => {
						onClose({ reason: ClosingReasons.CLICK_ON_TRY_AGAIN });
						closeModal();
					}}
				>
					<FormattedMessage {...m.tryAgainLabel} />
				</Button>
			) : (
				<Fragment>
					<Button variant="primary" onClick={() => refetchData()}>
						<FormattedMessage {...m.retry} />
					</Button>
					<Text as="span" mx={1} />
					<Button
						variant="primary"
						onClick={() => {
							onClose({ reason: ClosingReasons.ERROR });
							closeModal();
						}}
					>
						<FormattedMessage {...m.close} />
					</Button>
				</Fragment>
			)}
		</Modal>
	);
};

PredictionsModal.propTypes = {
	applicationId: PropTypes.string,
	closeModal: PropTypes.func,
	onClose: PropTypes.func,
};

export default PredictionsModal;
