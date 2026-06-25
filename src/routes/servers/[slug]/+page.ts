import axios from 'axios';
import { error } from '@sveltejs/kit';
import { getBackendURL } from '$lib/config/web.js';

export const ssr = false;
export const prerender = false

export async function load({ params }) {
	try {
		const backendURL = getBackendURL()
		const res = await axios.get(
			`${backendURL}/api/server/static/` + params.slug
		);
		return {
			post: res.data
		};
	} catch {
		error(404, 'Server not found');
	}
}
