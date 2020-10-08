import React, {
	Fragment,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';
import useSafeState from '@restart/hooks/useSafeState';
import PropTypes from 'prop-types';
import {
	Box,
	Button,
	Flex,
	Gauge,
	Heading,
	Modal,
	Text,
} from '@fast-ai/ui-components';
import { FormattedMessage, useIntl } from 'gatsby-theme-fast-ai';
import {
	applySpec,
	clamp,
	compose,
	head,
	map,
	prop,
	replace,
	sortBy,
	toPairs,
} from 'ramda';
import {
	flipIncludes,
	isArray,
	keyMirror,
	mapKeysAndValues,
	noop,
} from 'ramda-extension';
import { keyframes } from '@emotion/core';
import { zoeClient } from '@fast-ai/zoe-console';

import { Features, StatTypes } from '../predictions';
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
	RESULTS_LOADED: null,
});

const inEmptyState = flipIncludes([
	Statuses.EMPTY,
	Statuses.LOADING_INTERMEDIATE_RESULTS,
]);

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

const selectResults = (features) => ({
	features: compose(
		map(([id, value]) => ({ id, value })),
		sortBy(head),
		toPairs
	)(features),
});

const getGaugeLookupProps = (lookup) => {
	const byValue = mapKeysAndValues(([, x]) => [x.value, x], lookup);

	return (value) => byValue[value];
};

const makeGaugeProps = applySpec({
	max: prop('max'),
	min: prop('min'),
	numberStyle: prop('numberStyle'),
	variant: ({ type }) => (type === StatTypes.NEGATIVE ? 'danger' : ''),
});

const getFeatureGaugeProps = compose(
	makeGaugeProps,
	getGaugeLookupProps(Features)
);
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

/**
 * State chart:
 *
 * ```
 * EMPTY
 * |-> LOADING_INTERMEDIATE_RESULTS
 * | |-> LOADED_INTERMEDIATE RESULTS
 * |   |-> ERROR
 * |
 * |->  LOADED_RESULTS
 * | |-> ERROR
 * |
 * |-> ERROR
 * ```
 */
const PredictionsModal = ({
	applicationId,
	onClose = noop,
	closeModal,
	...rest
}) => {
	const [status, setStatus] = useSafeState(useState(Statuses.EMPTY));
	const [results, setResults] = useSafeState(useState(null));
	const statusRef = useRef(status);

	statusRef.current = status;

	const { features = [] } = results || {};

	const refetchData = useCallback(async () => {
		try {
			const makeFetch = (props) =>
				zoeClient.fetchFeatures({
					features: [
						Features.LYING_BEHAVIOR_SCORE.value,
						Features.FRAUD_SCORE.value,
						Features.LOAN_APPROVAL.value,
					],
					...props,
				});

			setStatus(Statuses.LOADING_INTERMEDIATE_RESULTS);

			const loadIntermediate = makeFetch({ forTime: null }).then(
				(intermediateResults) => {
					if (statusRef.current !== Statuses.RESULTS_LOADED) {
						setStatus(Statuses.INTERMEDIATE_RESULTS_LOADED);
						setResults(selectResults(intermediateResults));
					}
				}
			);
			const loadFinal = await makeFetch({ timeout: 5000 }).then(
				(finalPredictions) => {
					setStatus(Statuses.RESULTS_LOADED);
					setResults(selectResults(finalPredictions));
				}
			);

			await Promise.all([loadIntermediate, loadFinal]);
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
							<ResultGauge
								key={i}
								loading
								id={`loading-${i}`}
								value={0}
								title="..."
								m={3}
							/>
						))}
					</Flex>
				</Fragment>
			);
		}

		return (
			<Flex justifyContent="center" flexWrap="wrap">
				{isArray(features) &&
					features.map(({ id, value }) => (
						<ResultGauge
							loading={status !== Statuses.RESULTS_LOADED}
							key={id}
							id={id}
							value={value}
							title={
								<OptionalFormattedMessage
									messages={m}
									id={`featureTitle__${id}`}
								/>
							}
							m={3}
							{...getFeatureGaugeProps(id)}
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
