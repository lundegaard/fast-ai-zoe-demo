/* global SAI */
/** Group features and predictions as features */
const mergeFeaturesAndPredictions = ({ features, predictions }) => ({
	...features,
	...predictions,
});

export const fetchFeatures = async ({ applicationId, timeout, features }) =>
	new Promise((resolve, reject) => {
		SAI.Request.fetch('smart-features', {
			params: {
				...(applicationId ? { applicationId } : {}),
				...(features ? { features } : {}),
				forTime: null,
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
