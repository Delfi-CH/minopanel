import type { CorretoOpenJDK } from '$lib/jvm/java';
import { MCServer, ModloaderType } from './servers';
import getPort, {clearLockedPorts, portNumbers} from 'get-port';
import * as pty from 'node-pty';

export class ServerManager {
	serverList: Map<string, ActiveServerInstance> = new Map()
	ptyList: Map<string, pty.IPty> = new Map()
 	constructor() {

	}
	addInstance(id: string, instance: ActiveServerInstance) {
		this.serverList.set(id, instance)
	}
	startInstance(id: string) {
		const srv = this.serverList.get(id)
		if (!srv) {
			throw new Error("Server " + id + " not found!")
		}
		if (!srv.pty && !this.ptyList.get(id)) {
			const pty = srv.spawn()
			this.ptyList.set(id, pty)
		} else {
			throw new Error("Server " + id + "is already running!")
		}
	}
}

export class ActiveServerInstance {
	base: MCServer
	port: number = 30000
	java: CorretoOpenJDK
	pty?: pty.IPty | undefined
	constructor(base: MCServer, java: CorretoOpenJDK, port?: number) {
		this.base = base
		this.java = java
		if (port) {
			this.port = port
		} else {
			getPort({port: portNumbers(25565, 25599)}).then((open)=>{
				this.port = open
			}).catch((err)=>{
				console.error("Could not get an open port: " +err)
				console.error("Trying fallback port 30000");
				this.port = 30000
			})
		}
		clearLockedPorts()
	}

	spawn() {
		const bin = this.base.modloader.type === ModloaderType.Forge || this.base.modloader.type === ModloaderType.NeoForge ? this.base.serverExecutableFilePath : this.java.pathOnDisk + "/bin/java"
		if (!bin) {
			throw new Error("Binary is undefined!")
		} else if (!this.base.serverExecutableArgs) {
			throw new Error("Arguments are undefined!")
		}
		console.log("args: " + this.base.serverExecutableArgs)
		this.pty = pty.spawn(bin, this.base.serverExecutableArgs, {
			name: "xterm-color",
			cols: 80,
			rows: 30,
			cwd: this.base.serverDirectory,
			env: {
				...process.env,
				PATH: `${this.java.pathOnDisk}/bin:${process.env.PATH}`
			}
		})
		return this.pty
	}
}