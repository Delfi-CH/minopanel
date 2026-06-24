import { OperatingSystem } from '../system.js';
import isNode from 'is-node';

export class ApplicatonPaths {
	serverConfigPath: string = '.';
	cliConfigPath: string = '.';

	mcServerDirectory: string = '.';
	mcServerMetadataDirectory: string = '.';

	jdkDirectory: string = '.';
	jdkMetadataDirectory: string = '.';
	jdkSelfTestCodePath: string = '.';

	cliBinaryPath: string = '.';
	cliScriptPath: string = '.';
	serverBinaryPath: string = '.';
	serverScriptPath: string = '.';
	frontendDirectory: string = '.';
	frontendBinaryPath: string = '.';
	frontendScriptPath: string = '.';
	webSystemdServicePath: string = '.';
	serverSystemdServicePath: string = '.';

	tmpPath: string = '.';

	constructor(system: OperatingSystem) {
		if (system === OperatingSystem.Linux) {
			this.serverConfigPath = `/etc/minopanel.d/server.conf.json`;
			this.cliConfigPath = `/etc/minopanel.d/cli.conf.json`;
			this.mcServerDirectory = `/var/lib/minopanel/bin/servers`;
			this.mcServerMetadataDirectory = `/var/lib/minopanel/data/servers`;
			this.jdkDirectory = `/var/lib/minopanel/bin/java`;
			this.jdkMetadataDirectory = `/var/lib/minopanel/data/java`;
			this.jdkSelfTestCodePath = `/var/lib/minopanel/data/java`;
			this.cliBinaryPath = `/usr/bin/minoctl`;
			this.cliScriptPath = `/var/lib/minopanel/bin/minoctl.cjs`
			this.serverBinaryPath = `/usr/bin/minopaneld`;
			this.serverScriptPath = `/var/lib/minopanel/bin/minopaneld.cjs`
			this.frontendBinaryPath = '/usr/bin/minowebd';
			this.frontendScriptPath = '/var/lib/minopanel/bin/minowebd.cjs';
			this.frontendDirectory = `/var/lib/minopanel/web`;
			this.webSystemdServicePath = `/usr/lib/systemd/system/minoweb.service`;
			this.serverSystemdServicePath = `/usr/lib/systemd/system/minopanel.service`;
			this.tmpPath = '/tmp';
		} else if (system === OperatingSystem.Windows) {
			this.serverConfigPath = '.';
			this.cliConfigPath = '.';
			this.mcServerDirectory = '.';
			this.mcServerMetadataDirectory = '.';
			this.jdkDirectory = '.';
			this.jdkMetadataDirectory = '.';
			this.jdkSelfTestCodePath = '.';
			this.cliBinaryPath = '.';
			this.cliScriptPath = '.';
			this.serverBinaryPath = '.';
			this.serverScriptPath = '.';
			this.frontendBinaryPath = '.';
			this.frontendScriptPath = '.';
			this.frontendDirectory = '.';
			this.tmpPath = '.';
		} else {
			this.serverConfigPath = '.';
			this.cliConfigPath = '.';
			this.mcServerDirectory = '.';
			this.mcServerMetadataDirectory = '.';
			this.jdkDirectory = '.';
			this.jdkMetadataDirectory = '.';
			this.jdkSelfTestCodePath = '.';
			this.cliBinaryPath = '.';
			this.cliScriptPath = '.';
			this.serverBinaryPath = '.';
			this.serverScriptPath = '.';
			this.frontendBinaryPath = '.';
			this.frontendScriptPath = '.';
			this.frontendDirectory = '.';
			this.tmpPath = '.';
		}
	}

	async check(): Promise<boolean> {
		if (isNode) {
			const fs = await import('node:fs/promises');
			try {
				await fs.access(this.serverConfigPath);
				await fs.access(this.cliConfigPath);
				await fs.access(this.mcServerDirectory);
				await fs.access(this.mcServerMetadataDirectory);
				await fs.access(this.jdkDirectory);
				await fs.access(this.jdkMetadataDirectory);
				await fs.access(this.cliBinaryPath);
				await fs.access(this.serverBinaryPath);
				await fs.access(this.frontendDirectory);
				await fs.access(this.tmpPath);
				if (this.systemdServicePath !== '.') {
					await fs.access(this.systemdServicePath);
					return true;
				}
				return true;
			} catch {
				return false;
			}
		} else {
			return false;
		}
	}

	async init(): Promise<boolean> {
		if (isNode) {
			const fs = await import('node:fs/promises');
			try {
				await fs.mkdir(this.mcServerDirectory, {
					recursive: true
				});
				await fs.mkdir(this.mcServerMetadataDirectory, {
					recursive: true
				});
				await fs.mkdir(this.jdkDirectory, {
					recursive: true
				});
				await fs.mkdir(this.jdkMetadataDirectory, {
					recursive: true
				});
				await fs.mkdir(this.frontendDirectory, {
					recursive: true
				});
				return true;
			} catch {
				return false;
			}
		} else {
			return false;
		}
	}

	static toFancyStrings(paths: ApplicatonPaths) {
		let list: string[] = [];

		list = [...list, `Server Configuration File: ${paths.serverConfigPath}`];
		list = [...list, `CLI Configuration File: ${paths.cliConfigPath}`];
		list = [...list, `Minecraft Server Directory: ${paths.mcServerDirectory}`];
		list = [...list, `Minecraft Server Metadata Directory: ${paths.mcServerMetadataDirectory}`];
		list = [...list, `Java Installation Directory: ${paths.jdkDirectory}`];
		list = [...list, `Java Metadata Directory: ${paths.jdkMetadataDirectory}`];
		list = [...list, `CLI Binary: ${paths.cliBinaryPath}`];
		list = [...list, `Server Binary: ${paths.serverBinaryPath}`];
		list = [...list, `WebUI Directory: ${paths.frontendDirectory}`];
		list = [...list, `OS Temporary Directory: ${paths.tmpPath}`];
		if (paths.systemdServicePath !== '.') {
			list = [...list, `systemd Service File: ${paths.systemdServicePath}`];
		}

		return list;
	}
}
