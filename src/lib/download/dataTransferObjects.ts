import { DownloadCallback } from "./downloader.ts";

export class DownloadDTO {
    type: DownloadDTOType
    data: DownloadDTOInitOptions | DownloadCallback | null
    constructor(type: DownloadDTOType, data: DownloadDTOInitOptions | DownloadCallback | null) {
        this.type = type
        this.data = data
    }
}

export interface DownloadDTOInitOptions {
    downloadURL: string
    downloadPath: string
    downloadFilename: string
}


export enum DownloadDTOType {
    init,
    start,
    status
}