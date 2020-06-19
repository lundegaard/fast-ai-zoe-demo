import { useCallback, useEffect, useRef } from 'react';
import { map, o, path, toLower } from 'ramda';
import { valueMirror } from 'ramda-extension';

export const useSA = () => ({
	sa: typeof window === 'undefined' ? {} : window.sa,
});

// just for a virtual components - only a changeEvent
const getEventCallbackName = (eventName) =>
	`on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`;

const defaultGetMethodArgs = () => (firstArg) =>
	firstArg && firstArg.nativeEvent ? [{ event: firstArg.nativeEvent }] : [];
const getDefaultMethodMapper = o(map(toLower), valueMirror);

export const defaultMethodMapper = {
	's-form': {
		copy: 'clipboard',
		paste: 'clipboard',
		cut: 'clipboard',
		...getDefaultMethodMapper(['change', 'focus', 'blur', 'keyDown', 'keyUp']),
	},
	's-biometrics': getDefaultMethodMapper([
		'change',
		'focus',
		'blur',
		'keyDown',
		'keyUp',
		'copy',
		'paste',
		'cut',
	]),
};

const defaultTrackedEvents = [
	'change',
	'focus',
	'blur',
	'keyDown',
	'keyUp',
	'copy',
	'paste',
	'cut',
];

export const useSAFieldTracker = ({
	/**
	 * @param {String} eventName - Name of an event - "change", "focus", ...
	 * @param {...any} eventArguments Arguments passed to the handler from which
	 * the Event object should be derived.
	 *
	 * @return {Object} eventObject - Object that is passed to the appropriate
	 * SA methods.
	 */
	getMethodArgs = defaultGetMethodArgs,
	trackedEvents = defaultTrackedEvents,
	methodMapper = defaultMethodMapper,
	callTracker,
} = {}) => {
	const { sa } = useSA();

	const getInputProps = useCallback(
		(props) => {
			const eventHandlersWithProps = trackedEvents.reduce(
				(currentCallbacks, eventNameRaw) => {
					const eventCallbackName = getEventCallbackName(eventNameRaw);

					return {
						...currentCallbacks,
						[eventCallbackName]: (...args) => {
							const eventName = eventNameRaw.toLowerCase();

							const callMethod = (plugin) => {
								const method = path([plugin, eventNameRaw], methodMapper);

								if (method) {
									const methodArgs = getMethodArgs({
										props,
										plugin,
										method,
										eventName,
									})(...args);
									if (callTracker) {
										callTracker({ sa, plugin, method, eventName, methodArgs });
									} else {
										sa(`${plugin}:${method}`, ...methodArgs);
									}
								}
							};

							callMethod('s-form');
							callMethod('s-biometrics');

							if (currentCallbacks[eventCallbackName]) {
								return currentCallbacks[eventCallbackName](...args);
							}
						},
					};
				},
				props
			);

			return eventHandlersWithProps;
		},
		[getMethodArgs, methodMapper, callTracker, sa, trackedEvents]
	);

	return { getInputProps };
};

export const useSAComponentTimer = ({
	name,
	dimensions: dimensionsProp = [],
}) => {
	const { sa } = useSA();

	const dimensionsRef = useRef(dimensionsProp);

	useEffect(() => {
		const dimensions = dimensionsRef.current;
		sa('setTimer', { label: name, dimensions });

		return () => {
			sa('endTimer', { label: name, dimensions });
		};
	}, []);
};
