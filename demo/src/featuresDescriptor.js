import { o, prop } from 'ramda';
import { notEqual } from 'ramda-extension';

import Modals from './constants/Modals';

const isMobile = o(notEqual('Desktop'), prop('device_category'));

export const featuresDescriptor = {
	device_mobile_type: { filterPredicate: isMobile },
	device_mobile_price: { filterPredicate: isMobile },
	device_mobile_release_date: { filterPredicate: isMobile },
	device_category: null,
	device_browser: null,
	device_operating_system: null,
	device_screen_resolution: null,
	device_net_name: null,
	device_vpn: null,
	location_geoip_city: null,
	behavior_typing_speed: null,
	behavior_typing_correcting_mistakes_count: { type: 'float' },
	behavior_typing_paste_count: { type: 'float' },
	behavior_application_changes_count_bn_2d: null,
	behavior_typing_flight_time_mean: { type: 'float' },
	behavior_slider_move_count: { type: 'float' },
	behavior_slider_move_time: { type: 'float' },
	behavior_timer_detail: { type: 'float', getData: prop(Modals.TERMS) },
	fingerprint_zoe: null,
	person_email_credible: null,
	anomaly_typing: null,
};
