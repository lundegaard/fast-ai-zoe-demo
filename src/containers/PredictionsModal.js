import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useSafeState from '@restart/hooks/useSafeState';
import PropTypes from 'prop-types';
import { Box, Button, Flex, Gauge, Heading, Modal, Text } from '@fast-ai/ui-components';
import { FormattedMessage, useIntl } from 'gatsby-theme-fast-ai';
import {
	applySpec,
	clamp,
	compose,
	find,
	map,
	o,
	prop,
	replace,
	toPairs,
	values,
	whereEq,
} from 'ramda';
import { flipIncludes, isArray, keyMirror, noop } from 'ramda-extension';
import { keyframes } from '@emotion/core';

import { Features, Models, StatTypes, fetchPredictionsAndFeatures } from '../predictions';
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

const inEmptyState = flipIncludes([Statuses.EMPTY, Statuses.LOADING_INTERMEDIATE_RESULTS]);

const easing = 'cubic-bezier(.455, .030, .515, .955)';
const loadingDataAnimation = keyframes`
	0% {
		opacity: 0.25;
	}
	100% {
		opacity: 0.75;
	}
}
`;

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

const getGaugeLookupProps = (lookup) => (value) => o(find(whereEq({ value })), values)(lookup);

const makeGaugeProps = applySpec({
	max: prop('max'),
	min: prop('min'),
	numberStyle: prop('numberStyle'),
	variant: o((x) => (x === StatTypes.NEGATIVE ? 'danger' : ''), prop('type')),
});

const getModelGaugeProps = compose(makeGaugeProps, getGaugeLookupProps(Models));
const getFeatureGaugeProps = compose(makeGaugeProps, getGaugeLookupProps(Features));

const ResultGauge = ({
	value,
	numberStyle,
	title,
	loading,
	variant,
	min = 0,
	max = 1,
	...rest
}) => {
	const { formatNumber } = useIntl();

	const formatNumberValue = (x) =>
		formatNumber(x, {
			style: numberStyle,
			maximumFractionDigits: 1,
		});

	const formatGaugeValue = formatNumberValue;
	const formatGaugeLegend = compose(replace('%', ''), formatNumberValue);

	return (
		<Flex
			flexDirection="column"
			justifyContent="center"
			sx={
				loading
					? {
							animationName: loadingDataAnimation,
							animationDuration: '1s',
							animationTimingFunction: easing,
							animationFillMode: 'both',
							animationIterationCount: 'infinite',
							animationDirection: 'alternate',
					  }
					: {
							opacity: 1,
					  }
			}
			{...rest}
		>
			<Gauge
				format={formatGaugeValue}
				formatLegend={formatGaugeLegend}
				value={value == null ? 0 : clamp(min, max)(value)}
				variant={variant}
				min={min}
				max={max}
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
	max: PropTypes.number,
	min: PropTypes.number,
	numberStyle: PropTypes.string,
	title: PropTypes.node,
	value: PropTypes.number,
	variant: PropTypes.string,
};

const sleep = (ms) =>
	new Promise((resolve) => {
		setTimeout(resolve, ms);
	});

/**
 * States:
 *
 * EMPTY
 * -> LOADING_INTERMEDIATE_RESULTS
 *	-> LOADED_INTERMEDIATE RESULTS
 *	| -> LOADING_RESULTS
 *	| 	->  LOADED_RESULTS
 *	|---|--> ERROR
 */
const PredictionsModal = ({ applicationId, onClose = noop, closeModal, ...rest }) => {
	const [status, setStatus] = useSafeState(useState(Statuses.EMPTY));
	const [results, setResults] = useSafeState(useState(null));

	const { features = [], models = [] } = results || {};

	const refetchData = useCallback(async () => {
		try {
			const makeFetch = () =>
				fetchPredictionsAndFeatures({
					applicationId,
					models: [Models.DEFAULT.value],
					features: [Features.LYING_BEHAVIOR_SCORE.value, Features.FRAUD_SCORE.value],
				});

			setStatus(Statuses.LOADING_INTERMEDIATE_RESULTS);

			const intermediateResults = await makeFetch();

			setStatus(Statuses.INTERMEDIATE_RESULTS_LOADED);
			setResults(selectResults(intermediateResults));

			await sleep(5000);

			setStatus(Statuses.LOADING_RESULTS);

			const finalPredictions = await makeFetch();

			setStatus(Statuses.RESULTS_LOADED);
			setResults(selectResults(finalPredictions));
		} catch (error) {
			console.error(error);
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
		if (inErrorState) {
			return (
				<Text fontWeight="bold" fontSize={4}>
					<FormattedMessage {...m.unexpectedError} />
				</Text>
			);
		}

		if (inEmptyState(status)) {
			return (
				<Fragment>
					<FormattedMessage {...m.loadingPredictions} />

					<Flex justifyContent="center" flexWrap="wrap">
						{[0, 1, 2].map((i) => (
							<ResultGauge key={i} loading id={`loading-${i}`} value={0} title="..." m={3} />
						))}
					</Flex>
				</Fragment>
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
							{...getModelGaugeProps(modelId)}
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
							{...getFeatureGaugeProps(featureId)}
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
