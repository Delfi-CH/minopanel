<script lang="ts">
    import FileTreeNode from "$lib/components/fs/FileTreeNode.svelte";
	import { onMount } from "svelte";
    import axios from "axios";
    const { name } = $props()
    let fsData = $state([]);

    onMount(async()=>{
        await getFS()
        setInterval(async ()=> await getFS(), 1000)
    })

    async function getFS() {
		const tmpFS = await axios.get(
			`http://${window.location.hostname}:6502/api/server/static/` + name + '/fs'
		);
		fsData = tmpFS.data;
	}
</script>

<div>
    {#each fsData as entry, index (index)}
	    <FileTreeNode entry={entry} name={name} onChange={async ()=> await getFS()} parentPath="" rootNode={true}></FileTreeNode>
	{/each}
</div>