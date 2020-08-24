import React from 'react';
import PropTypes from 'prop-types';
import { Button, Heading, Modal, Text } from '@fast-ai/ui-components';
import { FormattedMessage } from 'gatsby-theme-fast-ai';

import { useSAComponentTimer } from '../sa';
import Forms from '../constants/Forms';
import Modals from '../constants/Modals';
import m from '../intl/messages';

const TermsModal = ({ closeModal, ...rest }) => {
	useSAComponentTimer({
		dimensions: [Forms.ZOE_DEMO, Modals.TERMS],
	});

	return (
		<Modal sx={{ textAlign: 'center', p: 4 }} {...rest}>
			<Heading as="h2" mt={1}>
				<FormattedMessage {...m.termsModalHeading} />
			</Heading>

			<Text fontSize={4}>
				<FormattedMessage {...m.termsModalDescription} />
			</Text>

			<Button variant="secondary" onClick={closeModal}>
				<FormattedMessage {...m.close} />
			</Button>
		</Modal>
	);
};

TermsModal.propTypes = {
	applicationId: PropTypes.string,
	closeModal: PropTypes.func,
	onClose: PropTypes.func,
};

export default TermsModal;
