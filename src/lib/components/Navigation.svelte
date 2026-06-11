<script lang="ts">
    import { Nav, NavItem, NavbarBrand, NavLink } from "@sveltestrap/sveltestrap"
    import NavigationLink from "$lib/components/NavigationLink.svelte";
	import { resolve } from "$app/paths";
</script>

<Nav pills class="p-2" color="dark">
    <NavItem class="m-1">
        <NavbarBrand>
            <NavLink href={resolve("/")}><h5>Minopanel</h5></NavLink>
        </NavbarBrand>
    </NavItem>
    <NavigationLink href="/" name="Home"></NavigationLink>
    <NavigationLink href="/new" name="New Server"></NavigationLink>
    <NavigationLink href="/settings" name="Settings"></NavigationLink>
</Nav>
