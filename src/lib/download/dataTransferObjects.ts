import { CorretoOpenJDK, JavaVersion } from '../../lib/jvm/java.ts';
import { DownloadCallback } from './shared.ts';

export class DownloadDTO {
	type: DownloadDTOType;
	data: DownloadDTOInitOptions | DownloadCallback | CorretoOpenJDK | null;
	openjdkVersion?: JavaVersion;
	constructor(
		type: DownloadDTOType,
		data: DownloadDTOInitOptions | DownloadCallback | CorretoOpenJDK | null,
		openjdkVersion?: JavaVersion
	) {
		this.type = type;
		this.data = data;
		this.openjdkVersion = openjdkVersion;
	}
}

export interface DownloadDTOInitOptions {
	downloadURL: string;
	downloadPath: string;
	downloadFilename: string;
}

export enum DownloadDTOType {
	init,
	init_start,
	start,
	status,
	openjdk,
	openjdkFinished
}
