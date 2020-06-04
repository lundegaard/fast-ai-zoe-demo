import React, { forwardRef, memo, useCallback, useEffect, useMemo } from 'react';
import {
	Col,
	CheckboxField as FACheckboxField,
	RadioGroupField as FARadioGroupField,
	SelectField as FASelectField,
	SliderField as FASliderField,
	TextField as FATextField,
	Heading,
	getDisplayName,
} from '@fast-ai/ui-components';
import { splitFormProps, useField, useForm as useReactForm } from 'react-form';
import {
	compose,
	evolve,
	head,
	isEmpty,
	map,
	mergeLeft,
	o,
	omit,
	pathEq,
	reject,
	when,
} from 'ramda';
import { isFunction, isObject, noop } from 'ramda-extension';
import { useIntl } from 'gatsby-theme-fast-ai';

import { CoborrowerChoice } from '../lookups';
import { useSA, useSAFieldTracker } from '../sa';

const rejectEmpty = reject(isEmpty);

// NOTE: use `data` explictly due to recursion
const removeEmptyFields = (data) => o(rejectEmpty, map(when(isObject, removeEmptyFields)))(data);

const removeCoborrower = when(
	pathEq(['webdata', 'coborrowerChoice'], CoborrowerChoice.values.SINGLE),
	omit(['coborrower'])
);

const formDataToWebdata = (data) => compose(removeEmptyFields, removeCoborrower)(data);

const wrapWithStateAndSA = ({ makeOnChange, tracker: saTrackerProps, getValue } = {}) => (Comp) => {
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
			value,
			setValue,
			getInputProps: reactFormGetInputProps,
		} = useField(field, fieldOptionsWithTranslatedValidationResult);

		const { getInputProps: saGetInputProps } = useSAFieldTracker(saTrackerProps);

		const oValue = useMemo(() => (getValue ? getValue(value) : value), [value]);

		const customProps = rejectEmpty({
			// ...(getValue ? { value: getValue(value) } : {}),
			value: oValue,
			...(makeOnChange ? { onChange: makeOnChange({ setValue }) } : {}),
		});

		const inputProps = compose(
			saGetInputProps,
			mergeLeft(customProps),
			reactFormGetInputProps
		)({ ref, name: field, ...rest });

		const hasError = !!error && isTouched;

		const optimizedComponent = useMemo(
			() => <Comp {...inputProps} hasError={hasError} hint={hasError && error} />,
			[inputProps.value, hasError]
		);

		return optimizedComponent;
	});
	Field.displayName = `Field(${getDisplayName(Comp)})`;

	return memo(Field);
};

export const useForm = ({ onSubmit = noop, name, ...rest }) => {
	const { sa } = useSA();

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
			sa('send', 'register', applicationId);
		},
		[sa]
	);

	const send = useCallback(
		({ applicationId, data, inProgress }) => {
			const model = formDataToWebdata(data);

			sa('send', 'webdata', {
				applicationId,
				status: inProgress ? 'PROCESSING' : 'SUCCESS',
				...model,
			});
		},
		[sa]
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

export const FormHeading = (props) => <Heading as="h2" mt={0} mb={4} {...props} />;
export const FormSubheading = (props) => <Heading as="h3" mt={0} mb={0} {...props} />;
export const HalfCol = (props) => <Col span={[12, 12, 6]} mb={4} {...props} />;
export const FullCol = (props) => <Col span={12} mb={4} {...props} />;

export const TextField = wrapWithStateAndSA()(FATextField);
export const SelectField = wrapWithStateAndSA()(FASelectField);
export const CheckboxField = wrapWithStateAndSA()(FACheckboxField);
export const RadioGroupField = wrapWithStateAndSA()(FARadioGroupField);

export const SliderField = wrapWithStateAndSA({
	makeOnChange: ({ setValue }) => (values) => setValue(head(values)),
	getValue: (value) => [value],
	tracker: {
		getMethodArgs: () => () => [
			{
				context: { type: 'range' },
			},
		],
		trackedEvents: ['change', 'update'],
		methodMapper: {
			's-form': {
				update: 'change',
				change: 'blur',
			},
		},
	},
})(FASliderField);

export const NumberTextField = forwardRef((props, ref) => {
	const inputProps = useMemo(
		() => ({
			pattern: '[0-9]*',
		}),
		[]
	);
	return <TextField ref={ref} inputProps={inputProps} {...props} />;
});
NumberTextField.displayName = 'NumberTextField';
