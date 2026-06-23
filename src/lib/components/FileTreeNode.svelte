<script lang="ts">
	import { Icon, Badge, Button } from '@sveltestrap/sveltestrap';
	import FileTreeNode from './FileTreeNode.svelte';
	import { slide } from 'svelte/transition';

	const { entry } = $props();

	let showChildren = $state(false);

	function determineFileIcon() {
		if (entry.path.endsWith('.txt') || entry.path.endsWith('.log')) {
			return 'file-earmark-text';
		} else if (
			entry.path.endsWith('.jar') ||
			entry.path.endsWith('.sh') ||
			entry.path.endsWith('.bat')
		) {
			return 'file-earmark-binary';
		} else if (entry.path.endsWith('.json')) {
			return 'file-earmark-code';
		} else if (entry.path.endsWith('.properties')) {
			return 'file-earmark-code';
		} else if (
			entry.path.endsWith('.zip') ||
			entry.path.endsWith('.gz') ||
			entry.path.endsWith('.tar') ||
			entry.path.endsWith('.xz')
		) {
			return 'file-earmark-zip';
		} else {
			return 'file-earmark';
		}
	}
</script>

<div class="tree-node">
	{#if entry.directory && entry.children.length > 0}
		<h5>
			<Badge onclick={() => (showChildren = !showChildren)} color="success" indicator pill class="m-1">
				<Icon name="folder"></Icon>
				<span>{entry.path}</span>
			</Badge>
		</h5>
		{#if showChildren}
			<div class="children" transition:slide>
				{#each entry.children as child, index (index)}
					<FileTreeNode entry={child} />
				{/each}
			</div>
		{/if}
	{:else}
		<h5>
			<Badge color="info" class="m-1" indicator pill>
				<Icon name={determineFileIcon()}></Icon>
				<span>{entry.path}</span>
			</Badge>
		</h5>
	{/if}
</div>

<style>
	.children {
		margin-left: 1rem;
	}
</style>
