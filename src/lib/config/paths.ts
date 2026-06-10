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
	serverBinaryPath: string = '.';
	frontendDirectory: string = '.';

	systemdServicePath: string = '.';

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
			this.cliBinaryPath = `/opt/minopanel/minopanelctl`;
			this.serverBinaryPath = `/opt/minopanel/minopaneld`;
			this.frontendDirectory = `/var/www/minopanel`;
			this.systemdServicePath = `/usr/lib/systemd/system/minopanel.service`;
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
			this.serverBinaryPath = '.';
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
			this.serverBinaryPath = '.';
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
}
