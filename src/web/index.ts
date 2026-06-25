import { loadFrontendConfig } from '../lib/data/data';
import express from 'express';

const config = loadFrontendConfig();
const port = config.port;

const dir = config.webPath;

const app = express();

app.use('/', express.static(dir));

app.listen(port, '0.0.0.0', () => {
	console.log('server listening on port ' + port);
});
