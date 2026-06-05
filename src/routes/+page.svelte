<script lang="ts">
	import { DownloadDTO, DownloadDTOType } from '$lib/download/dataTransferObjects';
	import { DownloadCallback, DownloadState } from '$lib/download/downloader';
	import { Modloader, ModloaderType } from '$lib/serverManager';
	import { onMount } from 'svelte';

	const ws = new WebSocket('ws://localhost:6502/api/download/stream/1');
	let downloadStatus: DownloadCallback = $state(
		new DownloadCallback('Inactive', DownloadState.Inactive, 0)
	);

	onMount(async () => {
		const ml = new Modloader(ModloaderType.Vanilla, '1.21.1');
		ml.buildURL();

		ws.addEventListener('open', (e) => {
			const initDTO = new DownloadDTO(DownloadDTOType.init, {
				downloadURL:
					'https://github.com/Delfi-CH/remind-me/releases/download/latest/remind_me-android.apk',
				downloadPath: '/tmp',
				downloadFilename: 'remind-me.apk'
			});
			ws.send(JSON.stringify(initDTO));
		});

		ws.addEventListener('message', (e) => {
			const json: DownloadDTO = JSON.parse(e.data);
			if (json.type === DownloadDTOType.status && json.data !== null) {
				// @ts-expect-error womp womp
				downloadStatus = json.data;
			}
		});
	});
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<p>
	Download status: {DownloadState[downloadStatus.state]} message: {downloadStatus.message} progress: {Math.floor(
		downloadStatus.progress ?? 0
	)}% total: {downloadStatus.total} speed: {downloadStatus.speed}
</p>
<button
	onclick={() => {
		const startDTO = new DownloadDTO(DownloadDTOType.start, null);
		ws.send(JSON.stringify(startDTO));
	}}>Start</button
>
