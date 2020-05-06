import { useEffect, useRef } from 'react';

export const useTimeout = (fn, timeout, deps = []) => {
	const timeoutRef = useRef();

	const fnRef = useRef(fn);

	fnRef.current = fn;

	useEffect(
		() => {
			const timeoutId = setTimeout(() => fnRef.current && fnRef.current(), timeout);

			timeoutRef.current = timeoutId;

			return () => clearTimeout(timeoutId);
		},
		deps ? deps : void 0
	);
};
