<script lang="ts">
	import { getMCVersions, ModloaderType } from '$lib/serverManager';
	import { onMount } from 'svelte';

	let newServerName: string = $state('');
	let selectedVersion: string = $state('');
	let availableMCVersions: string[] = $state([]);
	let selectedModloader: ModloaderType = $state(ModloaderType.Vanilla);
	let availableModloaders = $state(Object.values(ModloaderType));

	onMount(async () => {
		const tmpVersions = await getMCVersions();
		availableMCVersions = tmpVersions;
	});
</script>

<h1>New Server</h1>
<form>
	<label for="name">Name</label>
	<input type="text" id="name" bind:value={newServerName} />
	<label for="version">Game Version</label>
	<select id="version" bind:value={selectedVersion}>
		{#each availableMCVersions as ver (ver)}
			<option value={ver}>{ver}</option>
		{/each}
	</select>
	<label for="version">Modloader</label>
	<select id="version" bind:value={selectedModloader}>
		{#each availableModloaders as ver (ver)}
			<option value={ver}>{ver}</option>
		{/each}
	</select>
</form>
