/* global SAI */
/** Group features and predictions as features */
const mergeFeaturesAndPredictions = ({ features, predictions }) => ({
	...features,
	...predictions,
});

const resolveParam = (name, value) =>
	value !== undefined ? { [name]: value } : {};

export const fetchFeatures = async ({ timeout, forTime, features }) =>
	new Promise((resolve, reject) => {
		SAI.Request.fetch('smart-features', {
			params: {
				...resolveParam('features', features),
				...resolveParam('forTime', forTime),
			},
			timeout,
			onResponse: (response) => {
				const { ok, error, payload } = response;
				if (ok) {
					resolve(payload);
				} else {
					reject(error);
				}
			},
		});
	}).then(mergeFeaturesAndPredictions);
