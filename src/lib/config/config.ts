import isNode from 'is-node';
import { MachineArchitecture, OperatingSystem } from '../system.js';
import { ApplicatonPaths } from './paths.ts';

export class Config {
	branding: string;
	version: string;
	system: OperatingSystem;
	arch: MachineArchitecture;
	paths: ApplicatonPaths;
	backend: BackendOptions;
	memory: number = 0;

	constructor(
		system: OperatingSystem,
		arch: MachineArchitecture,
		backend: BackendOptions,
		version: string,
		branding?: string
	) {
		this.system = system;
		this.arch = arch;
		this.paths = new ApplicatonPaths(system);
		this.backend = backend;
		this.version = version;
		this.branding = branding ? branding : 'Minopanel';
	}

	async writeToFile() {
		if (!isNode) {
			throw new Error('not a nodejs enviroment');
		}

		const { writeFile } = await import('node:fs/promises');
		const { totalmem } = await import('node:os');
		this.memory = totalmem() / 1000000;

		await writeFile(this.paths.serverConfigPath, JSON.stringify(this, null, 2), 'utf-8');
	}

	static fromJSON(json: any) {
		const cfg = new Config(json.system, json.arch, json.backend, json.version, json.branding);
		if (isNode) {
			import('node:os').then(({ totalmem }) => {
				cfg.memory = totalmem() / 1000000;
			});
		}
		return cfg;
	}

	static blank() {
		return new Config(OperatingSystem.Other, MachineArchitecture.x64, { port: 6502 }, 'Minopanel');
	}
}

export interface BackendOptions {
	port: number;
}

export class FrontendConfig {
	webPath: string
	binPath: string
	scriptPath: string
	configPath: string
	version: string
	webConfigPath: string
	system: OperatingSystem
	port: number
	backendHost: string
	backendProtocoll: string
	backendPort: number

	constructor(system: OperatingSystem, port: number, backendHost: string, backendProtocoll: string, backendPort: number, version: string) {
		this.port = port
		this.system = system
		this.backendHost = backendHost
		this.backendProtocoll = backendProtocoll
		this.backendPort = backendPort
		this.version = version
		if (system === OperatingSystem.Linux) {
			this.webPath = "/var/lib/minopanel/web"
			this.binPath = "/usr/bin/minowebd"
			this.scriptPath = "/var/lib/minopanel/bin/minowebd.cjs"
			this.configPath = "/etc/minopanel.d/web.conf.json"
			this.webConfigPath = "/var/lib/minopanel/web/conf.json"
		} else {
			this.webPath = "."
			this.binPath = "."
			this.scriptPath = "."
			this.configPath = "."
			this.webConfigPath = "."
		}
	}

	async writeToFile() {
		if (!isNode) {
			throw new Error('not a nodejs enviroment');
		}

		const { writeFile } = await import('node:fs/promises');
		await writeFile(this.configPath, JSON.stringify(this, null, 2), 'utf-8');
	}

	async writeForFrontend() {
		if (!isNode) {
			throw new Error('not a nodejs enviroment');
		}

		const { writeFile } = await import('node:fs/promises');
		await writeFile(this.webConfigPath, JSON.stringify(this, null, 2), 'utf-8');
	}

	static fromJSON(json: any) {
		const cfg = new FrontendConfig(json.system, json.port, json.backendHost, json.backendProtocoll, json.backendPort, json.version);
		return cfg;
	}
}

export class CLIConfig {
	backendHost: string
	backendProtocoll: string
	backendPort: number
	system: OperatingSystem
	arch: MachineArchitecture
	binPath: string
	scriptPath: string
	configPath: string
	version: string
	constructor(system: OperatingSystem, arch: MachineArchitecture, backendHost: string, backendProtocoll: string, backendPort: number, version: string) {
		this.system = system
		this.arch = arch
		this.backendHost = backendHost
		this.backendPort = backendPort
		this.backendProtocoll = backendProtocoll
		this.version = version
		if(system === OperatingSystem.Linux) {
			this.binPath = "/usr/bin/minoctl"
			this.scriptPath = "/var/lib/minopanel/bin/minoctl.cjs"
			this.configPath = "/etc/minopanel.d/cli.conf.json"
		} else {
			this.binPath = ""
			this.scriptPath = ""
			this.configPath = ""
		}
	}
	async writeToFile() {
		if (!isNode) {
			throw new Error('not a nodejs enviroment');
		}

		const { writeFile } = await import('node:fs/promises');
		await writeFile(this.configPath, JSON.stringify(this, null, 2), 'utf-8');
	}

	static fromJSON(json: any) {
		const cfg = new CLIConfig(json.system, json.arch, json.backendHost, json.backendProtocoll, json.backendPort, json.version);
		return cfg;
	}
}