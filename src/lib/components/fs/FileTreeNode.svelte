<script lang="ts">
	import { Icon, Badge, Button } from '@sveltestrap/sveltestrap';
	import FileTreeNode from '$lib/components/fs/FileTreeNode.svelte';
	import { slide } from 'svelte/transition';
	import axios from 'axios';
	import { onMount } from 'svelte';
	import UploadModal from './UploadModal.svelte';
	import DeleteModal from '../DeleteModal.svelte';

	const { entry, name, parentPath, onChange, rootNode } = $props();

	let showChildren = $state(false);
	let showUpload = $state(false);
	let showDelete = $state(false);

	const fullPath = $derived(parentPath ? `${parentPath}/${entry.path}` : entry.path);

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

	async function deleteFile() {
		try {
			await axios.delete(
				`http://${window.location.hostname}:6502/api/server/static/${name}/fs?path=${encodeURIComponent(fullPath)}`
			);
			onChange();
		} catch (err) {
			console.error('Deletion Error: ' + err);
		}
	}

	function downloadFile() {
		try {
			window.open(
				`http://${window.location.hostname}:6502/api/server/static/${name}/fs/download?path=${encodeURIComponent(fullPath)}`
			);
			onChange();
		} catch (err) {
			console.error('Download Error: ' + err);
		}
	}

	function downloadFolder() {
		try {
			window.open(
				`http://${window.location.hostname}:6502/api/server/static/${name}/fs/download/folder?path=${encodeURIComponent(fullPath)}`
			);
			onChange();
		} catch (err) {
			console.error('Download Error: ' + err);
		}
	}

	onMount(() => {
		showChildren = rootNode;
	});
</script>

<div class="tree-node">
	{#if entry.directory && entry.children.length > 0}
		<h5>
			<Badge
				onclick={() => (showChildren = !showChildren)}
				color="success"
				indicator
				pill
				class="m-1"
			>
				<Icon name="folder"></Icon>
				<span>{entry.path}</span>
			</Badge>

			<Button onclick={() => (showUpload = !showUpload)} color="primary">Upload</Button>
			<Button onclick={downloadFolder} color="primary">Download</Button>

			{#if !rootNode}
				<Button onclick={() => (showDelete = !showDelete)} color="warning">Delete</Button>
			{/if}
		</h5>

		{#if showChildren}
			<div class="children" transition:slide>
				{#each entry.children as child, index (index)}
					<FileTreeNode entry={child} {name} {onChange} parentPath={fullPath} rootNode={false} />
				{/each}
			</div>
		{/if}
	{:else}
		<h5>
			<Badge color="info" class="m-1" indicator pill>
				<Icon name={determineFileIcon()}></Icon>
				<span>{entry.path}</span>
			</Badge>

			<Button onclick={downloadFile} color="primary">Download</Button>
			<Button onclick={() => (showDelete = !showDelete)} color="warning">Delete</Button>
		</h5>
	{/if}

	{#if showUpload}
		<UploadModal
			open={showUpload}
			{name}
			{fullPath}
			{onChange}
			onClose={() => (showUpload = !showUpload)}
		></UploadModal>
	{/if}

	{#if showDelete}
		<DeleteModal
			open={showDelete}
			message={entry.path}
			onDelete={async () => await deleteFile()}
			onClose={() => (showDelete = !showDelete)}
		></DeleteModal>
	{/if}
</div>

<style>
	.children {
		margin-left: 1rem;
	}
</style>
