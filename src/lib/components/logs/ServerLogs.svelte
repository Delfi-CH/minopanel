<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '@sveltestrap/sveltestrap';
	import { slide } from 'svelte/transition';

	let { name } = $props();

	let logData: string[] = $state([]);

	let showLogs = $state(false);

    let button;

	onMount(() => {
		const logEvents = new EventSource(
			`http://${window.location.hostname}:6502/api/server/static/` + name + '/logs'
		);
		logEvents.addEventListener('message', (e) => {
			logData = [...logData, e.data];
		});
	});

    function toggleLogs() {
        showLogs = !showLogs
        let count = 0;
        setInterval(()=>{
            if (showLogs && count < 5) {
                window.scrollTo(0, document.body.scrollHeight)
                count++
            }
        }, 100)
        
    }
</script>

<Button onclick={toggleLogs} class="m-1" bind:this={button}>
    {showLogs ? 'Hide' : 'Show'} Logs
</Button>

{#if showLogs}
	<div class="bg-black text-white p-3 m-1" transition:slide>
		{#each logData as log, index (index)}
			<span class={log.includes('\t') ? 'ms-3' : ''}>{log}</span><br />
		{/each}
	</div>
    <Button onclick={toggleLogs} class="m-1">Hide Logs</Button>
{/if}
