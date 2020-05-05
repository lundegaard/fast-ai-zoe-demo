import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useSafeState from '@restart/hooks/useSafeState';
import PropTypes from 'prop-types';
import { Box, Button, Flex, Gauge, Heading, Modal, Text } from '@fast-ai/ui-components';
import { FormattedMessage, useIntl } from 'gatsby-theme-fast-ai';
import { compose, map, prop, toPairs } from 'ramda';
import { isArray, keyMirror, noop } from 'ramda-extension';

import { Features, Models, fetchPredictionsAndFeatures } from '../predictions';
import { OptionalFormattedMessage } from '../components';
import m from '../intl/messages';

export const ClosingReasons = keyMirror({
	CLICK_ON_TRY_AGAIN: null,
	ERROR: null,
});

const Statuses = keyMirror({
	EMPTY: null,
	LOADING_INTERMEDIATE_RESULTS: null,
	INTERMEDIATE_RESULTS_LOADED: null,
	LOADING_RESULTS: null,
	RESULTS_LOADED: null,
});

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

const ResultGauge = ({ value, title, loading, ...rest }) => {
	const { formatNumber } = useIntl();

	const formatGaugeNumber = (x) => formatNumber(x, { maximumFractionDigits: 1 });
	return (
		<Flex
			flexDirection="column"
			justifyContent="center"
			sx={{ opacity: loading ? 0.25 : 1 }}
			{...rest}
		>
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
	loading: PropTypes.bool,
	title: PropTypes.node,
	value: PropTypes.number,
};

/*
EMPTY
-> LOADING_INTERMEDIATE_RESULTS
	-> LOADED_INTERMEDIATE RESULTS
	| -> LOADED_INTERMEDIATE_RESULTS
	| 	-> LOADING_RESULTS
	| 		->  LOADED_RESULTS
	|-----|--> ERROR
*/
const sleep = (ms) =>
	new Promise((resolve) => {
		setTimeout(resolve, ms);
	});

const PredictionsModal = ({ applicationId, onClose = noop, closeModal, ...rest }) => {
	const [status, setStatus] = useSafeState(useState(Statuses.EMPTY));
	const [results, setResults] = useSafeState(useState(null));

	const { features = [], models = [] } = results || {};

	const refetchData = useCallback(async () => {
		try {
			const makeFetch = () =>
				fetchPredictionsAndFeatures({
					applicationId,
					models: [Models.DEFAULT],
					features: [Features.BEHAVIOUR_LYING_INDEX, Features.BEHAVIOUR_SUSPICIOUS],
				});

			setStatus(Statuses.LOADING_INTERMEDIATE_RESULTS);

			const intermediateResults = await makeFetch();

			setStatus(Statuses.INTERMEDIATE_RESULTS_LOADED);
			setResults(selectResults(intermediateResults));

			await sleep(4000);

			setStatus(Statuses.LOADING_RESULTS);

			const finalPredictions = await makeFetch();

			setStatus(Statuses.RESULTS_LOADED);
			setResults(selectResults(finalPredictions));
		} catch (error) {
			setStatus(Statuses.ERROR);
			setResults(null);
		}
	}, [applicationId]);

	useEffect(() => void refetchData(), [refetchData]);

	const inErrorState = status === Statuses.ERROR;

	const description = (
		<Text fontSize={4}>
			<FormattedMessage {...m.predictionsModalDescription} />
		</Text>
	);

	const getContent = () => {
		if (status === Statuses.EMPTY) {
			return <FormattedMessage {...m.loadingPredictions} />;
		}

		if (inErrorState) {
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
							loading={status !== Statuses.RESULTS_LOADED}
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
							loading={status !== Statuses.RESULTS_LOADED}
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

			{!inErrorState && description}

			<Box m={4}>{getContent()}</Box>

			{!inErrorState ? (
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
