import axios from 'axios';
import { error } from '@sveltejs/kit';

export const ssr = false;

export async function load({ params }) {
	try {
		const res = await axios.get(`http://${window.location.hostname}:6502/api/server/static/` + params.slug);
		return {
			post: res.data
		};
	} catch {
		error(404, 'Server not found');
	}
}
