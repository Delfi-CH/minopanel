import isNode from 'is-node';
import type { MachineArchitecture, OperatingSystem } from '../system.ts';
import { ApplicatonPaths } from './paths.ts';

export class Config {
	branding: string;
	version: string;
	system: OperatingSystem;
	arch: MachineArchitecture;
	paths: ApplicatonPaths;
	backend: BackendOptions;

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

		await writeFile(this.paths.serverConfigPath, JSON.stringify(this), 'utf-8');
	}

	static async readFromFile(filePath: string) {
		if (!isNode) {
			throw new Error('not a nodejs enviroment');
		}

		const { readFile } = await import('node:fs/promises');

		const content = await readFile(filePath, {
			encoding: 'utf-8'
		});
		return JSON.parse(content);
	}
}

export class BackendOptions {
	port: number;

	constructor(port: number) {
		this.port = port;
	}
}
