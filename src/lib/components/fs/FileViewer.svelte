<script lang="ts">
	import FileTreeNode from '$lib/components/fs/FileTreeNode.svelte';
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { getBackendURL } from '$lib/config/web';
	const { name } = $props();
	let fsData = $state([]);
	let backendURL = $state("")

	onMount(async () => {
		backendURL = getBackendURL()
		await getFS();
		setInterval(async () => await getFS(), 5000);
	});

	async function getFS() {
		const tmpFS = await axios.get(
			`${backendURL}/api/server/static/` + name + '/fs'
		);
		fsData = tmpFS.data;
	}
</script>

<div>
	{#each fsData as entry, index (index)}
		<FileTreeNode {entry} {name} onChange={async () => await getFS()} parentPath="" rootNode={true} backendURL={backendURL}
		></FileTreeNode>
	{/each}
</div>
