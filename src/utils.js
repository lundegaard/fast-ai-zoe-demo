import { filter, keys, o } from 'ramda';

export const round = x => Math.round(x * 100) / 100;

export const getTruthyKeys = o(keys, filter(Boolean));
