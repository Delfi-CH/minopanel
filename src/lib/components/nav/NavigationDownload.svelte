<script lang="ts">
	import {
		Progress,
		DropdownItem,
		Dropdown,
		DropdownToggle,
		DropdownMenu
	} from '@sveltestrap/sveltestrap';
	import { webDownloadManager } from '$lib/download/web';
	import { DownloadCallback, DownloadState } from '$lib/download/shared';
	import { DownloadDTOType } from '$lib/download/dataTransferObjects';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	let runningDownloads: SvelteMap<string, DownloadCallback> = new SvelteMap<
		string,
		DownloadCallback
	>();
	let runningDownloadCount = $derived(runningDownloads.size);

	onMount(() => {
		doDownloads();
		setInterval(doDownloads, 100);
	});

	function doDownloads() {
		const allDownloads = webDownloadManager.getOpen();
		allDownloads.forEach((id) => {
			webDownloadManager.listenToDownload(id, (json) => {
				if (json.type === DownloadDTOType.status && json.data !== null) {
					// @ts-expect-error womp womp
					runningDownloads.set(id, json.data);
					// @ts-expect-error womp womp
					if (json.data.status === DownloadState.Finished) {
						runningDownloads.delete(id);
						webDownloadManager.removeDownload(id);
					}
				} else if (json.type === DownloadDTOType.openjdkFinished) {
					runningDownloads.delete(id);
					webDownloadManager.removeDownload(id);
				}
			});
		});
		if (allDownloads.length < 1) {
			runningDownloads.clear();
		}
	}
</script>

<Dropdown nav inNavbar class="m-1" autoClose={false}>
	<DropdownToggle nav caret
		>Downloads {runningDownloadCount > 0 ? `(${runningDownloadCount} running)` : ''}</DropdownToggle
	>
	<DropdownMenu end>
		<DropdownItem style="min-width: 25vw;">All Downloads</DropdownItem>
		{#each runningDownloads as download, index (index)}
			<DropdownItem divider></DropdownItem>
			<DropdownItem>{download[0]} | {download[1].message}</DropdownItem>
			<DropdownItem
				><Progress striped bar={true} value={download[1].progress} color="info"
					>{Math.floor(download[1].progress ?? 0)}%
				</Progress></DropdownItem
			>
		{/each}
	</DropdownMenu>
</Dropdown>
