<script lang="ts">
	import { resolve } from "$app/paths";
    import { page } from '$app/state';
    import { NavItem, NavLink } from "@sveltestrap/sveltestrap"

    let {href, name} = $props()

    const active = $derived(page.route.id === href)
</script>

<NavItem class="m-1">
    <NavLink href={resolve(href)} active={active} class={active ? "active bg-success" : ""}>
        {name}
    </NavLink>
</NavItem>