import { WebSocketServer } from 'ws';
import {
	DownloadCallback,
	DownloadManager,
	DownloadState
} from '../../lib/download/downloader.ts';
import {
	DownloadDTO,
	DownloadDTOType
} from '../../lib/download/dataTransferObjects.ts';

const downloadManager = new DownloadManager();
const downloadStreams = new Map<number, Set<any>>();

export const downloadWss = new WebSocketServer({ noServer: true });

downloadWss.on('connection', (ws, req) => {
	if (!req.url) {
		throw new Error('no url');
	}

	const { pathname } = new URL(req.url, `http://${req.headers.host}`);
	const match = pathname.match(/^\/api\/download\/stream\/(\d+)$/);

	if (!match) {
		ws.close();
		return;
	}

	const downloadId = Number(match[1]);

	console.log('Client is creating download ' + downloadId);

	if (!downloadStreams.has(downloadId)) {
		downloadStreams.set(downloadId, new Set());
	}

	downloadStreams.get(downloadId)?.add(ws);

	ws.on('message', (data) => {
		const json = JSON.parse(data.toString());

		if (json.type === DownloadDTOType.init) {
			try {
				downloadManager.removeDownload(String(downloadId));

				downloadManager.addDownload({
					id: String(downloadId),
					url: json.data.downloadURL,
					path: json.data.downloadPath,
					filename: json.data.downloadFilename,
					callback: (state) => {
						const stateDTO = new DownloadDTO(
							DownloadDTOType.status,
							state
						);

						ws.send(JSON.stringify(stateDTO));
					}
				});

				const okDTO = new DownloadDTO(
					DownloadDTOType.status,
					new DownloadCallback(
						'Download created',
						DownloadState.Inactive
					)
				);

				ws.send(JSON.stringify(okDTO));
			} catch {
				// nothing
			}
		}

		if (json.type === DownloadDTOType.start) {
			try {
				downloadManager.startDownload(String(downloadId));
			} catch {
				// nothing
			}
		}
	});

	ws.on('close', () => {
		downloadStreams.get(downloadId)?.delete(ws);

		if (downloadStreams.get(downloadId)?.size === 0) {
			downloadStreams.delete(downloadId);
		}
	});
});