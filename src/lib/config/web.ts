import isNode from 'is-node';

export interface Config {
	backendProtocoll: string;
	backendHost: string;
	backendPort: number;
}

let conf: Config = {
	backendProtocoll: 'http',
	backendHost: 'localhost',
	backendPort: 6502
};

export async function loadConfig() {
	if (!isNode) {
		const res = await fetch('/conf.json');
		conf = await res.json();
	}
}

export function getBackendURL() {
	if (!isNode) {
		return `${conf.backendProtocoll}://${conf.backendHost}:${conf.backendPort}`;
	} else {
		return '/';
	}
}

export function getBackendHost() {
	if (!isNode) {
		return `${conf.backendHost}:${conf.backendPort}`;
	} else {
		return '/';
	}
}
