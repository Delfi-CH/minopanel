import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { downloadWss } from './sockets/downloadSocket.ts';
import { loadConfig, loadJavaFiles, loadJavaFile } from '../lib/data/data.ts';
import { Config } from '../lib/config/config.ts';
import { JavaVersion } from '../lib/jvm/java.ts';

const app = express();
app.use(express.json());
app.use(cors());

const config = loadConfig();
const port = config.backend.port;

const server = createServer(app);
const mcWss = new WebSocketServer({ noServer: true });
const mcStreams = new Map();

server.on('upgrade', (req, socket, head) => {
	if (!req.url) {
		throw new Error('no url');
	}

	const { pathname } = new URL(req.url, `http://${req.headers.host}`);
	const mcPathRegex = /^\/api\/server\/stream\/\d+$/;
	const downloadPathRegex = /^\/api\/download\/stream\/\d+$/;

	if (mcPathRegex.test(pathname)) {
		mcWss.handleUpgrade(req, socket, head, (ws) => {
			mcWss.emit('connection', ws, req);
		});
	} else if (downloadPathRegex.test(pathname)) {
		downloadWss.handleUpgrade(req, socket, head, (ws) => {
			downloadWss.emit('connection', ws, req);
		});
	} else {
		socket.destroy();
	}
});

mcWss.on('connection', (ws, req) => {
	if (!req.url) {
		throw new Error('no url');
	}
	const { pathname } = new URL(req.url, `http://${req.headers.host}`);
	const match = pathname.match(/^\/api\/server\/stream\/(\d+)$/);

	if (!match) {
		ws.close();
		return;
	}

	const serverId = Number(match[1]);
	console.log('Client is requesting server ' + serverId);

	if (!mcStreams.has(serverId)) {
		mcStreams.set(serverId, new Set());
	}

	mcStreams.get(serverId).add(ws);

	ws.on('close', () => {
		mcStreams.get(serverId)?.delete(ws);
	});
});

app.get('/', (req, res) => {
	res.send('hello world');
});

app.get('/api/jvm', (req, res) => {
	res.send(loadJavaFiles(config.paths));
});

app.post('/api/jvm/:version/test', (req, res) => {
	const version = JavaVersion[req.params.version as keyof typeof JavaVersion];
	const jvm = loadJavaFile(config.paths, version);
	jvm
		?.selfTest()
		.then(() => {
			res.status(200).send('ok');
			return;
		})
		.catch((err) => {
			console.error('Self test failed! ' + err);
			res.status(418).send('failed');
		});
});

app.get('/api/config', (req, res) => {
	res.send(config);
});

server.listen(port, '0.0.0.0', () => {
	console.log('server listening on port ' + port);
});
