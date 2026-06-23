import express, { type Request, type Response } from 'express';
import {
	loadJavaFiles,
	loadJavaFile,
	loadServerFiles,
	loadServerFile,
	deleteServerFile
} from '../lib/data/data.ts';
import { JavaVersion } from '../lib/jvm/java.ts';
import { MCServer, Modloader, ModloaderType } from '../lib/servers/servers.ts';
import { ActiveServerInstance } from '../lib/servers/manager.ts';
import TailFile from '@logdna/tail-file';
import * as fs from 'node:fs';
import * as path from 'node:path';
import multer from 'multer';
import * as readline from 'node:readline/promises';
import { readDirectory } from '../lib/fs/fs.ts';
import { ZipArchive } from 'archiver';
import { config, serverManager, downloadManager } from './index.ts';

const router = express.Router();

const storage = multer.diskStorage({
	destination(req, file, cb) {
		const targetPath = req.body.targetPath;
		const safePath = path.normalize(targetPath).replace(/^(\.\.(\/|\\|$))+/, '');

		const uploadDir = path.join(config.paths.mcServerDirectory, safePath);

		fs.mkdirSync(uploadDir, { recursive: true });

		cb(null, uploadDir);
	},

	filename(req, file, cb) {
		cb(null, file.originalname);
	}
});

const upload = multer({ storage });

function validateServerFs(req: Request, res: Response, next: () => void) {
	const name = req.params.name;
	//@ts-expect-error womp womp
	const srv = loadServerFile(config.paths, name);
	if (!srv) {
		res.sendStatus(404);
		return;
	}
	if (!srv.serverDirectory) {
		res.sendStatus(404);
		return;
	}
	//@ts-expect-error womp womp
	req.server = srv;
	next();
}

router.get('/', (req, res) => {
	res.send(loadServerFiles(config.paths));
});

router.get('/:name', async (req, res) => {
	const name = req.params.name;
	const srv = loadServerFile(config.paths, name);
	if (!srv) {
		res.sendStatus(404);
		return;
	}
	await srv.readProperties();
	res.send(srv);
});

router.get('/:name/logs', async (req, res) => {
	const name = req.params.name;
	const srv = loadServerFile(config.paths, name);
	if (!srv) {
		res.sendStatus(404);
		return;
	}
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Connection', 'keep-alive');
	res.flushHeaders();

	try {
		fs.accessSync(srv.serverDirectory + '/logs/latest.log');
		const logfile = fs.createReadStream(srv.serverDirectory + '/logs/latest.log', 'utf-8');
		const rl = readline.createInterface({
			input: logfile,
			crlfDelay: Infinity
		});

		rl.on('line', (line) => {
			res.write(`data: ${line}\n\n`);
		});

		const tail = new TailFile(srv.serverDirectory + '/logs/latest.log', { encoding: 'utf-8' })
			.on('data', (chunk) => {
				const lines = chunk.toString().split('\n');

				for (const line of lines) {
					res.write(`data: ${line}\n\n`);
				}
			})
			.on('tail_error', (err) => {
				console.error('TailFile had an error!', err);
				res.end();
			})
			.on('error', (err) => {
				console.error('A TailFile stream error was likely encountered', err);
				res.end();
			});

		tail.start().catch((err) => {
			console.error('Cannot start.  Does the file exist?', err);
			res.end();
		});
		res.on('close', () => {
			tail.quit();
			res.end();
		});
	} catch {
		res.end();
	}
});

router.get('/:name/fs', validateServerFs, async (req, res) => {
	//@ts-expect-error womp womp
	const srv = req.server;
	const fsList = await readDirectory(srv.serverDirectory);
	res.send([fsList]);
});

router.post('/:name/fs', validateServerFs, upload.array('files'), (req, res) => {
	res.send(201);
});

router.delete('/:name/fs', validateServerFs, (req, res) => {
	const filepath = req.query.path;
	//@ts-expect-error womp womp
	const resolved = path.resolve(config.paths.mcServerDirectory, filepath);
	if (!resolved.startsWith(config.paths.mcServerDirectory)) {
		res.sendStatus(400);
		return;
	}
	try {
		fs.rmSync(resolved, { recursive: true, force: false });
		res.sendStatus(204);
		return;
	} catch (err) {
		console.error('Could not delete ' + resolved + ': ' + err);
		res.sendStatus(500);
		return;
	}
});

router.get('/:name/fs/download', validateServerFs, (req, res) => {
	const filepath = req.query.path;
	//@ts-expect-error womp womp
	const resolved = path.resolve(config.paths.mcServerDirectory, filepath);
	if (!resolved.startsWith(config.paths.mcServerDirectory)) {
		res.sendStatus(400);
		return;
	}
	try {
		res.download(resolved);
		return;
	} catch (err) {
		console.error('Could not delete ' + resolved + ': ' + err);
		res.sendStatus(500);
		return;
	}
});

router.get('/:name/fs/download/folder', validateServerFs, (req, res) => {
	const filepath = req.query.path;
	//@ts-expect-error womp womp
	const resolved = path.resolve(config.paths.mcServerDirectory, filepath);
	if (!resolved.startsWith(config.paths.mcServerDirectory)) {
		res.sendStatus(400);
		return;
	}

	const outpath = path.join(config.paths.tmpPath, path.basename(resolved) + '.zip');
	const output = fs.createWriteStream(outpath);
	const archive = new ZipArchive({
		zlib: { level: 6 }
	});

	output.on('close', () => {
		res.download(outpath);
		return;
	});

	output.on('drain', () => {
		console.log('zip stream has been drained');
	});

	archive.on('warning', function (err) {
		if (err.code === 'ENOENT') {
			console.log('ENOET');
		} else {
			console.error('warn: ' + err);
			res.sendStatus(500);
			return;
		}
	});

	// good practice to catch this error explicitly
	archive.on('error', function (err) {
		res.sendStatus(500);
		console.error('zip error: ' + err);
		return;
	});

	archive.pipe(output);
	archive.directory(resolved, false);
	archive.finalize();
});

router.get('/:name/props', async (req, res) => {
	const name = req.params.name;
	const srv = loadServerFile(config.paths, name);
	if (!srv) {
		res.sendStatus(404);
		return;
	}
	await srv.readProperties();
	res.send(srv.properties);
});

router.post('/:name/props', async (req, res) => {
	const name = req.params.name;
	const props = req.body;
	const srv = loadServerFile(config.paths, name);
	if (!srv) {
		res.sendStatus(404);
		return;
	}
	await srv.updateProperties(props);
	res.send(props);
});

router.get('/:name/start', (req, res) => {
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

router.get('/:name/stop', (req, res) => {
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
router.get('/:name/restart', (req, res) => {
	const name = req.params.name;
	const srv = loadServerFile(config.paths, name);
	if (!srv) {
		res.sendStatus(404);
		return;
	}

	serverManager.restartInstance(name);
	res.sendStatus(200);
});

router.get('/:name/running', (req, res) => {
	const name = req.params.name;
	const srv = loadServerFile(config.paths, name);
	if (!srv) {
		res.sendStatus(404);
		return;
	}
	res.send(serverManager.isInstanceRunning(name));
});

router.delete('/:name', async (req, res) => {
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

router.post('/', async (req, res) => {
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

router.post('/simple', async (req, res) => {
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

router.post('/:name/setup', async (req, res) => {
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

export { router as ServerRouter };
