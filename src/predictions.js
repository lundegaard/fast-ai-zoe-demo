import {
	T,
	__,
	applySpec,
	compose,
	cond,
	evolve,
	identity,
	map,
	mergeAll,
	o,
	pathEq,
	pick,
	prop,
} from 'ramda';
import { defaultToEmptyObject, isFunction, notEqual } from 'ramda-extension';
import fetch from 'unfetch';

import { getTruthyKeys, round } from './utils';

const createRequest = (url, options) =>
	fetch(url, {
		headers: {
			Authorization: `Basic ${process.env.AUTH_DEMO_APP_TOKEN}`,
		},
		...options,
	}).then(response => {
		if (!response.ok) {
			return Promise.reject(response.status);
		}

		return response.json();
	});

export const fetchPredictionsAndFeatures = applicationId =>
	Promise.all([
		createRequest(`${process.env.API_URL}/applications/${applicationId}/prediction`),
		createRequest(`${process.env.API_URL}/applications/${applicationId}/smart-features`),
	]).then(mergeAll);

export const fetchFeatures = applicationId =>
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
	behavior_typing_flight_time_mean: { type: 'float' },
	behavior_typing_interval_time_mean: { type: 'float' },
	behavior_typing_latency_time_mean: { type: 'float' },
	behavior_typing_up_to_up_time_mean: { type: 'float' },
	behavior_typing_correcting_mistakes_count: { type: 'float' },
	behavior_typing_paste_count: { type: 'float' },
	behavior_application_changes_count_bn_2d: null,
	fingerprint_zoe: null,
	person_email_credible: null,
	anomaly_typing: null,
};

const featuresDescriptorFiltering = map(x =>
	x && isFunction(x.filterPredicate) ? x.filterPredicate : T
)(featuresDescriptor);

// Features -> FormattedFeatures
const featuresDescriptorFormatting = map(
	o(
		cond([
			[pathEq(['type'], 'float'), () => round],
			[T, () => identity],
		]),
		defaultToEmptyObject
	)
)(featuresDescriptor);

const formatFeatures = evolve(featuresDescriptorFormatting);

// Features -> FilteredFeatures
const filterFeatures = features =>
	compose(pick(__, features), getTruthyKeys, applySpec(featuresDescriptorFiltering))(features);

export const logFeatures = compose(formatFeatures, filterFeatures, prop('features'));
