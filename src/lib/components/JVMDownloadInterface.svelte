<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { DownloadDTO, DownloadDTOType } from '$lib/download/dataTransferObjects';
	import { DownloadCallback, DownloadState } from '$lib/download/downloader';

	let { javaVersion, onFinish } = $props();
	let downloadStatus: DownloadCallback = $state(
		new DownloadCallback('Inactive', DownloadState.Inactive, 0)
	);

	const downloadID = Math.floor(Math.random() * 100);
	const ws = new WebSocket('ws://localhost:6502/api/download/stream/' + downloadID);

	onMount(() => {
		ws.addEventListener('open', () => {
			const initDTO = new DownloadDTO(DownloadDTOType.openjdk, null, javaVersion);
			ws.send(JSON.stringify(initDTO));
		});

		ws.addEventListener('message', (e) => {
			const json: DownloadDTO = JSON.parse(e.data);
			if (json.type === DownloadDTOType.status && json.data !== null) {
				// @ts-expect-error womp womp
				downloadStatus = json.data;
			} else if (json.type === DownloadDTOType.openjdkFinished) {
				console.log(json.data);
				onFinish();
			}
		});
	});

	onDestroy(() => {
		ws.close();
	});
</script>

<p>{javaVersion} Download</p>
<p>Status: {downloadStatus.message}</p>
<p>Progress: {Math.floor(downloadStatus.progress ?? 0)}%</p>
