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
			/* TODO
			log.info("Installing minoctl...")
			const basepath = "/tmp/minopanel/minoctl"
			await fsPromises.mkdir(basepath, { recursive: true})
			*/
		}
	}

	if (installMinopaneld) {
		if (finalOS === LinuxDistribution.archlinux) {
			await runMakepkg('minpaneld', doBuildFromSource);
		}
	}

	if (installMinowebd) {
		if (finalOS === LinuxDistribution.archlinux) {
			await runMakepkg('minowebd', doBuildFromSource);
		}
	}

	outro('minopanel was installed successfully');
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
