import type { ApplicatonPaths } from '$lib/config/paths';
import { webDownloadManager } from '$lib/download/web';
import { ModloaderType } from '$lib/servers/servers';
import axios from 'axios';

const modrinthBaseUrl = 'https://api.modrinth.com/v2';
export const resultsPerPage = 5;

export interface ModrinthQueryOptions {
	modloader: ModloaderType;
	gameVersion?: string;
	query?: string;
	offset?: number;
}

export interface ModrinthVersionQueryOptions {
	project: string;
	modloader: ModloaderType;
	gameVersion?: string;
}

export async function getAllTheMods(options: ModrinthQueryOptions) {
	let ml = '';
	let type = 'mod';
	switch (options.modloader) {
		case ModloaderType.Vanilla:
			break;
		case ModloaderType.Forge:
			ml = 'forge';
			break;
		case ModloaderType.NeoForge:
			ml = 'neoforge';
			break;
		case ModloaderType.Fabric:
			ml = 'fabric';
			break;
		case ModloaderType.Paper:
			ml = 'paper';
			type = 'plugin';
			break;
		case ModloaderType.Folia:
			ml = 'folia';
			type = 'plugin';
			break;
	}
	const versionString = options.gameVersion ? `["versions:${options.gameVersion}"],` : '';
	const queryString = options.query ? `&query=${options.query}` : '';
	const offsetString = options.offset ? `&offset=${options.offset}` : '';
	const queryUrl = `${modrinthBaseUrl}/search?facets=[["project_type:${type}"],${versionString}["categories:${ml}"],["server_side!=unsupported"]]&limit=${resultsPerPage}${queryString}${offsetString}`;
	const res = await axios.get(queryUrl);
	return res.data;
}

export async function getModVersions(options: ModrinthVersionQueryOptions) {
	let ml = '';
	switch (options.modloader) {
		case ModloaderType.Vanilla:
			break;
		case ModloaderType.Forge:
			ml = 'forge';
			break;
		case ModloaderType.NeoForge:
			ml = 'neoforge';
			break;
		case ModloaderType.Fabric:
			ml = 'fabric';
			break;
		case ModloaderType.Paper:
			ml = 'paper';
			break;
		case ModloaderType.Folia:
			ml = 'folia';
			break;
	}
	const mlString = `&loaders=["${ml}"]`;
	const versionString = options.gameVersion ? `&game_versions=["${options.gameVersion}"]` : '';
	const queryUrl = `${modrinthBaseUrl}/project/${options.project}/version?include_changelog=false${mlString}${versionString}`;
	const res = await axios.get(queryUrl);
	return res.data;
}

export function downloadMod(
	paths: object,
	serverName: string,
	file: object,
	modloader: ModloaderType
) {
	const finalPath =
		paths.mcServerDirectory +
		`/${serverName}/` +
		(modloader === ModloaderType.Paper || modloader === ModloaderType.Folia ? 'plugins/' : 'mods/');
	const filename = file.filename;
	const url = file.url;
	const id = String(Math.floor(Math.random() * 100));
	webDownloadManager.addDownload({
		id: id,
		url: url,
		path: finalPath,
		filename: filename
	});
	webDownloadManager.startDownloadSilent(id);
}
