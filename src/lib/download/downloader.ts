import { DownloaderHelper } from 'node-downloader-helper';

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

export class DownloadTask {
	public readonly id: string;

	private downloader: DownloaderHelper;
	private callback?: (state: DownloadCallback) => void;

	constructor(options: DownloadTaskOptions) {
		this.id = options.id;
		this.callback = options.callback;

		this.downloader = new DownloaderHelper(options.url, options.path, {
			resumeOnIncomplete: true,
			resumeOnIncompleteMaxRetry: 3,
			fileName: options.filename,
			retry: {
				maxRetries: 3,
				delay: 1500
			},
			removeOnStop: true,
			removeOnFail: true
		});

		this.registerEvents();

		this.emit(
			new DownloadCallback(
				'Inactive',
				DownloadState.Inactive,
				0
			)
		);
	}

	private emit(state: DownloadCallback) {
		this.callback?.(state);
	}

	private registerEvents() {
		this.downloader.on('progress', (stats) => {
			this.emit(
				new DownloadCallback(
					'Downloading...',
					DownloadState.Active,
					stats.progress,
					stats.speed,
					stats.total
				)
			);
		});

		this.downloader.on('end', (stats) => {
			this.emit(
				new DownloadCallback(
					'Finished',
					DownloadState.Finished,
					100,
					0,
					stats.totalSize ?? 0
				)
			);
		});

		this.downloader.on('stop', () => {
			this.emit(
				new DownloadCallback(
					'Stopped',
					DownloadState.Stopped
				)
			);
		});

		this.downloader.on('error', (err) => {
			this.emit(
				new DownloadCallback(
					err.message,
					DownloadState.Failed
				)
			);
		});
	}

	async start(): Promise<void> {
		await this.downloader.start();
	}

	async stop(): Promise<void> {
		await this.downloader.stop();
	}

	getInstance(): DownloaderHelper {
		return this.downloader;
	}
}

export class DownloadManager {
	private downloads = new Map<string, DownloadTask>();

	addDownload(options: DownloadTaskOptions): DownloadTask {
		if (this.downloads.has(options.id)) {
			throw new Error(`Download "${options.id}" already exists.`);
		}

		const task = new DownloadTask(options);

		this.downloads.set(options.id, task);

		return task;
	}

	getDownload(id: string): DownloadTask | undefined {
		return this.downloads.get(id);
	}

	async startDownload(id: string): Promise<void> {
		const task = this.downloads.get(id);

		if (!task) {
			throw new Error(`Download "${id}" not found.`);
		}

		await task.start();
	}

	async stopDownload(id: string): Promise<void> {
		const task = this.downloads.get(id);

		if (!task) {
			return;
		}

		await task.stop();
	}

	async removeDownload(id: string): Promise<void> {
		const task = this.downloads.get(id);

		if (!task) {
			return;
		}

		try {
			await task.stop();
		} catch {
			// ignore
		}

		this.downloads.delete(id);
	}

	async startAll(): Promise<void> {
		await Promise.all(
			[...this.downloads.values()].map((d) => d.start())
		);
	}

	async stopAll(): Promise<void> {
		await Promise.allSettled(
			[...this.downloads.values()].map((d) => d.stop())
		);
	}

	getAll(): DownloadTask[] {
		return [...this.downloads.values()];
	}
}