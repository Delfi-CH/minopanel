<script lang="ts">
    import { onMount } from "svelte";

    let { name } = $props();

    let logData: string[] = $state([]);

    onMount(() => {
		const logEvents = new EventSource(
			`http://${window.location.hostname}:6502/api/server/static/` + name + '/logs'
		);
		logEvents.addEventListener('message', (e) => {
			logData = [...logData, e.data];
		});
	});
</script>

{#each logData as log, index (index)}
    <span>{log}</span><br />
{/each}