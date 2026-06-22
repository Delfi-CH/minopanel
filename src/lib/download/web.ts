import { DownloadState } from './shared';
import type { WebDownloadTask } from './shared';
import { DownloadDTO, DownloadDTOType } from './dataTransferObjects';

export class WebDownloadManager {
	private downloads = new Map<string, WebDownloadTask>();
	private openDownloads = new Map<string, WebSocket>();

	addDownload(task: WebDownloadTask): WebDownloadTask {
		if (this.downloads.has(task.id)) {
			throw new Error(`Download "${task.id}" already exists.`);
		}

		this.downloads.set(task.id, task);
		return task;
	}

	addOpenJDKDownload(java: any): WebDownloadTask {
		const task: WebDownloadTask = {
			id: 'Openjdk ' + java,
			filename: 'java',
			path: 'java',
			url: 'java',
			openJDK: java
		};

		if (this.downloads.has(task.id)) {
			throw new Error(`Download "${task.id}" already exists.`);
		}

		this.downloads.set(task.id, task);
		return task;
	}

	getDownload(id: string): WebDownloadTask {
		const task = this.downloads.get(id);
		if (!task) throw new Error(`Download "${id}" not found.`);
		return task;
	}

	exists(id: string): boolean {
		return this.downloads.has(id);
	}

	startDownload(id: string, callback: (dto: DownloadDTO) => void): void {
		const task = this.downloads.get(id);
		if (!task) throw new Error(`Download "${id}" not found.`);

		const downloadID = Math.floor(Math.random() * 100);

		const ws = new WebSocket(
			`ws://${window.location.hostname}:6502/api/download/stream/` + downloadID
		);

		ws.addEventListener('open', () => {
			const initDTO = new DownloadDTO(DownloadDTOType.init_start, {
				downloadURL: task.url,
				downloadPath: task.path,
				downloadFilename: task.filename
			});

			ws.send(JSON.stringify(initDTO));
		});

		ws.addEventListener('message', (e) => {
			const json: DownloadDTO = JSON.parse(e.data);
			callback(json);
		});
	}

	startDownloadSilent(id: string): void {
		const task = this.downloads.get(id);
		if (!task) throw new Error(`Download "${id}" not found.`);

		const downloadID = Math.floor(Math.random() * 100);

		const ws = new WebSocket(
			`ws://${window.location.hostname}:6502/api/download/stream/` + downloadID
		);

		ws.addEventListener('open', () => {
			if (!task.openJDK) {
				const initDTO = new DownloadDTO(DownloadDTOType.init_start, {
					downloadURL: task.url,
					downloadPath: task.path,
					downloadFilename: task.filename
				});
				ws.send(JSON.stringify(initDTO));
			} else {
				const initDTO = new DownloadDTO(DownloadDTOType.openjdk, null, task.openJDK);
				ws.send(JSON.stringify(initDTO));
			}
		});

		ws.addEventListener('message', (e) => {
			const json: DownloadDTO = JSON.parse(e.data);

			if (!json.data) {
				// ignore
			} else if (
				json.data.status === DownloadState.Finished ||
				json.type === DownloadDTOType.openjdkFinished
			) {
				ws.close();
				this.openDownloads.delete(id);
				this.downloads.delete(id);
			}
		});

		ws.addEventListener('close', () => {
			this.openDownloads.delete(id);
			this.downloads.delete(id);
		});

		this.openDownloads.set(id, ws);
	}

	listenToDownload(id: string, callback: (dto: DownloadDTO) => void): void {
		const ws = this.openDownloads.get(id);
		if (!ws) throw new Error(`Download "${id}" not found.`);

		ws.addEventListener('message', (e) => {
			const json: DownloadDTO = JSON.parse(e.data);
			callback(json);

			if (!json.data) return;

			if (
				json.data.status === DownloadState.Finished ||
				json.type === DownloadDTOType.openjdkFinished
			) {
				ws.close();
				this.openDownloads.delete(id);
				this.removeDownload(id);
			}
		});

		ws.addEventListener('close', () => {
			this.openDownloads.delete(id);
			this.removeDownload(id);
		});
	}

	stopDownload(id: string): void {
		const task = this.downloads.get(id);
		if (!task) return;

		// TODO: implement
	}

	removeDownload(id: string): void {
		if (!this.downloads.has(id)) return;

		this.downloads.delete(id);
		this.openDownloads.delete(id);
	}

	getAll(): string[] {
		return [...this.downloads.keys()];
	}

	getOpen(): string[] {
		return [...this.openDownloads.keys()];
	}
}

export const webDownloadManager = new WebDownloadManager();
