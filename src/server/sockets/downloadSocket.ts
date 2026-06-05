import { WebSocketServer } from 'ws';
import { DownloadCallback, DownloadManager, DownloadState } from '../../lib/download/downloader.ts';
import { DownloadDTO, DownloadDTOType } from '../../lib/download/dataTransferObjects.ts';
import { CorretoOpenJDK, JavaVersion } from '../../lib/jvm/java.ts';
import os from "node:os"
import fs from "node:fs"
import crypto from "node:crypto"
import stream from "node:stream/promises"
import axios from 'axios';
import { MachineArchitecture, OperatingSystem } from '../../lib/system.ts';
import { ApplicatonPaths } from '../../lib/config/paths.ts';

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
						const stateDTO = new DownloadDTO(DownloadDTOType.status, state);

						ws.send(JSON.stringify(stateDTO));
					}
				});

				const okDTO = new DownloadDTO(
					DownloadDTOType.status,
					new DownloadCallback('Download created', DownloadState.Inactive)
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

		if (json.type === DownloadDTOType.openjdk) {
			try {
				const javaVersion = json.openjdkVersion 

				let system;
				switch (os.platform()) {
					case "linux": system = OperatingSystem.Linux; break
					case "win32": system = OperatingSystem.Windows; break
					default: system = OperatingSystem.Other; break
				}

				let arch;
				switch (os.arch()) {
					case "x64": arch = MachineArchitecture.x64; break
					case "arm64": arch = MachineArchitecture.aarch64; break
					default: throw new Error("Architecture not supported")
				}

				const name = `correto-${JavaVersion[javaVersion]}-${system}-${arch}-jdk`

				const openjdk = new CorretoOpenJDK(
					name,
					javaVersion,
					system,
					arch
				)

				const hash = crypto.createHash("sha256")
				let originHash: string;
				axios.get(openjdk.sha256URL).then((res)=>{
					originHash = res.data
				})
				downloadManager.addDownload({
					id: name,
					url: openjdk.downloadURL,
					path: new ApplicatonPaths(system).tmpPath,
					filename: `openjdk-${JavaVersion[openjdk.version]}.${openjdk.fileExtension}`,
					callback: (state) => {
						const stateDTO = new DownloadDTO(DownloadDTOType.status, state);
						if (state.state == DownloadState.Finished) {
							const readStram = fs.createReadStream(new ApplicatonPaths(openjdk.system).tmpPath + "/" + `openjdk-${JavaVersion[openjdk.version]}.${openjdk.fileExtension}`)
							stream.pipeline(readStram, hash).then(()=>{
								if (hash.digest("hex") !== originHash) {
									ws.send(JSON.stringify(new DownloadDTO(
										DownloadDTOType.status, new DownloadCallback(
											"Error: Could nod validate hash",
											DownloadState.Failed
										)
									)))
								}
							})
						}
						ws.send(JSON.stringify(stateDTO));
					}
				})

				downloadManager.startDownload(name)
			} catch {
				// noting
			}
		}
	});

	ws.on('close', () => {
		downloadManager.removeDownload(String(downloadId))
		console.log("Client stopped Download " + downloadId)
		downloadStreams.get(downloadId)?.delete(ws);

		if (downloadStreams.get(downloadId)?.size === 0) {
			downloadStreams.delete(downloadId);
		}
	});
});
