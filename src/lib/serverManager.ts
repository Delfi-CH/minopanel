import axios from 'axios';
import type { JavaVersion } from './jvm/java';

class MCServer {
	id: number;
	name: string;
	mcVersion: string;
	modloader: Modloader;
	preferedJavaVersion: JavaVersion;
	constructor(
		id: number,
		name: string,
		mcVersion: string,
		modloader: Modloader,
		preferedJavaVersion: JavaVersion
	) {
		this.id = id;
		this.name = name;
		this.mcVersion = mcVersion;
		this.modloader = modloader;
		this.preferedJavaVersion = preferedJavaVersion;
	}
}

class Modloader {
	type: ModloaderType;
	version: string;
	url?: string;
	sha1sum?: string;
	constructor(type: ModloaderType, version: string) {
		this.type = type;
		this.version = version;
	}

	async buildURL() {
		if (this.type === ModloaderType.Vanilla) {
			const manifest = await axios.get(
				'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'
			);
			const manifestVersion = manifest.data.versions.find((ver: object) => ver.id === this.version);
			console.log(manifestVersion);
			this.url = manifestVersion.url;
			this.sha1sum = manifestVersion.sha1;
		}
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

async function getMCVersions() {
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
}

export { MCServer, Modloader, ModloaderType, getMCVersions };
