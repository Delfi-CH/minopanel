import { WebSocketServer } from 'ws';
import { serverManager } from '../index';

const mcStreams = new Map<string, Set<any>>();

export const mcWss = new WebSocketServer({ noServer: true });

mcWss.on('connection', (ws, req) => {
	if (!req.url) {
		throw new Error('no url');
	}
	const { pathname } = new URL(req.url, `http://${req.headers.host}`);
	const match = pathname.match(/^\/api\/server\/stream\/([A-Za-z0-9_-]+)$/);

	if (!match) {
		ws.close();
		return;
	}

	const serverId = match[1];
	console.log('Client is requesting server ' + serverId);

	if (!mcStreams.has(serverId)) {
		mcStreams.set(serverId, new Set());
	}

	mcStreams.get(serverId)?.add(ws);
	let pty;
	try {
		pty = serverManager.getPty(serverId);
	} catch {
		try {
			pty = serverManager.startInstance(serverId);
		} catch {
			//
		}
	}
	if (!pty) {
		ws.close();
	} else {
		pty.onData((data) => {
			ws.send(data);
		});

		ws.on('message', (data) => {
			try {
				const parsed = JSON.parse(data.toString());

				if (parsed.type === 'resize') {
					if (
						Number.isInteger(parsed.cols) &&
						Number.isInteger(parsed.rows) &&
						parsed.cols > 0 &&
						parsed.rows > 0
					) {
						pty.resize(parsed.cols, parsed.rows);
					}

					return;
				}
			} catch {
				//
			}

			pty.write(data.toString());
		});

		pty.onExit(() => {
			ws.close();
		});
	}

	ws.on('close', () => {
		mcStreams.get(serverId)?.delete(ws);
	});
});
