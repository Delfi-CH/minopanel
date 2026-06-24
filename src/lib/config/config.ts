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
	memory: number = 0

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
		this.memory = totalmem() / 1000000

		await writeFile(this.paths.serverConfigPath, JSON.stringify(this, null, 2), 'utf-8');
	}

	static fromJSON(json: any) {
		const cfg = new Config(json.system, json.arch, json.backend, json.version, json.branding);
		if (isNode) {
			import("node:os").then(({ totalmem })=> {
				cfg.memory = totalmem() / 1000000
			})
		}
		return cfg
	}

	static blank() {
		return new Config(OperatingSystem.Other, MachineArchitecture.x64, { port: 6502 }, 'Minopanel');
	}
}

export interface BackendOptions {
	port: number;
}
