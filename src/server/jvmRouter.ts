import express from 'express';
import {
	loadJavaFiles,
	loadJavaFile,
	deleteJavaFile
} from '../lib/data/data.ts';
import { JavaVersion } from '../lib/jvm/java';
import { config } from './index.ts';

const router = express.Router()

router.get('/', (req, res) => {
	res.send(loadJavaFiles(config.paths));
});

router.post('/:version/test', (req, res) => {
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

router.delete('/:version', (req, res) => {
	const version = JavaVersion[req.params.version as keyof typeof JavaVersion];
	if (deleteJavaFile(config.paths, version)) {
		res.sendStatus(204);
		return;
	} else {
		res.sendStatus(404);
		return;
	}
});

export { router as JvmRouter }