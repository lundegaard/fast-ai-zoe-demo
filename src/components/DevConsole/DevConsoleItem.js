import React from 'react';
import PropTypes from 'prop-types';
import Flex from '@fast-ai/ui-components/Flex';
import Text from '@fast-ai/ui-components/Text';
import { FormattedNumber } from 'gatsby-theme-fast-ai';
import { keyframes } from '@emotion/core';
import { isBoolean, isNumeric, isString } from 'ramda-extension';
import Dotdotdot from 'react-dotdotdot';

const backgroundFadeout = keyframes`
	0% {
		background-color: rgba(255, 0, 0, 1);
	}
	100% {
		background-color: rgba(255, 0, 0, 0);
	}
`;

const HighlightChangesText = ({ ...rest }) => (
	<Text
		{...rest}
		sx={{
			animationName: backgroundFadeout,
			animationDuration: '1.5s',
			animationTimingFunction: 'ease-out',
			animationFillMode: 'both',
		}}
	/>
);

const format = (x) => {
	if (isNumeric(x)) {
		return <FormattedNumber value={x} maximumFractionDigits={1} />;
	}

	if (isString(x)) {
		return x;
	}

	if (isBoolean(x)) {
		return x ? 'True' : 'False';
	}

	return '-';
};

const DevConsoleItem = ({ value, label, ...rest }) => (
	<Flex sx={{ py: 2, px: 3, alignItems: 'center' }} {...rest}>
		<Text as="span" fontSize={1} mb={0}>
			{label}
		</Text>
		<HighlightChangesText title={format(value)} key={value} as="span" ml="auto" mb={0} fontSize={1}>
			<Dotdotdot clamp={1}>{format(value)}</Dotdotdot>
		</HighlightChangesText>
	</Flex>
);

DevConsoleItem.propTypes = {
	label: PropTypes.string,
	value: PropTypes.any,
};

export default DevConsoleItem;
