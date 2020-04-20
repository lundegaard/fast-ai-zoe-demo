import React, { forwardRef, useCallback, useEffect } from 'react';
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
import { compose, evolve, isEmpty, map, o, omit, pathEq, reject, when } from 'ramda';
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
