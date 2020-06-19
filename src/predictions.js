import {
	T,
	__,
	applySpec,
	compose,
	cond,
	evolve,
	fromPairs,
	identity,
	map,
	o,
	path,
	pathEq,
	pick,
} from 'ramda';
import { defaultToEmptyObject, isFunction, keyMirror } from 'ramda-extension';
import fetch from 'unfetch';

import { getTruthyKeys, round } from './utils';
import { featuresDescriptor } from './featuresDescriptor';

const getFeatures = ({ features, predictions }) => ({
	...features,
	...predictions,
});
const getPrediction = path(['prediction']);

export const StatTypes = keyMirror({
	POSITIVE: null,
	NEGATIVE: null,
});

export const Models = {
	DEFAULT: {
		value: 'default',
		type: StatTypes.POSITIVE,
		numberStyle: 'percent',
	},
};

export const Features = {
	LYING_BEHAVIOR_SCORE: {
		value: 'lying_behavior_score',
		type: StatTypes.NEGATIVE,
		min: 0,
		max: 5,
	},
	FRAUD_SCORE: {
		value: 'fraud_score',
		type: StatTypes.NEGATIVE,
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

const fetchModels = (applicationId, models) =>
	Promise.all(
		map(
			(modelId) =>
				createRequest(
					modelId === Models.DEFAULT.value
						? `${process.env.API_URL}/applications/${applicationId}/prediction`
						: `${process.env.API_URL}/applications/${applicationId}/prediction/${modelId}`
				).then(o((prediction) => [modelId, prediction], getPrediction)),
			models
		)
	);

export const fetchPredictionsAndFeatures = ({
	applicationId,
	models = [Models.DEFAULT.value],
	features = null,
}) =>
	Promise.all([
		fetchModels(applicationId, models),
		createRequest(
			`${process.env.API_URL}/applications/${applicationId}/smart-features`
		),
	]).then(([models, featuresResponse]) => ({
		models: fromPairs(models),
		features: compose(
			features ? pick(features) : identity,
			getFeatures
		)(featuresResponse),
	}));

export const fetchFeatures = (applicationId) =>
	createRequest(
		`${process.env.API_URL}/applications/${applicationId}/smart-features`
	);

const featuresDescriptorFiltering = map((x) =>
	x && isFunction(x.filterPredicate) ? x.filterPredicate : T
)(featuresDescriptor);

// Features -> FormattedFeatures
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
const selectFeatures = evolve(featuresDescriptorDataSelector);

// Features -> FilteredFeatures
const filterFeatures = (features) =>
	compose(
		pick(__, features),
		getTruthyKeys,
		applySpec(featuresDescriptorFiltering)
	)(features);

export const logFeatures = compose(
	formatFeatures,
	selectFeatures,
	filterFeatures,
	getFeatures
);
