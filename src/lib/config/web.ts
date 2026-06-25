// src/lib/conf.ts
export interface Config {
    backendProtocoll: string;
    backendHost: string;
    backendPort: number;
}

let conf: Config = {
    backendProtocoll: "http",
    backendHost: "localhost",
    backendPort: 6502
};

export async function loadConfig() {
    const res = await fetch('/conf.json');
    conf = await res.json();
}

export function getBackendURL() {
    return `${conf.backendProtocoll}://${conf.backendHost}:${conf.backendPort}`;
}

export function getBackendHost() {
    return `${conf.backendHost}:${conf.backendPort}`
}