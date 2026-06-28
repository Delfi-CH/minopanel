import { DownloadDTO, DownloadDTOType } from '../lib/download/dataTransferObjects.ts';
import { JavaVersion } from '../lib/jvm/java.ts';
import type { ModloaderType } from '../lib/servers/servers.ts';
import axios from 'axios';
import colors from 'ansi-colors';
import { Command } from 'commander';
import EasyTable from 'easy-table';
import WebSocket from 'ws';
import cliProgress from 'cli-progress';
import { EventSource } from 'eventsource';
import { loadCLIConfig } from '../lib/data/data.ts';
import tab from "@bomb.sh/tab/commander"

async function main() {
	const program = new Command('minoctl');

	function parseOpts() {
		const opts = program.opts();
		let cfg;
		if (opts.config) {
			cfg = loadCLIConfig(opts.config);
		} else {
			cfg = loadCLIConfig();
		}
		if (opts.hostname) {
			cfg.backendHost = opts.hostname;
		}
		if (opts.port) {
			cfg.backendPort = opts.port;
		}
		if (opts.protocol) {
			cfg.backendProtocoll = opts.protocol;
		}
		return cfg;
	}

	program.description('Command Line Interface for minopanel');
	program.version('0.1.0', '-v, --version');

	program.option('-H, --hostname <hostname/ip address>', 'hostname of the minopanel instance');
	program.option('-p, --port <number>', 'port of the minopanel instance');
	program.option('-P, --protocol <http(s)>', 'protocol of the minopanel instance');
	program.option('-c, --config <path>', 'use an alternative configuration file');

	const serverCommand = program.command('server');
	serverCommand
		.command('get')
		.description('get a list of servers')
		.option('-a, --all', 'include inactive servers')
		.action(async (options) => {
			if (options.all) {
				await getAllServers();
			} else {
				await getServers();
			}
		});

	serverCommand
		.command('attach <name>')
		.description('attach the server console to your console')
		.action(async (name) => {
			const cfg = parseOpts();
			try {
				const res = await axios.get(getBaseUrl() + `/api/server/static/${name}/running`);
				const isRunning = res.data;
				if (!isRunning) {
					console.error(colors.red(`Server ${name} inst running!`));
					process.exit(1);
				}
			} catch (err) {
				if (axios.isAxiosError(err) && err.response?.status === 404) {
					console.error(colors.red(`Server ${name} not found!`));
					process.exit(1);
				} else {
					console.error(colors.red(`An error has occurred: ${err}`));
					process.exit(1);
				}
			}
			const ws = new WebSocket(
				`ws://${cfg.backendHost}:${cfg.backendPort}/api/server/stream/${name}`
			);
			const stdin = process.stdin;
			const stdout = process.stdout;
			ws.on('open', () => {
				console.log('Connected to server ' + name + '.');
				console.log('Press CTRL+D to exit.');
				console.log("Type 'help' to get a list of commands.");
			});

			ws.on('message', (data) => {
				stdout.write(data.toString());
			});

			stdin.on('end', () => {
				ws.close();
			});

			stdin.on('data', (data) => {
				ws.send(data);
			});
		});

	serverCommand
		.command('logs <name>')
		.description('get the logs of a server')
		.action((name) => {
			const stream = new EventSource(getBaseUrl() + `/api/server/static/${name}/logs`);
			if (!stream) {
				console.error(colors.red(`Server ${name} not found!`));
				process.exit(1);
			}
			const stdin = process.stdin;

			stream.addEventListener('open', () => {
				console.log('Connected to server ' + name + '.');
				console.log('Press CTRL+D to exit.');
			});

			stream.addEventListener('message', (e) => {
				console.log(e.data);
			});

			stdin.resume();
			stdin.on('end', () => {
				stream.close();
				process.exit(0);
			});
		});

	serverCommand
		.command('info <name>')
		.description('get info on a specific server')
		.action(async (name) => {
			await getSpecificServer(name);
		});

	serverCommand
		.command('create <name> <version> <type> <java>')
		.description('get info on a specific server')
		.action(async (name, version, type, java) => {
			await createNewServer(name, version, type, java);
		});

	serverCommand
		.command('start <name>')
		.description('start a server')
		.action(async (name) => {
			await startServer(name);
		});

	serverCommand
		.command('stop <name>')
		.description('stop a server')
		.action(async (name) => {
			await stopServer(name);
		});

	serverCommand
		.command('restart <name>')
		.description('restart a server')
		.action(async (name) => {
			await restartServer(name);
		});

	serverCommand
		.command('delete <name>')
		.description('restart a server')
		.action(async (name) => {
			await deleteServer(name);
		});

	const javaCommand = program.command('java');

	javaCommand
		.command('get')
		.description('get java versions')
		.action(async () => {
			await getLocalJavaVerions();
		});

	javaCommand
		.command('install <version>')
		.description('install a java version')
		.action((version) => {
			if (Object.keys(JavaVersion).includes(version)) {
				try {
					const cfg = parseOpts();
					const rand = Math.floor(Math.random() * 100);
					const ws = new WebSocket(
						'ws://' + cfg.backendHost + ':' + cfg.backendPort + '/api/download/stream/' + rand
					);
					const initDTO = new DownloadDTO(DownloadDTOType.openjdk, null, version);
					const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
					ws.on('open', () => {
						ws.send(JSON.stringify(initDTO));
						bar.start(100, 0);
					});
					ws.on('message', (data) => {
						const json = JSON.parse(data.toString());
						if (json.type === DownloadDTOType.status && json.data !== null) {
							bar.update(Math.floor(json.data.progress));
						}
					});
					ws.on('close', () => {
						bar.stop();
					});
				} catch (err) {
					console.error(colors.red('An error ocurred: ' + err));
				}
			} else {
				console.error(colors.red('Not a java version!'));
			}
		});

	javaCommand
		.command('test <version>')
		.description('run java self check')
		.action(async (version) => {
			await testJavaVersion(version);
		});

	javaCommand
		.command('delete <version>')
		.description('delete a java version')
		.action(async (version) => {
			await deleteJavaVersion(version);
		});
	
	tab(program)
	await program.parseAsync();

	async function getServers() {
		try {
			const res = await axios.get(getBaseUrl() + '/api/server/static');
			const data = res.data.filter((srv) => srv.running);
			if (data.length >= 1) {
				drawServerTable(data);
			} else {
				console.log('No servers found...');
			}
		} catch (err) {
			if (axios.isAxiosError(err)) {
				console.error(colors.red('Could not connect to server: ' + err));
			} else {
				console.error(colors.red('An error occured: ' + err));
			}
		}
	}

	async function getAllServers() {
		try {
			const res = await axios.get(getBaseUrl() + '/api/server/static');
			const data = res.data;
			if (data.length >= 1) {
				drawServerTable(data);
			} else {
				console.log('No servers found');
			}
		} catch (err) {
			if (axios.isAxiosError(err)) {
				console.error(colors.red('Could not connect to server: ' + err));
			} else {
				console.error(colors.red('An error occured: ' + err));
			}
		}
	}

	async function startServer(name: string) {
		try {
			await axios.get(getBaseUrl() + '/api/server/static/' + name + '/start');
			console.log('Started server ' + name);
		} catch (err) {
			if (axios.isAxiosError(err)) {
				console.error(colors.red('Could not connect to server: ' + err));
			} else {
				console.error(colors.red('An error occured: ' + err));
			}
		}
	}

	async function stopServer(name: string) {
		try {
			await axios.get(getBaseUrl() + '/api/server/static/' + name + '/stop');
			console.log('Stopped server ' + name);
		} catch (err) {
			if (axios.isAxiosError(err)) {
				console.error(colors.red('Could not connect to server: ' + err));
			} else {
				console.error(colors.red('An error occured: ' + err));
			}
		}
	}

	async function deleteServer(name: string) {
		try {
			await axios.delete(getBaseUrl() + '/api/server/static/' + name);
			console.log('Deleted server ' + name);
		} catch (err) {
			if (axios.isAxiosError(err)) {
				if (err.response?.status === 404) {
					console.error(colors.red('Server ' + name + ' doesnt exist!'));
				} else {
					console.error(colors.red('Could not connect to server: ' + err));
				}
			} else {
				console.error(colors.red('An error occured: ' + err));
			}
		}
	}

	async function restartServer(name: string) {
		try {
			await axios.get(getBaseUrl() + '/api/server/static/' + name + '/restart');
			console.log('Restarted server ' + name);
		} catch (err) {
			if (axios.isAxiosError(err)) {
				console.error(colors.red('Could not connect to server: ' + err));
			} else {
				console.error(colors.red('An error occured: ' + err));
			}
		}
	}

	async function getSpecificServer(name: string) {
		try {
			const res = await axios.get(getBaseUrl() + '/api/server/static/' + name);
			const data = res.data;
			console.log(colors.bold(`Server ${colors.green("'" + data.name + "'")}`));
			console.log('Game Version: ' + colors.green(data.mcVersion));
			console.log('Modloader: ' + colors.green(data.modloader.type));
			console.log('Modloader Version: ' + colors.green(data.modloader.modloaderVersion));
			console.log('Java Version: ' + colors.green(data.preferedJavaVersion));
			console.log('RAM Minumum: ' + colors.green(data.memoryMin));
			console.log('RAM Maximum: ' + colors.green(data.memoryMax));
			console.log('Executable: ' + colors.green(data.serverExecutableFilePath));
			console.log('Arguments: ' + colors.green(data.serverExecutableArgs.join(' ')));
			console.log('server.properties path: ' + colors.green(data.serverPropertiesFilePath));
			console.log('Running: ' + colors.green(data.running ? 'Yes' : 'No'));
		} catch (err) {
			if (axios.isAxiosError(err)) {
				console.error(colors.red('Could not connect to server: ' + err));
			} else {
				console.error(colors.red('An error occured: ' + err));
			}
		}
	}

	async function createNewServer(
		name: string,
		version: string,
		type: ModloaderType,
		java: JavaVersion
	) {
		console.log('Creating server...');
		try {
			await axios.post(getBaseUrl() + '/api/server/static/simple', {
				name: name,
				version: version,
				type: type,
				java: java
			});
			const interval = setInterval(async () => {
				try {
					await axios.post(getBaseUrl() + '/api/server/static/' + name + '/setup');
					console.log('Server was created.');
					clearInterval(interval);
				} catch {
					//
				}
			}, 1000);
		} catch (err) {
			if (axios.isAxiosError(err)) {
				if (err.response?.status === 409) {
					console.error(colors.red('A Server with the name ' + name + ' already exists!'));
				} else if (
					err.response?.status === 400 ||
					err.response?.status === 418 ||
					err.response?.status === 500
				) {
					console.error(colors.red('Invalid Input!'));
				} else {
					console.error(colors.red('Network Error: ' + err));
				}
			} else {
				console.error(colors.red('error: ' + err));
			}
		}
	}

	async function getLocalJavaVerions() {
		try {
			const res = await axios.get(getBaseUrl() + '/api/jvm');
			const data = res.data;
			const table = new EasyTable();
			data.forEach((jvm) => {
				table.cell('Name', jvm.name);
				table.cell('Version', jvm.version);
				table.cell('Path', jvm.pathOnDisk);
				table.cell('Operating System', jvm.system);
				table.cell('CPU Architecture', jvm.arch);
				table.newRow();
			});
			console.log(table.toString());
		} catch (err) {
			if (axios.isAxiosError(err)) {
				console.error(colors.red('Could not connect to server: ' + err));
			} else {
				console.error(colors.red('An error occured: ' + err));
			}
		}
	}

	async function testJavaVersion(version) {
		if (!Object.keys(JavaVersion).includes(version)) {
			console.error(colors.red('Self test failed!'));
			process.exit(1);
		}
		try {
			await axios.post(getBaseUrl() + '/api/jvm/' + JavaVersion[version] + '/test');
			console.log(colors.green('Self test successfull!'));
		} catch {
			console.error(colors.red('Self test failed!'));
		}
	}

	async function deleteJavaVersion(version) {
		try {
			await axios.delete(getBaseUrl() + '/api/jvm/' + JavaVersion[version]);
			console.log('Deleted java ' + JavaVersion[version]);
		} catch (err) {
			if (axios.isAxiosError(err)) {
				if (err.response?.status === 404) {
					console.error(colors.red('Java ' + JavaVersion[version] + ' doesnt exist!'));
				} else {
					console.error(colors.red('Could not connect to server: ' + err));
				}
			} else {
				console.error(colors.red('An error occured: ' + err));
			}
		}
	}

	function getBaseUrl() {
		const cfg = parseOpts();
		return cfg.backendProtocoll + '://' + cfg.backendHost + ':' + cfg.backendPort;
	}

	function drawServerTable(data: Array<any>) {
		const table = new EasyTable();
		data.forEach((srv) => {
			table.cell('Name', srv.name);
			table.cell('Game Version', srv.mcVersion);
			table.cell('Modloader', srv.modloader.type);
			table.cell('Java Version', srv.preferedJavaVersion);
			table.cell('Memory', `${srv.memoryMin}-${srv.memoryMax}`);
			table.cell('Running', srv.running ? 'Yes' : 'No');
			table.newRow();
		});
		console.log(table.toString());
	}
}
main();
