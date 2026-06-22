<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import Navigation from '$lib/components/Navigation.svelte';
	import 'bootswatch/dist/solar/bootstrap.min.css';
	import 'bootstrap-icons/font/bootstrap-icons.css';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navigation></Navigation>
{@render children()}
