import { ApplicatonPaths } from '$lib/config/paths';
import { OperatingSystem, MachineArchitecture } from '$lib/system';
import axios from 'axios';
import isNode from 'is-node';

export enum JavaVersion {
	OpenJdk26 = 26,
	OpenJdk25 = 25,
	OpenJdk21 = 21,
	OpenJdk17 = 17,
	OpenJdk8 = 8
}

export class CorretoOpenJDK {
	name: string;
	version: JavaVersion;
	system: OperatingSystem;
	arch: MachineArchitecture;
	downloadURL: string;
	sha256URL: string;
	fileExtension: string;
	pathOnDisk: string = '';
	selfTestState: string = '';
	constructor(
		name: string,
		version: JavaVersion,
		system: OperatingSystem,
		arch: MachineArchitecture
	) {
		this.name = name;
		this.version = version;
		this.system = system;
		this.arch = arch;
		this.fileExtension = system === OperatingSystem.Windows ? 'zip' : 'tar.gz';
		this.downloadURL = `https://corretto.aws/downloads/latest/amazon-corretto-${version}-${arch}-${system}-jdk.${this.fileExtension}`;
		this.sha256URL = `https://corretto.aws/downloads/latest_sha256/amazon-corretto-${version}-${arch}-${system}-jdk.${this.fileExtension}`;
	}

	static fromJSON(json: any) {
		const jdk = new CorretoOpenJDK(json.name, json.version, json.system, json.arch);
		jdk.pathOnDisk = json.pathOnDisk;
		return jdk;
	}

	async writeToDisk() {
		if (isNode) {
			const { writeFile } = await import('node:fs/promises');
			const paths = new ApplicatonPaths(this.system);
			const filepath = paths.jdkMetadataDirectory + '/openjdk' + this.version + '.json';
			await writeFile(filepath, JSON.stringify(this), 'utf8');
		} else {
			throw new Error('not a nodejs enviroment');
		}
	}

	async selfTest() {
		if (isNode) {
			const { spawn } = await import('node:child_process');
			const { once } = await import('node:events');

			const binPath = this.pathOnDisk + '/bin/java';
			const usedVersion = this.version === JavaVersion.OpenJdk8 ? '1.8' : this.version;
			const selfTestProcess = spawn(binPath, [
				'-cp',
				new ApplicatonPaths(this.system).jdkSelfTestCodePath,
				'SelfTest',
				usedVersion
			]);

			const [code] = await once(selfTestProcess, 'close');
			if (code !== 0) {
				throw new Error('Java Self Test failed!');
			}
		} else {
			throw new Error('not a nodejs enviroment');
		}
	}

	async delete() {
		if (isNode) {
			const { deleteJavaFile } = await import('../data/data');
			if (deleteJavaFile(new ApplicatonPaths(this.system), this.version)) {
				return true;
			} else {
				return false;
			}
		} else {
			await axios.delete('/api/jvm/' + this.version);
		}
	}
}
