import { ModloaderType } from "$lib/servers/servers";
import axios from "axios";

const modrinthBaseUrl = "https://api.modrinth.com/v2"
export const resultsPerPage = 5

export interface ModrinthQueryOptions {
    modloader: ModloaderType,
    gameVersion?: string
    query?: string
    offset?: number
}

export async function getAllTheMods(options: ModrinthQueryOptions) {
    let ml = "";
    let type = "mod"
    switch (options.modloader) {
        case ModloaderType.Vanilla: 
            break;
        case ModloaderType.Forge:
            ml = "forge"
            break;
        case ModloaderType.NeoForge:
            ml = "neoforge"
            break;
        case ModloaderType.Fabric:
            ml = "fabric"
            break;
        case ModloaderType.Paper:
            ml = "paper"
            type = "plugin"
            break;
        case ModloaderType.Folia:
            ml = "folia"
            type = "plugin"
            break;
    }
    const versionString = options.gameVersion ? `["versions:${options.gameVersion}"],` : ""
    const queryString = options.query ? `&query=${options.query}` : ""
    const offsetString = options.offset ? `&offset=${options.offset}` : ""
    const queryUrl = `${modrinthBaseUrl}/search?facets=[["project_type:${type}"],${versionString}["categories:${ml}"],["server_side!=unsupported"]]&limit=${resultsPerPage}${queryString}${offsetString}`
    const res = await axios.get(queryUrl)
    console.log(res.data)
    return res.data
}
