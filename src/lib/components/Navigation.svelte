<script lang="ts">
	import { Nav, NavItem, NavbarBrand, NavLink } from '@sveltestrap/sveltestrap';
	import NavigationLink from '$lib/components/NavigationLink.svelte';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import axios from 'axios';

	let branding = $state('Minopanel');

	onMount(async () => {
		const res = await axios.get('http://localhost:6502/api/config');
		branding = res.data.branding;
	});
</script>

<Nav pills class="p-2 bg-dark">
	<NavItem class="m-1">
		<NavbarBrand>
			<NavLink href={resolve('/')}><h5>{branding}</h5></NavLink>
		</NavbarBrand>
	</NavItem>
	<NavigationLink href="/" name="Home"></NavigationLink>
	<NavigationLink href="/new" name="New Server"></NavigationLink>
	<NavigationLink href="/servers" name="Servers"></NavigationLink>
	<NavigationLink href="/settings" name="Settings"></NavigationLink>
	<NavigationLink href="/about" name="About"></NavigationLink>
</Nav>
