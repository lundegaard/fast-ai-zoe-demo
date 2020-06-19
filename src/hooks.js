import { useEffect, useRef } from 'react';

export const useTimeout = (fn, timeout, deps = []) => {
	const timeoutRef = useRef();

	const fnRef = useRef(fn);

	fnRef.current = fn;

	useEffect(
		() => {
			const timeoutId = setTimeout(
				() => fnRef.current && fnRef.current(),
				timeout
			);

			timeoutRef.current = timeoutId;

			return () => clearTimeout(timeoutId);
		},
		deps ? deps : void 0
	);
};
export const useWhyDidYouUpdate = (name, props) => {
	const previousProps = useRef();

	useEffect(() => {
		if (previousProps.current) {
			const allKeys = Object.keys({ ...previousProps.current, ...props });
			const changesObj = {};
			allKeys.forEach((key) => {
				if (previousProps.current[key] !== props[key]) {
					changesObj[key] = {
						from: previousProps.current[key],
						to: props[key],
					};
				}
			});

			if (Object.keys(changesObj).length) {
				console.log('[why-did-you-update]', name, changesObj);
			}
		}

		previousProps.current = props;
	});
};
