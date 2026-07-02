import { ApplicatonPaths } from '$lib/config/paths';
import { LinuxDistribution, OperatingSystem } from '$lib/system';
import { DownloaderHelper } from 'node-downloader-helper';
import {
	intro,
	outro,
	confirm,
	log,
	isCancel,
	cancel,
	select,
	multiselect,
	progress
} from '@clack/prompts';
import linuxOsInfo from '@delfi-ch/linux-os-info-esmodule';
import * as os from 'node:os';
import * as fsPromises from 'node:fs/promises';
import * as childProcess from 'node:child_process';
import { once } from 'node:events';
import axios from 'axios';

const minopanelVersion = "0.0.1"

async function main() {

	intro('minopanel-installer');

	const distro = linuxOsInfo({ mode: 'sync' });
	let system = OperatingSystem.Other;
	let distroName = '';
	let finalOS = LinuxDistribution.other;
	log.info('Determining your operating system...');
	if (distro.type === 'Linux') {
		system = OperatingSystem.Linux;
		distroName = distro.name;
	} else if (distro.type === 'Windows_NT') {
		system = OperatingSystem.Windows;
		distroName = 'Windows NT';
	}

	const isCorrectDistro = await confirm({
		message: `It looks like you are running ${distroName}. Is this correct?`
	});
	handleCancel(isCorrectDistro);

	if (!isCorrectDistro) {
		const opts = Object.values(LinuxDistribution).map((d) => {
			return {
				value: d,
				label: d
			};
		});

		const distroSelect = await select({
			message: 'Select your Operating System',
			options: opts
		});

		handleCancel(distroSelect);
		// @ts-expect-error womp womp
		finalOS = distroSelect;
	}

	if (
		isCorrectDistro &&
		Object.values(LinuxDistribution).includes(distroName as LinuxDistribution)
	) {
		finalOS = distroName as LinuxDistribution;
	} else if (isCorrectDistro) {
		finalOS = LinuxDistribution.other;
	}

	if (finalOS === LinuxDistribution.windows) {
		system = OperatingSystem.Windows;
	}

	log.info(`Operating System was set to ${finalOS}`);

	const paths = new ApplicatonPaths(system);
	paths.tmpPath = os.tmpdir();

	const selectedOptions = await multiselect({
		message: 'Select the components you want to install',
		options: [
			{ value: 'minoctl', label: 'Command-Line interface (minoctl)' },
			{ value: 'minopaneld', label: 'Server (minopaneld)' },
			{ value: 'minowebd', label: 'Web-Interface (minowebd)', hint: 'Reccomended for most users' }
		]
	});

	let installMinoctl = false;
	let installMinopaneld = false;
	let installMinowebd = false;

	handleCancel(selectedOptions);
	selectedOptions.forEach((component) => {
		if (component === 'minoctl') {
			installMinoctl = true;
		} else if (component === 'minopaneld') {
			installMinopaneld = true;
		} else if (component === 'minowebd') {
			installMinowebd = true;
		}
	});

	const buildFromSource = await select({
		message: 'How do you want to install minopanel?',
		options: [
			{ value: 'bin', label: 'Stable Release', hint: 'Reccomended for most users.' },
			{ value: 'nightly', label: 'Nightly Release' },
			{
				value: 'src',
				label: 'Build from Source',
				hint: 'Not reccomended for most users. Do not select this option if you dont know what you are doing.'
			}
		]
	});

	handleCancel(buildFromSource);

	const doBuildFromSource = buildFromSource === 'src' ? true : false;

	const nightly = buildFromSource === 'nightly' ? true : false;

	if (installMinoctl) {
		if (finalOS === LinuxDistribution.archlinux) {
			await runMakepkg('minoctl', doBuildFromSource, nightly);
		} else if (finalOS === LinuxDistribution.debian || finalOS === LinuxDistribution.ubuntu) {
			await installDpkg('minoctl', doBuildFromSource, nightly);
		} else if (finalOS === LinuxDistribution.fedora || finalOS === LinuxDistribution.alma || finalOS === LinuxDistribution.rocky || finalOS === LinuxDistribution.rhel  || finalOS === LinuxDistribution.suse  || finalOS === LinuxDistribution.opensuse)  {
			await installRPM('minoctl', doBuildFromSource, nightly, finalOS);
		} else {
			log.info('No builds available for your operating system...');
			process.exit(0);
		}
	}

	if (installMinopaneld) {
		if (finalOS === LinuxDistribution.archlinux) {
			await runMakepkg('minopaneld', doBuildFromSource, nightly);
		} else if (finalOS === LinuxDistribution.debian || finalOS === LinuxDistribution.ubuntu) {
			await installDpkg('minopaneld', doBuildFromSource, nightly);
		} else if (finalOS === LinuxDistribution.fedora || finalOS === LinuxDistribution.alma || finalOS === LinuxDistribution.rocky || finalOS === LinuxDistribution.rhel  || finalOS === LinuxDistribution.suse  || finalOS === LinuxDistribution.opensuse)  {
			await installRPM('minopaneld', doBuildFromSource, nightly, finalOS);
		} else {
			log.info('No builds available for your operating system...');
			process.exit(0);
		}
	}

	if (installMinowebd) {
		if (finalOS === LinuxDistribution.archlinux) {
			await runMakepkg('minowebd', doBuildFromSource, nightly);
		} else if (finalOS === LinuxDistribution.debian || finalOS === LinuxDistribution.ubuntu) {
			await installDpkg('minowebd', doBuildFromSource, nightly);
		} else if (finalOS === LinuxDistribution.fedora || finalOS === LinuxDistribution.alma || finalOS === LinuxDistribution.rocky || finalOS === LinuxDistribution.rhel  || finalOS === LinuxDistribution.suse  || finalOS === LinuxDistribution.opensuse)  {
			await installRPM('minowebd', doBuildFromSource, nightly, finalOS);
		} else {
			log.info('No builds available for your operating system...');
			process.exit(0);
		}
	}

	outro('minopanel was installed successfully');
}

async function installDpkg(name: string, doBuildFromSource: boolean, doNightly: boolean) {
	log.info(`Installing ${name}...`);
	const basepath = `/tmp/minopanel/${name}`;
	await fsPromises.mkdir(basepath, { recursive: true });

	let tag = `v${minopanelVersion}`

	try {
		const gh = await axios.get('https://api.github.com/repos/Delfi-CH/minopanel/releases/latest');
		tag = gh.data.tag_name;
	} catch {
		//
	}
	

	let dlUrl = `https://github.com/Delfi-CH/minopanel/releases/download/${tag}/${name}-${minopanelVersion}-amd64.deb`;
	if (doNightly) {
		dlUrl = `https://github.com/Delfi-CH/minopanel/releases/download/rolling-nightly/${name}-${minopanelVersion}-amd64.deb`;
	}

	if (doBuildFromSource) {
		log.info("build from source: not yet implemented")
		exit()
	}

	const dl = new DownloaderHelper(dlUrl, basepath, {
		fileName: `${name}-${minopanelVersion}-amd64.deb`,
		retry: { maxRetries: 3, delay: 3000 },
		resumeOnIncomplete: true,
		resumeOnIncompleteMaxRetry: 3
	});
	const dlProgress = progress({ max: 100 });
	dlProgress.start(`Downloading ${name}-${minopanelVersion}-amd64.deb...`);
	dl.on('progress', (stats) => {
		dlProgress.advance(Math.floor(stats.progress), `${Math.floor(stats.progress)}%`);
	});
	dl.on('end', () => {
		dlProgress.stop('Download finished!');
	});
	dl.on('error', (err) => {
		dlProgress.cancel('An error has ocurred: ' + err.message);
		exit();
	});
	await dl.start().catch((err) => {
		dlProgress.cancel('An error has ocurred: ' + err.message);
		exit();
	});
	const sudoDpkg = childProcess.spawn('sudo', ['apt', 'install', `${basepath}/${name}-${minopanelVersion}-amd64.deb`], {
		stdio: ['inherit', 'inherit', 'inherit']
	});
	const [code] = await once(sudoDpkg, 'close');
	if (code !== 0) {
		log.error('dpkg failed with code ' + code);
		exit();
	}
}

async function installRPM(name: string, doBuildFromSource: boolean, doNightly: boolean, distro: LinuxDistribution) {
	log.info(`Installing ${name}...`);
	const basepath = `/tmp/minopanel/${name}`;
	await fsPromises.mkdir(basepath, { recursive: true });

	let tag = `v${minopanelVersion}`

	try {
		const gh = await axios.get('https://api.github.com/repos/Delfi-CH/minopanel/releases/latest');
		tag = gh.data.tag_name;
	} catch {
		//
	}

	let dlUrl;
	
	if (distro === LinuxDistribution.fedora && doNightly) {
		dlUrl = `https://github.com/Delfi-CH/minopanel/releases/download/rolling-nightly/${name}-fedora-${minopanelVersion}-1.x86_64.rpm`
	} else if (distro === LinuxDistribution.fedora) {
		dlUrl = `https://github.com/Delfi-CH/minopanel/releases/download/${tag}/${name}-fedora-${minopanelVersion}-1.x86_64.rpm`
	} else if (distro === LinuxDistribution.alma && doNightly) {
		dlUrl = `https://github.com/Delfi-CH/minopanel/releases/download/rolling-nightly/${name}-almalinux-${minopanelVersion}-1.x86_64.rpm`
	} else if (distro === LinuxDistribution.alma) {
		dlUrl = `https://github.com/Delfi-CH/minopanel/releases/download/${tag}/${name}-almalinux-${minopanelVersion}-1.x86_64.rpm`
	} else if (doNightly) {
		dlUrl = `https://github.com/Delfi-CH/minopanel/releases/download/rolling-nightly/${name}-rockylinux-${minopanelVersion}-1.x86_64.rpm`
	} else  {
		dlUrl = `https://github.com/Delfi-CH/minopanel/releases/download/${tag}/${name}-rockylinux-${minopanelVersion}-1.x86_64.rpm`
	}

	if (doBuildFromSource) {
		// todo
		log.info("build from source: not yet implemented")
		exit()
	}

	const fname = `${name}-${minopanelVersion}-1.x86_64.rpm`

	const dl = new DownloaderHelper(dlUrl, basepath, {
		fileName: fname,
		retry: { maxRetries: 3, delay: 3000 },
		resumeOnIncomplete: true,
		resumeOnIncompleteMaxRetry: 3
	});

	const dlProgress = progress({ max: 100 });
	dlProgress.start(`Downloading ${fname}...`);
	dl.on('progress', (stats) => {
		dlProgress.advance(Math.floor(stats.progress), `${Math.floor(stats.progress)}%`);
	});
	dl.on('end', () => {
		dlProgress.stop('Download finished!');
	});
	dl.on('error', (err) => {
		dlProgress.cancel('An error has ocurred: ' + err.message);
		exit();
	});
	await dl.start().catch((err) => {
		dlProgress.cancel('An error has ocurred: ' + err.message);
		exit();
	});

	let installCommand = ["rpm", "-ivh", `${basepath}/${fname}`]

	if (distro === LinuxDistribution.fedora || distro === LinuxDistribution.alma || distro === LinuxDistribution.rocky || distro === LinuxDistribution.rhel) {
		installCommand = ["dnf", "install", `${basepath}/${fname}`]
	}

	const sudoRpm = childProcess.spawn("sudo", installCommand, {
		stdio: ['inherit', 'inherit', 'inherit']
	})

	const [code] = await once(sudoRpm, 'close');
	if (code !== 0) {
		log.error(`${installCommand.join(" ")} failed with code ${code}`);
		exit();
	}
}

async function runMakepkg(name: string, doBuildFromSource: boolean, doNightly: boolean) {
	log.info(`Installing ${name}...`);
	const basepath = `/tmp/minopanel/${name}`;
	await fsPromises.mkdir(basepath, { recursive: true });

	let type = 'cli';
	if (name === 'minoctl') {
		type = 'cli';
	} else if (name === 'minopaneld') {
		type = 'server';
	} else if (name === 'minowebd') {
		type = 'web';
	}

	let dlUrl = `https://github.com/Delfi-CH/minopanel/raw/refs/heads/main/pkg/unix/archlinux/PKGBUILD-${type}-bin`;
	if (doBuildFromSource) {
		dlUrl = `https://github.com/Delfi-CH/minopanel/raw/refs/heads/main/pkg/unix/archlinux/PKGBUILD-${type}-git`;
	} else if (doNightly) {
		dlUrl = `https://github.com/Delfi-CH/minopanel/raw/refs/heads/main/pkg/unix/archlinux/PKGBUILD-${type}-bin-nightly`;
	}

	const dl = new DownloaderHelper(dlUrl, basepath, {
		fileName: 'PKGBUILD',
		retry: { maxRetries: 3, delay: 3000 },
		resumeOnIncomplete: true,
		resumeOnIncompleteMaxRetry: 3
	});
	const dlProgress = progress({ max: 100 });
	dlProgress.start('Downloading PKGBUILD...');
	dl.on('progress', (stats) => {
		dlProgress.advance(Math.floor(stats.progress), `${Math.floor(stats.progress)}%`);
	});
	dl.on('end', () => {
		dlProgress.stop('Download finished!');
	});
	dl.on('error', (err) => {
		dlProgress.cancel('An error has ocurred: ' + err.message);
		exit();
	});
	await dl.start().catch((err) => {
		dlProgress.cancel('An error has ocurred: ' + err.message);
		exit();
	});
	const pkgbuild = await fsPromises.readFile(`${basepath}/PKGBUILD`, 'utf-8');
	log.warn(
		'Warning:\nThe following PKGBUILD will be run on your computer as root!\nPlease check for any suspicious behavior before continuing.\n' +
			pkgbuild
	);

	const doMakepkg = await confirm({
		message: 'Do you want to continiue?'
	});
	handleCancel(doMakepkg);
	if (doMakepkg) {
		log.info('Building & installing package...');
		const makepkg = childProcess.spawn('makepkg', ['-si'], {
			cwd: basepath,
			stdio: ['inherit', 'inherit', 'inherit']
		});
		const [code] = await once(makepkg, 'close');
		if (code !== 0) {
			log.error('makepkg failed with code ' + code);
			exit();
		}
	} else {
		exit();
	}
}

function handleCancel(value: any) {
	if (isCancel(value)) {
		exit();
	}
}

function exit() {
	cancel('Installation was cancelled!');
	process.exit(1);
}

main();
