<script lang="ts">
    import FileTreeNode from "./FileTreeNode.svelte";
    const { fsData } = $props()
</script>

<div>
    {#each fsData as entry, index (index)}
	    <FileTreeNode {entry}></FileTreeNode>
	{/each}
</div>