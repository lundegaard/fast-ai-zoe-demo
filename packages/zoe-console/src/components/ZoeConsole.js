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

import { fetchFeatures } from '../zoeClient';
import { createFeatureLog } from '../createFeatureLog';
import { defaultDescriptor } from '../defaultDescriptor';

const ZoeConsoleConsumer = ({
	applicationId,
	disableRefresh,
	loggingInterval = 3000,
	descriptor = defaultDescriptor,
	formatValue = defaultConsoleFormattingFunction,
	title = 'zoe@lundegaard.ai:~ smartfeatures$',
}) => {
	const { isIdle } = useIdleTime();
	const devConsole = useConsole();
	const saRef = useRef();
	const saiRef = useRef();

	if (typeof window !== 'undefined') {
		saRef.current = window.sa;
		saiRef.current = window.SAI;
	}

	useEffect(() => {
		if (!saRef.current || !applicationId) {
			return;
		}
		const userInfo = saRef.current('get', 'userInfo');

		if (!userInfo) {
			return;
		}
		const { tid } = userInfo;

		devConsole.replace({
			'Application ID': applicationId ? applicationId : '-',
			'Tenant ID': tid ? tid : '-',
		});
	}, [applicationId, devConsole, saRef]);

	const logFeatures = useMemo(() => createFeatureLog(descriptor), [descriptor]);

	useInterval(
		() => {
			if (!saiRef.current || document.hidden || isIdle || !applicationId) {
				return;
			}

			fetchFeatures({ timeout: loggingInterval }).then(
				(features) => void devConsole.log(logFeatures(features))
			);
		},
		loggingInterval,
		!!disableRefresh, // is paused
		true // run immediately
	);

	return <Console formatValue={formatValue} title={title} />;
};

ZoeConsoleConsumer.propTypes = {
	applicationId: PropTypes.string,
	descriptor: PropTypes.object,
	disableRefresh: PropTypes.bool,
	formatValue: PropTypes.func,
	loggingInterval: PropTypes.number,
	title: PropTypes.node,
};

const ZoeConsole = (props) => (
	<ConsoleProvider>
		<ZoeConsoleConsumer {...props} />
	</ConsoleProvider>
);

export default ZoeConsole;

export { defaultConsoleFormattingFunction };
