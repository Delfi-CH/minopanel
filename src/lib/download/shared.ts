import type { JavaVersion } from '$lib/jvm/java';

export enum DownloadState {
	Inactive,
	Active,
	Finished,
	Stopped,
	Failed
}

export class DownloadCallback {
	message: string;
	progress?: number;
	state: DownloadState;
	speed = 0;
	total = 0;

	constructor(
		message: string,
		state: DownloadState,
		progress?: number,
		speed?: number,
		total?: number
	) {
		this.message = message;
		this.state = state;
		this.progress = progress;
		this.speed = speed ?? 0;
		this.total = total ?? 0;
	}
}

export interface DownloadTaskOptions {
	id: string;
	url: string;
	path: string;
	filename: string;
	callback?: (state: DownloadCallback) => void;
}

export interface WebDownloadTask {
	id: string;
	url: string;
	path: string;
	filename: string;
	openJDK?: JavaVersion;
}
