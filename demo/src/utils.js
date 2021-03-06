// https://stackoverflow.com/questions/179355/clearing-all-cookies-with-javascript
export const deleteAllCookies = () => {
	const cookies = document.cookie.split(';');

	cookies.forEach((cookie) => {
		const eqPos = cookie.indexOf('=');
		const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

		document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
	});
};
