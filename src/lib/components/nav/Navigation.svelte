<script lang="ts">
	import { Navbar, Nav, NavbarToggler, Collapse, NavbarBrand } from '@sveltestrap/sveltestrap';
	import NavigationLink from '$lib/components/nav/NavigationLink.svelte';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import axios from 'axios';
	import NavigationDownload from '$lib/components/nav/NavigationDownload.svelte';
	import { getBackendURL } from '$lib/config/web';

	let branding = $state('Minopanel');

	let isMobile = $state(false);
	let isOpen = $state(false);

	function update() {
		isMobile = window.innerWidth < 768;
	}

	onMount(() => {
		update();
		window.addEventListener('resize', update);
		return () => window.removeEventListener('resize', update);
	});

	onMount(async () => {
		const backendURL = getBackendURL()
		const res = await axios.get(`${backendURL}/api/config`);
		branding = res.data.branding;
	});
</script>

<Navbar color="dark" expand="md" container="md">
	<NavbarBrand href={resolve('/')} class="text-success">
		{branding}
	</NavbarBrand>

	<NavbarToggler onclick={() => (isOpen = !isOpen)} />

	{#if isMobile}
		<Collapse {isOpen} navbar class="bg-dark">
			<Nav pills class="ms-auto">
				<NavigationLink href="/" name="Home"></NavigationLink>
				<NavigationLink href="/new" name="New Server"></NavigationLink>
				<NavigationLink href="/servers" name="Servers"></NavigationLink>
				<NavigationDownload></NavigationDownload>
				<NavigationLink href="/settings" name="Settings"></NavigationLink>
				<NavigationLink href="/about" name="About"></NavigationLink>
			</Nav>
		</Collapse>
	{:else}
		<Nav pills class="ms-auto">
			<NavigationLink href="/" name="Home"></NavigationLink>
			<NavigationLink href="/new" name="New Server"></NavigationLink>
			<NavigationLink href="/servers" name="Servers"></NavigationLink>
			<NavigationDownload></NavigationDownload>
			<NavigationLink href="/settings" name="Settings"></NavigationLink>
			<NavigationLink href="/about" name="About"></NavigationLink>
		</Nav>
	{/if}
</Navbar>
