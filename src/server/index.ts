import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';

const app = express();
app.use(express.json());
app.use(cors());

const port = 6502;

const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
	if (!req.url) {
		throw new Error('E');
	}

	const { pathname } = new URL(req.url, `http://${req.headers.host}`);
	const pathRegex = /^\/api\/server\/\d+$/;

	if (!pathRegex.test(pathname)) {
		socket.destroy();
		return;
	}
});

app.get('/', (req, res) => {
	res.send('ello word');
});

server.listen(port, '0.0.0.0', () => {
	console.log('server listening on port: ' + port);
});
