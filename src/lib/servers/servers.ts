/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import isNode from 'is-node';
import { CorretoOpenJDK, JavaVersion } from '../jvm/java';
import { ApplicatonPaths } from '../config/paths';
import { webDownloadManager } from '$lib/download/web';
import type { DownloadManager } from '$lib/download/server';
import { OperatingSystem } from '$lib/system';

class MCServer {
	name: string;
	mcVersion: string;
	modloader: Modloader;
	preferedJavaVersion: JavaVersion;
	serverExecutableFilePath?: string = '';
	serverExecutableArgs?: string[] = [];
	serverPropertiesFilePath?: string = '';
	serverDirectory?: string = '';
	properties?: object;
	memoryMin: string;
	memoryMax: string;
	running: boolean;
	installed: boolean;
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
		this.running = false;
		this.installed = false;
	}

	static fromJSON(json: any) {
		const srv = new MCServer(json.name, json.mcVersion, json.modloader, json.preferedJavaVersion);
		srv.serverExecutableFilePath = json.serverExecutableFilePath;
		srv.serverDirectory = json.serverDirectory;
		srv.serverPropertiesFilePath = json.serverPropertiesFilePath;
		srv.memoryMin = json.memoryMin;
		srv.memoryMax = json.memoryMax;
		srv.running = json.running;
		srv.serverExecutableArgs = json.serverExecutableArgs;
		srv.installed = json.installed;
		srv.properties = json.properties;
		return srv;
	}

	async writeToDisk(paths: ApplicatonPaths) {
		if (isNode) {
			const { writeFile } = await import('node:fs/promises');
			const filepath = paths.mcServerMetadataDirectory + '/' + this.name + '.json';
			await writeFile(filepath, JSON.stringify(this), 'utf8');
		} else {
			throw new Error('not a nodejs enviroment');
		}
	}

	installFiles(paths: ApplicatonPaths) {
		const id = 'Server ' + this.name;
		if (!this.modloader.url) {
			throw new Error('no url!');
		}
		let filename = 'server.jar';
		if (this.modloader.type === ModloaderType.Forge) {
			filename = 'forge-installer.jar';
		} else if (this.modloader.type === ModloaderType.NeoForge) {
			filename = 'neoforge-installer.jar';
		} else if (this.modloader.type === ModloaderType.Fabric) {
			filename = 'fabric-installer.jar';
		}
		webDownloadManager.addDownload({
			id: id,
			url: this.modloader.url,
			path: paths.mcServerDirectory + '/' + this.name,
			filename: filename
		});
		webDownloadManager.startDownloadSilent(id);
	}

	async installFilesNode(paths: ApplicatonPaths, manager: DownloadManager) {
		const { mkdir } = await import('node:fs/promises');
		const id = 'Server ' + this.name;
		if (!this.modloader.url) {
			throw new Error('no url!');
		}
		let filename = 'server.jar';
		if (this.modloader.type === ModloaderType.Forge) {
			filename = 'forge-installer.jar';
		} else if (this.modloader.type === ModloaderType.NeoForge) {
			filename = 'neoforge-installer.jar';
		} else if (this.modloader.type === ModloaderType.Fabric) {
			filename = 'fabric-installer.jar';
		}
		await mkdir(paths.mcServerDirectory + '/' + this.name, { recursive: true });
		manager.addDownload({
			id: id,
			url: this.modloader.url,
			path: paths.mcServerDirectory + '/' + this.name,
			filename: filename
		});
		await manager.startDownload(id);
	}

	async runSetup(paths: ApplicatonPaths, java: CorretoOpenJDK) {
		if (isNode) {
			const { writeFile, readFile } = await import('node:fs/promises');
			const { spawn } = await import('node:child_process');
			const { once } = await import('node:events');
			const { DownloaderHelper } = await import('node-downloader-helper');
			const eulaPath = paths.mcServerDirectory + '/' + this.name + '/eula.txt';
			await writeFile(eulaPath, 'eula=true', 'utf8');
			if (this.modloader.type === ModloaderType.Forge) {
				const installer = spawn(
					java.pathOnDisk + '/bin/java',
					[
						'-jar',
						paths.mcServerDirectory + '/' + this.name + '/forge-installer.jar',
						'--installServer'
					],
					{
						cwd: paths.mcServerDirectory + '/' + this.name,
						stdio: ['ignore', 'ignore', 'ignore']
					}
				);
				const [code] = await once(installer, 'close');
				if (code !== 0) {
					throw new Error('installation failed!');
				}
				this.serverPropertiesFilePath =
					paths.mcServerDirectory + '/' + this.name + '/server.properties';
				this.serverExecutableFilePath =
					java.system === OperatingSystem.Windows
						? paths.mcServerDirectory + '/' + this.name + '/run.bat'
						: paths.mcServerDirectory + '/' + this.name + '/run.sh';
				const userJvmArgs = [`-Xmx${this.memoryMax}`, `-Xms${this.memoryMin}`];
				const seperator = java.system === OperatingSystem.Windows ? '\r\n' : '\n';
				await writeFile(
					paths.mcServerDirectory + '/' + this.name + '/user_jvm_args.txt',
					userJvmArgs.join(seperator),
					'utf-8'
				);
				this.serverExecutableArgs = ['nogui'];
			} else if (this.modloader.type === ModloaderType.NeoForge) {
				const installer = spawn(
					java.pathOnDisk + '/bin/java',
					[
						'-jar',
						paths.mcServerDirectory + '/' + this.name + '/neoforge-installer.jar',
						'--installServer',
						paths.mcServerDirectory + '/' + this.name
					],
					{ cwd: paths.mcServerDirectory + '/' + this.name, stdio: ['ignore', 'ignore', 'ignore'] }
				);

				const [code] = await once(installer, 'close');
				if (code !== 0) {
					throw new Error('installation failed!');
				}
				this.serverPropertiesFilePath =
					paths.mcServerDirectory + '/' + this.name + '/server.properties';
				this.serverExecutableFilePath =
					java.system === OperatingSystem.Windows
						? paths.mcServerDirectory + '/' + this.name + '/run.bat'
						: paths.mcServerDirectory + '/' + this.name + '/run.sh';
				const userJvmArgs = [`-Xmx${this.memoryMax}`, `-Xms${this.memoryMin}`];
				const seperator = java.system === OperatingSystem.Windows ? '\r\n' : '\n';
				await writeFile(
					paths.mcServerDirectory + '/' + this.name + '/user_jvm_args.txt',
					userJvmArgs.join(seperator),
					'utf-8'
				);
				this.serverExecutableArgs = ['nogui'];

				// Patching neoforge run.sh to actually show stdout/stderr
				let runsh = await readFile(paths.mcServerDirectory + '/' + this.name + '/run.sh', 'utf8');
				runsh = runsh.replace('exec', '');
				await writeFile(paths.mcServerDirectory + '/' + this.name + '/run.sh', runsh, 'utf-8');
			} else if (this.modloader.type === ModloaderType.Fabric) {
				const installer = spawn(
					java.pathOnDisk + '/bin/java',
					[
						'-jar',
						paths.mcServerDirectory + '/' + this.name + '/fabric-installer.jar',
						'server',
						'-mcversion',
						this.mcVersion,
						'-dir',
						paths.mcServerDirectory + '/' + this.name
					],
					{ stdio: ['ignore', 'ignore', 'ignore'] }
				);
				const [code] = await once(installer, 'close');
				if (code !== 0) {
					throw new Error('installation failed!');
				}
				const tmpVanilla = new Modloader(ModloaderType.Vanilla, this.mcVersion);
				await tmpVanilla.buildURL();

				if (!tmpVanilla.url) {
					throw new Error('no url.');
				}

				const dl = new DownloaderHelper(tmpVanilla.url, paths.mcServerDirectory + '/' + this.name);
				await dl.start();
				dl.on('error', (err) => {
					throw err;
				});
				dl.on('end', () => {
					return;
				});
				this.serverPropertiesFilePath =
					paths.mcServerDirectory + '/' + this.name + '/server.properties';
				this.serverExecutableFilePath =
					paths.mcServerDirectory + '/' + this.name + '/fabric-server-launch.jar';
				this.serverExecutableArgs = [
					`-Xmx${this.memoryMax}`,
					`-Xms${this.memoryMin}`,
					'-jar',
					this.serverExecutableFilePath,
					'nogui'
				];
			} else {
				this.serverPropertiesFilePath =
					paths.mcServerDirectory + '/' + this.name + '/server.properties';
				this.serverExecutableFilePath = paths.mcServerDirectory + '/' + this.name + '/server.jar';
				this.serverExecutableArgs = [
					`-Xmx${this.memoryMax}`,
					`-Xms${this.memoryMin}`,
					'-jar',
					this.serverExecutableFilePath,
					'nogui'
				];
			}

			this.installed = true;
			this.serverDirectory = paths.mcServerDirectory + '/' + this.name;
			await this.writeToDisk(paths);
		} else {
			throw new Error('not a nodejs enviroment');
		}
	}
	async readProperties() {
		try {
			const { readIni } = await import('@delfi-ch/ini.js/fs');
			if (!this.serverPropertiesFilePath) {
				this.properties = {};
				return;
			}
			const props = await readIni(this.serverPropertiesFilePath);
			this.properties = props;
			return;
		} catch (err) {
			console.error('Could not read ini file: ' + err);
			this.properties = {};
			return;
		}
	}

	async updateProperties(props: object) {
		try {
			const { writeIni } = await import('@delfi-ch/ini.js/fs');
			if (!this.serverPropertiesFilePath) {
				this.properties = {};
				return;
			}
			this.properties = props;
			await writeIni(this.serverPropertiesFilePath, props);
		} catch (err) {
			console.error('Could not write ini file: ' + err);
			this.properties = {};
			return;
		}
	}
}

class Modloader {
	type: ModloaderType;
	gameVersion: string;
	modloaderVersion?: string;
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
				(ver: any) => ver.id === this.gameVersion
			);
			const packageManifest = await axios.get(manifestVersion.url);
			this.url = packageManifest.data.downloads.server.url;
			this.modloaderVersion = this.gameVersion;
			this.sha1sum = packageManifest.data.downloads.server.sha1;
		} else if (this.type === ModloaderType.Paper) {
			const version = versions.find((ver: string) => ver === this.gameVersion);
			const res = await axios.get(
				`https://fill.papermc.io/v3/projects/paper/versions/${version}/builds`
			);
			const latestBuild = res.data[0];
			this.url = latestBuild.downloads['server:default'].url;
			this.modloaderVersion = latestBuild.downloads['server:default'].name.slice(0, -4);
			this.sha256sum = latestBuild.downloads['server:default'].checksums.sha256;
		} else if (this.type === ModloaderType.Folia) {
			const version = versions.find((ver: string) => ver === this.gameVersion);
			const res = await axios.get(
				`https://fill.papermc.io/v3/projects/folia/versions/${version}/builds`
			);
			const latestBuild = res.data[0];
			this.modloaderVersion = latestBuild.downloads['server:default'].name.slice(0, -4);
			this.url = latestBuild.downloads['server:default'].url;
			this.sha256sum = latestBuild.downloads['server:default'].checksums.sha256;
		} else if (this.type === ModloaderType.Forge) {
			const metadata = await axios.get(
				`http://${window.location.hostname}:6502/api/proxy/forge-metadata`
			);
			const versionBase = metadata.data[this.gameVersion].reverse()[0];
			this.modloaderVersion = versionBase.replace(this.gameVersion + '-', '');
			this.url = `https://maven.minecraftforge.net/net/minecraftforge/forge/${versionBase}/forge-${versionBase}-installer.jar`;
			const shaRes = await axios.get(this.url + '.sha256');
			this.sha256sum = shaRes.data;
		} else if (this.type === ModloaderType.NeoForge) {
			const metadata = await axios.get(
				'https://maven.neoforged.net/api/maven/versions/releases/net/neoforged/neoforge'
			);
			const neoforgeVersions = metadata.data.versions;
			let compatibleNeoforgeVersions: string[] = [];
			neoforgeVersions.forEach((v: string) => {
				// Remove 0.25w14craftmine and other april fools versions
				if (v.startsWith('0')) return;
				if (v.includes('+')) return;
				const mcVer = getMcVersionFromNeoForgeVersion(v);
				if (mcVer === this.gameVersion) {
					compatibleNeoforgeVersions = [...compatibleNeoforgeVersions, v];
				}
			});
			this.modloaderVersion = compatibleNeoforgeVersions.reverse()[0];
			this.url = `https://maven.neoforged.net/releases/net/neoforged/neoforge/${this.modloaderVersion}/neoforge-${this.modloaderVersion}-installer.jar`;
			const shaRes = await axios.get(
				`http://${window.location.hostname}:6502/api/proxy/neoforge-maven/sha256/` +
					this.modloaderVersion
			);
			this.sha256sum = shaRes.data;
		} else if (this.type === ModloaderType.Fabric) {
			this.modloaderVersion = 'latest';
			this.url =
				'https://maven.fabricmc.net/net/fabricmc/fabric-installer/1.1.1/fabric-installer-1.1.1.jar';
			const shaRes = await axios.get(this.url + '.sha256');
			this.sha256sum = shaRes.data;
		} else {
			this.url = '/';
		}
	}

	static async getSupportedMCVersions(type: ModloaderType) {
		if (type === ModloaderType.Vanilla) {
			const manifest = await axios.get(
				'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'
			);
			const versions: Array<string> = [];
			manifest.data.versions.map((v: any) => {
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
			const metadata = await axios.get(
				`http://${window.location.hostname}:6502/api/proxy/forge-metadata`
			);
			let versions = Object.keys(metadata.data);
			const reallyOldVersions = /^1\.[1-4](\.[0-9])?$/m;
			versions = versions.map((v) => {
				if (!v.includes('_') && !reallyOldVersions.test(v)) {
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
				if (v.includes('+')) return;
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
			manifest.data.versions.map((v: any) => {
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

		const jdkList: JavaVersion[] = [];
		if (java8Regex.test(version)) {
			jdkList.push(JavaVersion.OpenJdk8);
		}
		if (java17Regex.test(version)) {
			jdkList.push(JavaVersion.OpenJdk17);
		}
		if (java21Regex.test(version)) {
			jdkList.push(JavaVersion.OpenJdk21);
		}
		if (java25Regex.test(version)) {
			jdkList.push(JavaVersion.OpenJdk25);
		}
		if (java26Regex.test(version)) {
			jdkList.push(JavaVersion.OpenJdk26);
		}
		return jdkList;
	}
}

enum ModloaderType {
	Vanilla = 'Vanilla',
	Forge = 'Forge',
	NeoForge = 'NeoForge',
	Fabric = 'Fabric',
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
