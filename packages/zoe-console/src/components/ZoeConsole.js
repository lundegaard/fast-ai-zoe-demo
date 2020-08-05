import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import {
	Console,
	ConsoleProvider,
	defaultConsoleFormattingFunction,
	useConsole,
	useIdleTime,
} from '@fast-ai/ui-components';
import { useInterval } from '@restart/hooks';
import { fetchFeatures } from '@fast-ai/zoe-client';

import { createFeatureLog } from '../createFeatureLog';
import { defaultDescriptor } from '../defaultDescriptor';

const ZoeConsoleConsumer = ({
	saRef: saRefProp,
	applicationId,
	loggingInterval = 2000,
	descriptor = defaultDescriptor,
	formatValue = defaultConsoleFormattingFunction,
	title = 'zoe@lundegaard.ai:~ smartfeatures$',
}) => {
	const { isIdle } = useIdleTime();
	const devConsole = useConsole();
	const saRef = useRef();

	if (typeof window !== 'undefined') {
		saRef.current = (saRefProp && saRefProp.current) || window.sa;
	}

	useEffect(() => {
		if (!saRef.current || !applicationId) {
			return;
		}
		const { tid } = saRef.current('get', 'userInfo');

		devConsole.replace({
			'Application ID': applicationId,
			'Tenant ID': tid,
		});
	}, [applicationId, devConsole, saRef]);

	const logFeatures = useMemo(() => createFeatureLog(descriptor), [descriptor]);

	useInterval(
		() => {
			if (document.hidden || isIdle || !applicationId) {
				return;
			}

			fetchFeatures({ applicationId }).then(
				(features) => void devConsole.log(logFeatures(features))
			);
		},
		loggingInterval,
		false, // is paused
		true // run immediately
	);

	return <Console formatValue={formatValue} title={title} />;
};

ZoeConsoleConsumer.propTypes = {
	applicationId: PropTypes.string,
	descriptor: PropTypes.object,
	formatValue: PropTypes.func,
	loggingInterval: PropTypes.number,
	saRef: PropTypes.shape({ current: PropTypes.object }),
	title: PropTypes.node,
};

const ZoeConsole = (props) => (
	<ConsoleProvider>
		<ZoeConsoleConsumer {...props} />
	</ConsoleProvider>
);

export default ZoeConsole;

export { defaultConsoleFormattingFunction };
