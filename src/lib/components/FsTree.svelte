<script lang="ts">
    import { Icon } from "@sveltestrap/sveltestrap";
    import FileTree from "./FsTree.svelte";

    const { entry } = $props()

    let showChildren = $state(false)

    function determineFileIcon() {
        if (entry.path.endsWith(".txt") || entry.path.endsWith(".log")) {
            return "file-earmark-text"
        } else if (entry.path.endsWith(".jar")|| entry.path.endsWith(".sh") || entry.path.endsWith(".bat")) {
            return "file-earmark-binary"
        } else if (entry.path.endsWith(".json")) {
            return "file-earmark-code"
        } else if (entry.path.endsWith(".properties")) {
            return "file-earmark-code"
        } else if (entry.path.endsWith(".zip") || entry.path.endsWith(".gz") || entry.path.endsWith(".tar") || entry.path.endsWith(".xz")) {
            return "file-earmark-zip"
        } else {
            return "file-earmark"
        }
    }
</script>

<div class="tree-node">
    {#if entry.directory && entry.children.length > 0}
        <p onclick={()=> showChildren = !showChildren} class="text-success">
            <Icon name="folder"></Icon>
            {entry.path}
        </p>
        {#if showChildren}
            <div class="children">
                {#each entry.children as child, index (index)}
                    <FileTree entry={child} />
                {/each}
            </div>
        {/if}
    {:else}
        <p>
            <Icon name={determineFileIcon()}></Icon>
            {entry.path}
        </p>
    {/if}
</div>

<style>
    .children {
        margin-left: 1rem;
    }
</style>