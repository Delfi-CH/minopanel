<script lang="ts">
	import DownloadInterface from '$lib/components/GenericDownloadInterface.svelte';
	import { Modloader, ModloaderType } from '$lib/serverManager';
	import { onMount } from 'svelte';

	onMount(async () => {
		const ml = new Modloader(ModloaderType.Vanilla, '1.21.1');
		await ml.buildURL();
	});
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<DownloadInterface
	downloadURL="https://corretto.aws/downloads/latest/amazon-corretto-21-x64-linux-jdk.tar.gz"
	downloadPath="/tmp"
	downloadFilename="jdk21-linux.tar.gz"
></DownloadInterface>
