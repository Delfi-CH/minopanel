import { DownloaderHelper } from 'node-downloader-helper';

function downloadFile(
	url: string,
	path: string,
	filename: string,
	callback: (state: DownloadCallback) => void
) {
	const download = new DownloaderHelper(url, path, {
		resumeOnIncomplete: true,
		resumeOnIncompleteMaxRetry: 3,
		fileName: filename,
		retry: { maxRetries: 3, delay: 1500 },
		removeOnStop: true,
		removeOnFail: true
	});

	callback(new DownloadCallback('Inactive', DownloadState.Inactive, 0));

	download.on('end', (stats) => {
		callback(
			new DownloadCallback('Finished', DownloadState.Finished, 100, 0, stats.totalSize ?? 0)
		);
	});

	download.on('stop', () => {
		callback(new DownloadCallback('Stopped', DownloadState.Stopped));
	});

	download.on('progress', (stats) => {
		callback(
			new DownloadCallback(
				'Downloading...',
				DownloadState.Active,
				stats.progress,
				stats.speed,
				stats.total
			)
		);
	});

	download.on('error', (err) => {
		callback(new DownloadCallback(err.message, DownloadState.Failed));
	});

	download.start().catch((err) => console.error('Download Error: ' + err));

	return download;
}

class DownloadCallback {
	message: string;
	progress?: number;
	state: DownloadState;
	speed: number = 0;
	total: number = 0;
	constructor(
		message: string,
		state: DownloadState,
		progress?: number,
		speed?: number,
		total?: number
	) {
		this.message = message;
		this.state = state;
		if (progress !== undefined) {
			this.progress = progress;
		}
		if (speed !== undefined) {
			this.speed = speed;
		}
		if (total !== undefined) {
			this.total = total;
		}
	}
}

enum DownloadState {
	Inactive,
	Active,
	Finished,
	Stopped,
	Failed
}

export { downloadFile, DownloadCallback, DownloadState };
