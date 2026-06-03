<script lang="ts">
	import { Modloader, ModloaderType } from '$lib/serverManager';
	import { onMount } from 'svelte';

	onMount(async () => {
		const ml = new Modloader(ModloaderType.Vanilla, '1.21.1');
		ml.buildURL();
	});
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
