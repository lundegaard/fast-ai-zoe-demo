import React from 'react';
import PropTypes from 'prop-types';
import { path } from 'ramda';
import { FormattedMessage } from 'gatsby-theme-fast-ai';

const OptionalFormattedMessage = ({ id, messages }) =>
	path([id, 'id'], messages) ? <FormattedMessage {...messages[id]} /> : id;

OptionalFormattedMessage.propTypes = {
	id: PropTypes.node,
	messages: PropTypes.object,
};

export default OptionalFormattedMessage;
