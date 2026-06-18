import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { downloadWss } from './sockets/downloadSocket.ts';
import { mcWss } from './sockets/serverSocket.ts';
import {
	loadConfig,
	loadJavaFiles,
	loadJavaFile,
	loadServerFiles,
	loadServerFile,
	deleteJavaFile,
	deleteServerFile
} from '../lib/data/data.ts';
import { JavaVersion } from '../lib/jvm/java.ts';
import axios from 'axios';
import { MCServer, Modloader, ModloaderType } from '../lib/servers/servers.ts';
import { DownloadManager } from '../lib/download/downloader.ts';
import { ActiveServerInstance, ServerManager } from '../lib/servers/manager.ts';
export const downloadManager = new DownloadManager();
export const serverManager = new ServerManager();

const app = express();
app.use(express.json());
app.use(cors());

const config = loadConfig();
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

app.delete('/api/jvm/:version', (req, res) => {
	const version = JavaVersion[req.params.version as keyof typeof JavaVersion];
	if (deleteJavaFile(config.paths, version)) {
		res.sendStatus(204);
		return;
	} else {
		res.sendStatus(404);
		return;
	}
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

app.get('/api/server/static', (req, res) => {
	res.send(loadServerFiles(config.paths));
});

app.get('/api/server/static/:name', (req, res) => {
	const name = req.params.name;
	const srv = loadServerFile(config.paths, name);
	if (!srv) {
		res.sendStatus(404);
		return;
	}
	res.send(srv);
});

app.get('/api/server/static/:name/start', (req, res) => {
	const name = req.params.name;
	const srv = loadServerFile(config.paths, name);
	if (!srv) {
		res.sendStatus(404);
		return;
	}
	const java = loadJavaFile(config.paths, srv.preferedJavaVersion);
	if (!java) {
		res.sendStatus(404);
		return;
	}
	const srvInstance = new ActiveServerInstance(srv, java);
	serverManager.addInstance(srvInstance.base.name, srvInstance);
	serverManager.startInstance(srvInstance.base.name);
	srv.running = true;
	srv.writeToDisk(config.paths);
	res.sendStatus(201);
});

app.get('/api/server/static/:name/stop', (req, res) => {
	const name = req.params.name;
	const srv = loadServerFile(config.paths, name);
	if (!srv) {
		res.sendStatus(404);
		return;
	}
	srv.running = false;
	srv.writeToDisk(config.paths);
	serverManager.stopInstance(name);
	res.sendStatus(204);
});
app.get('/api/server/static/:name/restart', (req, res) => {
	const name = req.params.name;
	const srv = loadServerFile(config.paths, name);
	if (!srv) {
		res.sendStatus(404);
		return;
	}

	serverManager.restartInstance(name);
	res.sendStatus(200);
});

app.get('/api/server/static/:name/running', (req, res) => {
	const name = req.params.name;
	const srv = loadServerFile(config.paths, name);
	if (!srv) {
		res.sendStatus(404);
		return;
	}
	res.send(serverManager.isInstanceRunning(name));
});

app.delete('/api/server/static/:name', async (req, res) => {
	const name = req.params.name;
	const srv = loadServerFile(config.paths, name);
	if (!srv) {
		res.sendStatus(404);
		return;
	}
	if (srv.running) {
		serverManager.stopInstance(name);
	}
	if (deleteServerFile(config.paths, name)) {
		res.sendStatus(204);
		return;
	} else {
		res.sendStatus(500);
		return;
	}
});

app.post('/api/server/static', async (req, res) => {
	const body = req.body;
	const srv = MCServer.fromJSON(body);
	const existingServers = loadServerFiles(config.paths);
	let send409 = false;
	existingServers.forEach((existingSrv) => {
		if (existingSrv.name === srv.name) {
			send409 = true;
		}
	});
	if (send409) {
		res.sendStatus(409);
		return;
	}
	srv.writeToDisk(config.paths);
	res.sendStatus(201);
	return;
});

app.post('/api/server/static/simple', async (req, res) => {
	const body = req.body;
	const mltype = body.type as ModloaderType;
	const ml = new Modloader(mltype, body.version);
	const supportedVersions = await Modloader.getSupportedMCVersions(mltype);
	if (!supportedVersions.includes(body.version)) {
		res.sendStatus(418);
		return;
	}
	await ml.buildURL();
	const java = body.java as JavaVersion;
	const srv = new MCServer(body.name, body.version, ml, java);

	const existingServers = loadServerFiles(config.paths);
	let send409 = false;
	existingServers.forEach((existingSrv) => {
		if (existingSrv.name === srv.name) {
			send409 = true;
		}
	});
	if (send409) {
		res.sendStatus(409);
		return;
	}
	await srv.installFilesNode(config.paths, downloadManager);
	srv.writeToDisk(config.paths);
	res.sendStatus(201);
	return;
});

app.post('/api/server/static/:name/setup', async (req, res) => {
	const name = req.params.name;
	const jdks = loadJavaFiles(config.paths);
	const srv = loadServerFile(config.paths, name);
	if (!srv || !jdks) {
		res.sendStatus(404);
		return;
	}
	let selectedJDK = jdks.find((jdk) => jdk.version === JavaVersion.OpenJdk26);
	if (!selectedJDK) {
		selectedJDK = jdks.find((jdk) => jdk.version === JavaVersion.OpenJdk25);
	}
	if (!selectedJDK) {
		selectedJDK = jdks.find((jdk) => jdk.version === JavaVersion.OpenJdk21);
	}
	if (!selectedJDK) {
		res.sendStatus(404);
		return;
	}
	try {
		await srv.runSetup(config.paths, selectedJDK);
		res.sendStatus(201);
		return;
	} catch (err) {
		console.error('An error occured during server setup: ' + err);
		res.sendStatus(500);
		return;
	}
});

app.get('/api/downloads/static', (req, res) => {
	res.send(downloadManager.getAll());
});

server.listen(port, '0.0.0.0', () => {
	console.log('server listening on port ' + port);
});
