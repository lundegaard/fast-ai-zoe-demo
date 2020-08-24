import { o, prop } from 'ramda';
import { notEqual } from 'ramda-extension';

const isMobile = o(notEqual('Desktop'), prop('device_category'));

export const defaultDescriptor = {
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
	fingerprint_zoe: null,
	anomaly_typing: null,
};
