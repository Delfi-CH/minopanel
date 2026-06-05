<script lang="ts">
	import { onMount, onDestroy } from "svelte";
    import { DownloadDTO, DownloadDTOType } from '$lib/download/dataTransferObjects';
	import { DownloadCallback, DownloadState } from '$lib/download/downloader';

    let { downloadURL, downloadPath, downloadFilename } = $props()
    let downloadStatus: DownloadCallback = $state(
		new DownloadCallback('Inactive', DownloadState.Inactive, 0)
	);

    const downloadID = Math.floor(Math.random()*100)
    const ws = new WebSocket('ws://localhost:6502/api/download/stream/' + downloadID);

    onMount(()=>{
        ws.addEventListener('open', () => {
			const initDTO = new DownloadDTO(DownloadDTOType.init, {
				downloadURL: downloadURL,
				downloadPath: downloadPath,
				downloadFilename: downloadFilename
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
    })

	onDestroy(()=>{
		ws.close()
	})
</script>

<h3>Downloading {downloadFilename} from {downloadURL} to {downloadPath}</h3>
<p>Status: {downloadStatus.message}</p>
<p>Progress: {Math.floor(downloadStatus.progress ?? 0)}%</p>
<p>Speed: {downloadStatus.speed / 1000000 * 8} Mbp/s</p>
<p>Total: {downloadStatus.total / 1000000} MB</p>
<button
	onclick={() => {
		const startDTO = new DownloadDTO(DownloadDTOType.start, null);
		ws.send(JSON.stringify(startDTO));
	}}>Start</button
>