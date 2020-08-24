import {
	T,
	__,
	applySpec,
	compose,
	cond,
	evolve,
	identity,
	map,
	pathEq,
	pick,
} from 'ramda';
import { defaultToEmptyObject, isFunction } from 'ramda-extension';

import { getTruthyKeys, round } from './utils';

export const createFeatureLog = (featuresDescriptor) => {
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

	const filterFeatures = (features) =>
		compose(
			pick(__, features),
			getTruthyKeys,
			applySpec(featuresDescriptorFiltering)
		)(features);
	return compose(formatFeatures, selectValuesFromFeatures, filterFeatures);
};
