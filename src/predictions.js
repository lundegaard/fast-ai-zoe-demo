import {
	T,
	__,
	applySpec,
	compose,
	cond,
	evolve,
	identity,
	join,
	keys,
	map,
	pathEq,
	pick,
} from 'ramda';
import {
	defaultToEmptyObject,
	isFunction,
	isNilOrEmpty,
	keyMirror,
} from 'ramda-extension';
import fetch from 'unfetch';

import { getTruthyKeys, round } from './utils';
import { featuresDescriptor } from './featuresDescriptor';

export const StatTypes = keyMirror({
	POSITIVE: null,
	NEGATIVE: null,
});

export const Features = {
	LYING_BEHAVIOR_SCORE: {
		type: StatTypes.NEGATIVE,
		value: 'lying_behavior_score',
		min: 0,
		max: 5,
	},
	FRAUD_SCORE: {
		value: 'fraud_score',
		type: StatTypes.NEGATIVE,
		numberStyle: 'percent',
	},
	LOAN_APPROVAL: {
		value: 'loan_approval',
		type: StatTypes.POSITIVE,
		numberStyle: 'percent',
	},
};

const createRequest = (url, options) =>
	fetch(url, {
		headers: {
			Authorization: `Basic ${process.env.AUTH_DEMO_APP_TOKEN}`,
		},
		...options,
	})
		.then((response) => {
			if (!response.ok) {
				return Promise.reject(response.status);
			}

			return response.json();
		})
		.then((data) => {
			if (data.status === 'error') {
				return Promise.reject(data.status);
			}
			return data;
		});

const getFeaturesQuery = compose(
	join('&'),
	map((x) => `features=${x}`)
);

const allFeaturesQuery = getFeaturesQuery(keys(featuresDescriptor));

/** Group features and predictions as features */
const mergeFeaturesAndPredictions = ({ features, predictions }) => ({
	...features,
	...predictions,
});

export const fetchFeatures = ({ applicationId, features }) => {
	const query = isNilOrEmpty(features)
		? allFeaturesQuery
		: getFeaturesQuery(features);

	return createRequest(
		`${process.env.API_URL}/applications/${applicationId}/smart-features?${query}`
	).then(mergeFeaturesAndPredictions);
};

const featuresDescriptorFiltering = map((x) =>
	x && isFunction(x.filterPredicate) ? x.filterPredicate : T
)(featuresDescriptor);

const featuresDescriptorFormatting = map(
	compose(
		cond([
			[pathEq(['type'], 'float'), () => round],
			[T, () => identity],
		]),
		defaultToEmptyObject
	)
)(featuresDescriptor);

const featuresDescriptorDataSelector = map((x) =>
	x && isFunction(x.getData) ? x.getData : identity
)(featuresDescriptor);

const formatFeatures = evolve(featuresDescriptorFormatting);
const selectValuesFromFeatures = evolve(featuresDescriptorDataSelector);

// Features -> FilteredFeatures
const filterFeatures = (features) =>
	compose(
		pick(__, features),
		getTruthyKeys,
		applySpec(featuresDescriptorFiltering)
	)(features);

export const logFeatures = compose(
	formatFeatures,
	selectValuesFromFeatures,
	filterFeatures
);
