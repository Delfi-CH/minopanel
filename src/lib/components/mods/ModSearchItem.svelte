<script lang="ts">
	import { downloadMod, getModVersions } from '$lib/mods/modrinth';
	import {
		Col,
		Card,
		CardHeader,
		CardTitle,
		CardBody,
		CardFooter,
		Button
	} from '@sveltestrap/sveltestrap';
	import axios from 'axios';
	import { onMount } from 'svelte';
	let { mod, gameVersion, modloader, serverName } = $props();

	let modVersions = $state([]);
	let latestVersion = $state({});
	let paths = $state({});

	onMount(async () => {
		let opts = {
			project: mod.project_id,
			modloader: modloader,
			gameVersion: gameVersion
		};

		const tmpVersions = await getModVersions(opts);
		modVersions = tmpVersions;
		latestVersion = modVersions[0];

		const config = await axios.get(`http://${window.location.hostname}:6502/api/config`);
		paths = config.data.paths;
	});
</script>

<Col>
	<Card class="m-1">
		<CardHeader>
			<div class="d-flex gap-2 align-items-center">
				<img
					src={mod.icon_url}
					alt="ModIcon"
					width="48px"
					style="border: 5px solid transparent; border-radius: 25%;"
				/>
				<CardTitle>{mod.title} by {mod.author}</CardTitle>
			</div>
		</CardHeader>
		<CardBody>
			<p>{mod.description}</p>
			<p>{mod.downloads} Downloads</p>
			<p>
				Game Versions: {mod.versions[0]}-{mod.versions[mod.versions.length - 1]}
				|
				<span class={mod.versions.includes(gameVersion) ? 'text-success' : 'text-danger'}
					>{mod.versions.includes(gameVersion)
						? `Runs on Version ${gameVersion}`
						: `Does not run on Version ${gameVersion}!`}</span
				>
			</p>
			<p>Latest Version: {latestVersion.name}</p>
			<p>Released at: {new Date(latestVersion.date_published).toLocaleString()}</p>
		</CardBody>
		<CardFooter>
			<Button
				color="info"
				onclick={() => {
					downloadMod(paths, serverName, latestVersion.files[0], modloader);
				}}>Download</Button
			>
		</CardFooter>
	</Card>
</Col>
