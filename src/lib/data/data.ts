import { Config } from '$lib/config/config';
import { ApplicatonPaths } from '$lib/config/paths';
import { CorretoOpenJDK, JavaVersion } from '$lib/jvm/java';
import { MCServer } from '$lib/servers/servers';
import { OperatingSystem, MachineArchitecture } from '$lib/system';
import fs from 'node:fs';
import os from 'node:os';
let system: OperatingSystem;
switch (os.platform()) {
	case 'linux':
		system = OperatingSystem.Linux;
		break;
	case 'win32':
		system = OperatingSystem.Windows;
		break;
	default:
		system = OperatingSystem.Other;
		break;
}
let arch: MachineArchitecture;
switch (os.arch()) {
	case 'x64':
		arch = MachineArchitecture.x64;
		break;
	case 'arm64':
		arch = MachineArchitecture.aarch64;
		break;
	default:
		throw new Error('Architecture not supported');
}

export function loadConfig() {
	const paths = new ApplicatonPaths(system);
	try {
		fs.accessSync(paths.serverConfigPath);
		return Config.fromJSON(JSON.parse(fs.readFileSync(paths.serverConfigPath, 'utf8')));
	} catch (err) {
		console.error('Could not load config: ' + err);
		console.log('Using default config...');
		const cfg = new Config(
			system,
			arch,
			{
				port: 6502
			},
			'0.0.1'
		);
		cfg.writeToFile().then();
		return cfg;
	}
}

export function loadJavaFiles(paths: ApplicatonPaths) {
	let jdkList: CorretoOpenJDK[] = [];
	try {
		const files = fs.readdirSync(paths.jdkMetadataDirectory);
		files.forEach((f) => {
			if (f.endsWith('.json')) {
				jdkList = [
					...jdkList,
					CorretoOpenJDK.fromJSON(
						JSON.parse(fs.readFileSync(paths.jdkMetadataDirectory + '/' + f, 'utf8'))
					)
				];
			}
		});
		return jdkList;
	} catch (err) {
		console.error('Failed to read from ' + paths.jdkMetadataDirectory + ': ' + err);
		return [];
	}
}

export function loadJavaFile(paths: ApplicatonPaths, version: JavaVersion) {
	try {
		return CorretoOpenJDK.fromJSON(
			JSON.parse(
				fs.readFileSync(paths.jdkMetadataDirectory + '/openjdk' + version + '.json', 'utf-8')
			)
		);
	} catch (err) {
		console.error(
			`Failed to read file ${paths.jdkMetadataDirectory}/openjdk${version}.json: ${err}`
		);
		return null;
	}
}

export function deleteJavaFile(paths: ApplicatonPaths, version: JavaVersion) {
	try {
		fs.rmSync(paths.jdkMetadataDirectory + '/openjdk' + version + '.json', {
			force: true,
			recursive: false,
			maxRetries: 3,
			retryDelay: 100
		})
	} catch (err) {
		console.error(`Failed to delete file ${paths.jdkMetadataDirectory}/openjdk${version}.json: ${err}`)
		return false
	}
	try {
		fs.rmSync(paths.jdkDirectory + '/openjdk' + version, {
			force: true,
			recursive: true,
			maxRetries: 3,
			retryDelay: 100
		})
	} catch (err) {
		console.error(`Failed to delete directory ${paths.jdkDirectory}/openjdk${version}: ${err}`)
		return false
	}
	return true
}

export function loadServerFiles(paths: ApplicatonPaths) {
	let serverList: MCServer[] = [];
	try {
		const files = fs.readdirSync(paths.mcServerMetadataDirectory);
		files.forEach((f) => {
			if (f.endsWith('.json')) {
				serverList = [
					...serverList,
					MCServer.fromJSON(
						JSON.parse(fs.readFileSync(paths.mcServerMetadataDirectory + '/' + f, 'utf8'))
					)
				];
			}
		});
		return serverList;
	} catch (err) {
		console.error(`Failed to read from ${paths.mcServerMetadataDirectory}: ${err}`);
		return [];
	}
}

export function loadServerFile(paths: ApplicatonPaths, serverName: string) {
	try {
		return CorretoOpenJDK.fromJSON(
			JSON.parse(
				fs.readFileSync(paths.mcServerMetadataDirectory + '/' + serverName + '.json', 'utf-8')
			)
		);
	} catch (err) {
		console.error(
			`Failed to read file ${paths.mcServerMetadataDirectory}/${serverName}.json: ${err}`
		);
		return null;
	}
}
