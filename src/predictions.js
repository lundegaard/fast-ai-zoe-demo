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
	prop,
} from 'ramda';
import { defaultToEmptyObject, isFunction, keyMirror, notEqual } from 'ramda-extension';
import fetch from 'unfetch';

import Modals from './constants/Modals';
import { getTruthyKeys, round } from './utils';

const getFeatures = path(['features']);
const getPrediction = path(['prediction']);

export const Models = keyMirror({
	DEFAULT: null,
});

export const Features = {
	BEHAVIOUR_LYING_INDEX: 'behavior_lying_index',
	BEHAVIOUR_SUSPICIOUS: 'behavior_suspicious',
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
					modelId === Models.DEFAULT
						? `${process.env.API_URL}/applications/${applicationId}/prediction`
						: `${process.env.API_URL}/applications/${applicationId}/prediction/${modelId}`
				).then(o((prediction) => [modelId, prediction], getPrediction)),
			models
		)
	);

export const fetchPredictionsAndFeatures = ({
	applicationId,
	models = ['default'],
	features = null,
}) =>
	Promise.all([
		fetchModels(applicationId, models),
		createRequest(`${process.env.API_URL}/applications/${applicationId}/smart-features`),
	]).then(([models, featuresResponse]) => ({
		models: fromPairs(models),
		features: compose(features ? pick(features) : identity, getFeatures)(featuresResponse),
	}));

export const fetchFeatures = (applicationId) =>
	createRequest(`${process.env.API_URL}/applications/${applicationId}/smart-features`);

const isMobile = o(notEqual('Desktop'), prop('device_category'));

const featuresDescriptor = {
	device_mobile_type: { filterPredicate: isMobile },
	device_mobile_price: { filterPredicate: isMobile },
	device_mobile_release_date: { filterPredicate: isMobile },
	device_category: null,
	device_browser: null,
	device_operating_system: null,
	device_screen_resolution: null,
	device_net_name: null,
	device_vpn: null,
	location_geoip_city: null,
	behavior_typing_speed: null,
	behavior_typing_correcting_mistakes_count: { type: 'float' },
	behavior_typing_paste_count: { type: 'float' },
	behavior_application_changes_count_bn_2d: null,
	behavior_typing_flight_time_mean: { type: 'float' },
	behavior_slider_move_count: { type: 'float' },
	behavior_slider_move_time: { type: 'float' },
	behavior_timer_detail: { type: 'float', getData: prop(Modals.TERMS) },
	fingerprint_zoe: null,
	person_email_credible: null,
	behavior_anomaly_typing: null,
};

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
	compose(pick(__, features), getTruthyKeys, applySpec(featuresDescriptorFiltering))(features);

export const logFeatures = compose(
	formatFeatures,
	selectFeatures,
	filterFeatures,
	prop('features')
);
