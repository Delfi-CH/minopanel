import axios from 'axios';

class MCServer {
	id: number;
	name: string;
	mcVersion: string;
	modloader: Modloader;
	constructor(id: number, name: string, mcVersion: string, modloader: Modloader) {
		this.id = id
		this.name = name
		this.mcVersion = mcVersion
		this.modloader = modloader
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

export { MCServer, Modloader, ModloaderType };
