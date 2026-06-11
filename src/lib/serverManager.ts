import axios from 'axios';
import isNode from 'is-node';
import { JavaVersion } from './jvm/java';
import { ApplicatonPaths } from './config/paths';
import type { OperatingSystem } from './system';

class MCServer {
	name: string;
	mcVersion: string;
	modloader: Modloader;
	preferedJavaVersion: JavaVersion;
	serverExecutableFilePath?: string = '';
	serverPropertiesFilePath?: string = '';
	memoryMin: string;
	memoryMax: string;
	constructor(
		name: string,
		mcVersion: string,
		modloader: Modloader,
		preferedJavaVersion: JavaVersion,
		memoryMin?: string,
		memoryMax?: string
	) {
		this.name = name;
		this.mcVersion = mcVersion;
		this.modloader = modloader;
		this.preferedJavaVersion = preferedJavaVersion;
		this.memoryMin = memoryMin ?? '1G';
		this.memoryMax = memoryMax ?? '4G';
	}

	static fromJSON(json: object) {
		const srv = new MCServer(json.name, json.mcVersion, json.modloader, json.preferedJavaVersion);
		srv.serverExecutableFilePath = json.serverExecutableFilePath;
		srv.serverExecutableFilePath = json.serverPropertiesFilePath;
		srv.memoryMin = json.memoryMin;
		srv.memoryMax = json.memoryMax;
		return srv;
	}

	async writeToDisk(system: OperatingSystem) {
		if (isNode) {
			const { writeFile } = await import('node:fs/promises');
			const paths = new ApplicatonPaths(system);
			const filepath = paths.mcServerMetadataDirectory + '/' + this.name + '.json';
			await writeFile(filepath, JSON.stringify(this), 'utf8');
		} else {
			throw new Error('not a nodejs enviroment');
		}
	}
}

class Modloader {
	type: ModloaderType;
	gameVersion: string;
	url?: string;
	sha1sum?: string;
	sha256sum?: string;
	constructor(type: ModloaderType, gameVersion: string) {
		this.type = type;
		this.gameVersion = gameVersion;
	}

	async buildURL() {
		const versions = await Modloader.getSupportedMCVersions(this.type);
		if (this.type === ModloaderType.Vanilla) {
			const manifest = await axios.get(
				'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'
			);
			const manifestVersion = manifest.data.versions.find(
				(ver: object) => ver.id === this.gameVersion
			);
			const packageManifest = await axios.get(manifestVersion.url);
			this.url = packageManifest.data.downloads.server.url;
			this.sha1sum = packageManifest.data.downloads.server.sha1;
		} else if (this.type === ModloaderType.Paper) {
			const version = versions.find((ver: string) => ver === this.gameVersion);
			const res = await axios.get(
				`https://fill.papermc.io/v3/projects/paper/versions/${version}/builds`
			);
			const latestBuild = res.data[0];
			this.url = latestBuild.downloads['server:default'].url;
			this.sha256sum = latestBuild.downloads['server:default'].checksums.sha256;
		} else if (this.type === ModloaderType.Folia) {
			const version = versions.find((ver: string) => ver === this.gameVersion);
			const res = await axios.get(
				`https://fill.papermc.io/v3/projects/folia/versions/${version}/builds`
			);
			const latestBuild = res.data[0];
			this.url = latestBuild.downloads['server:default'].url;
			this.sha256sum = latestBuild.downloads['server:default'].checksums.sha256;
		}
	}

	static async getSupportedMCVersions(type: ModloaderType) {
		if (type === ModloaderType.Vanilla) {
			const manifest = await axios.get(
				'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'
			);
			const versions: Array<string> = [];
			manifest.data.versions.map((v) => {
				if (v.type === 'release') {
					versions.push(v.id);
				}
			});
			return versions;
		} else if (type === ModloaderType.Paper) {
			const fill = await axios.get('https://fill.papermc.io/v3/projects/paper');
			let versions: string[] = [];
			Object.entries(fill.data.versions).forEach((element) => {
				const spliced: string[] = element
					.toSpliced(0, 1)
					.flat()
					.map((version) => {
						if (String(version).includes('-')) {
							return '';
						}
						return String(version);
					});
				versions = [...versions, ...spliced];
			});
			versions = [...new Set(versions)];
			if (versions.includes('')) {
				versions = versions.toSpliced(versions.indexOf(''), 1);
			}
			return versions;
		} else if (type === ModloaderType.Folia) {
			const fill = await axios.get('https://fill.papermc.io/v3/projects/folia');
			let versions: string[] = [];
			Object.entries(fill.data.versions).forEach((e) => {
				const spliced: string[] = e
					.toSpliced(0, 1)
					.flat()
					.map((version) => {
						if (String(version).includes('-')) {
							return '';
						}
						return String(version);
					});
				versions = [...versions, ...spliced];
			});
			versions = [...new Set(versions)];
			if (versions.includes('')) {
				versions = versions.toSpliced(versions.indexOf(''), 1);
			}
			return versions;
		} else if (type === ModloaderType.Forge) {
			const metadata = await axios.get('http://localhost:6502/api/proxy/forge-metadata');
			let versions = Object.keys(metadata.data);
			versions = versions.map((v) => {
				if (!v.includes('_')) {
					return v;
				} else {
					return '';
				}
			});
			versions = [...new Set(versions)];
			if (versions.includes('')) {
				versions = versions.toSpliced(versions.indexOf(''), 1);
			}
			return versions;
		} else if (type === ModloaderType.NeoForge) {
			const metadata = await axios.get(
				'https://maven.neoforged.net/api/maven/versions/releases/net/neoforged/neoforge'
			);
			const neoforgeVersions = metadata.data.versions;
			let versions: string[] = [];
			neoforgeVersions.forEach((v: string) => {
				// Remove 0.25w14craftmine and other april fools versions
				if (v.startsWith('0')) return;
				if (v.includes('-')) return;
				versions = [...versions, getMcVersionFromNeoForgeVersion(v)];
			});
			versions = [...new Set(versions)];
			return versions;
		} else if (type === ModloaderType.Fabric) {
			const newVersionRegex = /^[2-9][0-9]\.[1-9](\.[1-9])?$/gm;
			const oldVersionRegex = /^1\.(1[4-9]|2[0-9])(\.[1-9]+)?$/gm;
			const manifest = await axios.get(
				'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'
			);
			const versions: Array<string> = [];
			manifest.data.versions.map((v) => {
				if (newVersionRegex.test(v.id) || oldVersionRegex.test(v.id)) {
					versions.push(v.id);
				}
			});
			return versions;
		} else if (type === ModloaderType.Quilt) {
			const newVersionRegex = /^[2-9][0-9]\.[1-9](\.[1-9])?$/gm;
			const oldVersionRegex = /^1\.(14.4|1[5-9]|2[0-9])(\.[1-9]+)?$/gm;
			const manifest = await axios.get(
				'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'
			);
			const versions: Array<string> = [];
			manifest.data.versions.map((v) => {
				if (newVersionRegex.test(v.id) || oldVersionRegex.test(v.id)) {
					versions.push(v.id);
				}
			});
			return versions;
		} else {
			return [];
		}
	}

	static getSupportedJavaVersions(version: string) {
		const java8Regex = /^1\.([0-9](\.[0-9]+)?|1[0-6](\.[0-9])?)$/;
		const java17Regex = /^1.(([0-9](\.[0-9]+)?)|(1[1-9](\.[0-9]+)?)|(20(\.[0-4]+)?))$/;
		const java21Regex = /^1\.[0-9]+(\.[0-9]+)?$/;
		const java25Regex = /^((1\.[0-9]+(\.[0-9]+)?)|([2-9][0-9]\.[1-9](\.[1-9])?))$/;
		const java26Regex = /^((1\.[0-9]+(\.[0-9]+)?)|([2-9][0-9]\.[1-9](\.[1-9])?))$/;

		let jdkList: JavaVersion[] = [];
		if (java8Regex.test(version)) {
			jdkList = [...jdkList, JavaVersion.OpenJdk8];
		}
		if (java17Regex.test(version)) {
			jdkList = [...jdkList, JavaVersion.OpenJdk17];
		}
		if (java21Regex.test(version)) {
			jdkList = [...jdkList, JavaVersion.OpenJdk21];
		}
		if (java25Regex.test(version)) {
			jdkList = [...jdkList, JavaVersion.OpenJdk25];
		}
		if (java26Regex.test(version)) {
			jdkList = [...jdkList, JavaVersion.OpenJdk26];
		}
		return jdkList;
	}
}

enum ModloaderType {
	Vanilla = 'Vanilla',
	Forge = 'Forge',
	NeoForge = 'NeoForge',
	Fabric = 'Fabric',
	Quilt = 'Quilt',
	Paper = 'Paper',
	Folia = 'Folia'
}

export { MCServer, Modloader, ModloaderType };

/* Function taken from
 *  https://github.com/neoforged/websites/blob/main/assets/js/neoforge.js
 *  which is licensed under the CC-BY-4.0 license
 */
function getMcVersionFromNeoForgeVersion(versionString: string) {
	const spl = versionString.split('.');
	// Handle the new versioning scheme first
	if (parseInt(spl[0]) >= 26) {
		// 26.1.0.X -> 26.1
		let mcVersion = spl[0] + '.' + spl[1];
		// 26.1.1.X -> 26.1.1
		if (spl[2] != '0') {
			mcVersion += '.' + spl[2];
		}

		// 26.1.0.0-alpha+snapshot-1
		const splitBySnapshotIdentifier = versionString.split('+');
		if (splitBySnapshotIdentifier.length == 2) {
			mcVersion += '-' + splitBySnapshotIdentifier[1];
		}
		return mcVersion;
	}
	return '1.' + getFirstTwoVersionNumbers(versionString);
}

/* Function taken from
 *  https://github.com/neoforged/websites/blob/main/assets/js/neoforge.js
 *  which is licensed under the CC-BY-4.0 license
 */
function getFirstTwoVersionNumbers(versionString: string) {
	const splitVersion = versionString.split('.');
	return `${splitVersion[0]}.${splitVersion[1]}`;
}
