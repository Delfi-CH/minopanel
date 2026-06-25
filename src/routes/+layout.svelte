<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import Navigation from '$lib/components/nav/Navigation.svelte';
	import 'bootswatch/dist/solar/bootstrap.min.css';
	import 'bootstrap-icons/font/bootstrap-icons.css';
	import { loadConfig } from '$lib/config/web';
	import { onMount } from 'svelte';
	let { children } = $props();

	onMount(async () => {
		await loadConfig();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navigation></Navigation>
{@render children()}
