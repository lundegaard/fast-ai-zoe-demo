import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import {
	CheckboxField as FACheckboxField,
	RadioGroupField as FARadioGroupField,
	SelectField as FASelectField,
	SliderField as FASliderField,
	TextField as FATextField,
	getDisplayName,
} from '@fast-ai/ui-components';
import { splitFormProps, useField, useForm as useReactForm } from 'react-form';
import { evolve, isEmpty, map, o, reject, when } from 'ramda';
import { isFunction, isObject, noop } from 'ramda-extension';
import { useIntl } from 'gatsby-theme-fast-ai';

import { useSA, useSAFieldTracker } from '../sa';

const rejectEmpty = reject(isEmpty);

// NOTE: use `data` explictly due to recursion
const removeEmptyFields = (data) => o(rejectEmpty, map(when(isObject, removeEmptyFields)))(data);

const wrapWithStateAndSA = (Comp) => {
	const Field = forwardRef((props, ref) => {
		const [field, fieldOptions, rest] = splitFormProps(props);
		const intl = useIntl();

		const fieldOptionsWithTranslatedValidationResult = evolve({
			validate: (fn) =>
				isFunction(fn)
					? (x) => {
							const result = isFunction(fn) ? fn(x) : null;

							return result ? intl.formatMessage(result.message, result.messageValues) : null;
					  }
					: void 0,
		})(fieldOptions);

		const {
			meta: { error, isTouched },
			getInputProps,
		} = useField(field, fieldOptionsWithTranslatedValidationResult);

		const { getInputProps: saGetInputProps } = useSAFieldTracker();

		const inputProps = saGetInputProps(getInputProps({ ref, name: field, ...rest }));

		const hasError = !!error && isTouched;
		return <Comp {...inputProps} hasError={hasError} hint={hasError && error} />;
	});
	Field.displayName = `Field(${getDisplayName(Comp)})`;

	return Field;
};

export const useForm = ({ onSubmit = noop, name, ...rest }) => {
	const { sa } = useSA();
	const [applicationId, setApplicationId] = useState();

	useEffect(() => {
		sa('s-form:set', { name });
		sa('s-form:start');

		return () => {
			sa('s-form:end');
		};
	}, [name, sa]);

	const start = useCallback(() => {
		sa('s-form:start');
	}, [sa]);

	const register = useCallback(
		(applicationId) => {
			setApplicationId(applicationId);

			sa('send', 'register', applicationId);
		},
		[sa, setApplicationId]
	);

	const send = useCallback(
		(data, inProgress) => {
			const model = removeEmptyFields(data);
			sa('send', 'webdata', {
				applicationId,
				status: inProgress ? 'PROCESSING' : 'SUCCESS',
				...model,
			});
		},
		[applicationId, sa]
	);

	const end = useCallback(() => {
		sa('s-form:end');
	}, [sa]);

	const attemptSubmit = useCallback(() => {
		sa('s-form:submit');
	}, [sa]);

	const reactFormOptions = useReactForm({
		onSubmit: async (...args) => {
			sa('s-form:end');

			return onSubmit(...args);
		},
		...rest,
	});

	return {
		...reactFormOptions,
		register,
		send,
		end,
		start,
		attemptSubmit,
	};
};

export const TextField = wrapWithStateAndSA(FATextField);
export const SelectField = wrapWithStateAndSA(FASelectField);
export const CheckboxField = wrapWithStateAndSA(FACheckboxField);
export const RadioGroupField = wrapWithStateAndSA(FARadioGroupField);
export const SliderField = wrapWithStateAndSA(FASliderField);
export const NumberTextField = forwardRef((props, ref) => (
	<TextField
		ref={ref}
		inputProps={{
			pattern: '[0-9]*',
		}}
		{...props}
	/>
));
NumberTextField.displayName = 'NumberTextField';
