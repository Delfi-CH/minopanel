import { ApplicatonPaths } from '$lib/config/paths';
import { LinuxDistribution, OperatingSystem } from '$lib/system';
import { intro, outro, confirm, log, isCancel, cancel, select, multiselect } from '@clack/prompts';
import linuxOsInfo from '@delfi-ch/linux-os-info-esmodule';
import * as os from "node:os"

async function main() {
	intro('minopanel-installer');

	const distro = linuxOsInfo({ mode: 'sync' });
	let system = OperatingSystem.Other;
	let distroName = '';
	let finalOS = LinuxDistribution.other;
	log.info('Determining your OperatingSystem...');
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
		system = OperatingSystem.Windows
	}

	log.info(`Operating System was set to ${finalOS}`);

	const paths = new ApplicatonPaths(system)
	paths.tmpPath = os.tmpdir()

	const selectedOptions = await multiselect({
		message: "Select the components you want to install",
		options: [
			{value: "minoctl", label: "Command-Line interface (minoctl)" },
			{value: "minopaneld", label: "Server (minopaneld)"},
			{value: "minowebd", label: "Web-Interface (minowebd)", hint: "Reccomended for most users"}
		]
	})

	let installMinoctl = false
	let installMinopaneld = false
	let installMinowebd = false

	handleCancel(selectedOptions);
	selectedOptions.forEach((component) => {
		if (component === "minoctl") {
			installMinoctl = true
		} else if (component === "minopaneld") {
			installMinopaneld = true
		} else if (component === "minowebd") {
			installMinowebd = true
		}
	});

	if (installMinoctl) {
		if (finalOS === LinuxDistribution.archlinux) {
			log.info("installing minoctl archlinux")
		}
	}

	if (installMinopaneld) {
		if (finalOS === LinuxDistribution.archlinux) {
			log.info("installing minopaneld archlinux")
		}
	}

	if (installMinowebd) {
		if (finalOS === LinuxDistribution.archlinux) {
			log.info("installing minowebd archlinux")
		}
	}

	outro('minopanel was installed successfully');
}

function handleCancel(value: any) {
	if (isCancel(value)) {
		cancel('Installation was cancelled!');
		process.exit(1);
	}
}

main();
