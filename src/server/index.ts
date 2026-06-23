import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { downloadWss } from './sockets/downloadSocket.ts';
import { mcWss } from './sockets/serverSocket.ts';
import { loadConfig } from '../lib/data/data.ts';
import axios from 'axios';
import { DownloadManager } from '../lib/download/server.ts';
import { ServerManager } from '../lib/servers/manager.ts';
export const downloadManager = new DownloadManager();
export const serverManager = new ServerManager();
import { JvmRouter } from './jvmRouter.ts';
import { ServerRouter } from './mcRouter.ts';

const app = express();
app.use(express.json());
app.use(cors());

export const config = loadConfig();
const port = config.backend.port;

const server = createServer(app);

server.on('upgrade', (req, socket, head) => {
	if (!req.url) {
		throw new Error('no url');
	}

	const { pathname } = new URL(req.url, `http://${req.headers.host}`);
	const mcPathRegex = /^\/api\/server\/stream\/([A-Za-z0-9_-]+)$/;
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

app.get('/', (req, res) => {
	res.send('hello world');
});

app.get('/api/config', (req, res) => {
	res.send(config);
});

app.get('/api/proxy/forge-metadata', async (req, res) => {
	const proxyRes = await axios.get(
		'https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json'
	);
	res.send(proxyRes.data);
});

app.get('/api/proxy/neoforge-maven/sha256/:neoforgeVersion', async (req, res) => {
	const neoforgeVersion = req.params.neoforgeVersion;
	const proxyRes = await axios.get(
		`https://maven.neoforged.net/releases/net/neoforged/neoforge/${neoforgeVersion}/neoforge-${neoforgeVersion}-installer.jar.sha256`
	);
	res.send(proxyRes.data);
});

app.use('/api/jvm', JvmRouter);
app.use('/api/server/static', ServerRouter);

app.get('/api/downloads/static', (req, res) => {
	res.send(downloadManager.getAll());
});

server.listen(port, '0.0.0.0', () => {
	console.log('server listening on port ' + port);
});
