import { keyMirror } from 'ramda-extension';

export const StatTypes = keyMirror({
	POSITIVE: null,
	NEGATIVE: null,
});

export const Features = {
	LYING_BEHAVIOR_SCORE: {
		type: StatTypes.NEGATIVE,
		value: 'lying_behavior_score',
		numberStyle: 'percent',
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
