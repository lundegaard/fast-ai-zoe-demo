import { compose, join, map } from 'ramda';
import { isNilOrEmpty } from 'ramda-extension';
import fetch from 'unfetch';

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

/** Group features and predictions as features */
const mergeFeaturesAndPredictions = ({ features, predictions }) => ({
	...features,
	...predictions,
});

export const fetchFeatures = async ({ applicationId, features }) => {
	const query = isNilOrEmpty(features) ? '' : getFeaturesQuery(features);

	return createRequest(
		`${process.env.API_URL}/applications/${applicationId}/smart-features${
			query ? '?' : ''
		}${query}`
	).then(mergeFeaturesAndPredictions);
};
