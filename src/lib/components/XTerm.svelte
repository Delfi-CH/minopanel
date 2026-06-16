<script lang="ts">
	import { Terminal } from '@xterm/xterm';
	import { FitAddon } from '@xterm/addon-fit';
	import { onMount, onDestroy } from 'svelte';
	import '@xterm/xterm/css/xterm.css';

	let termHtml: HTMLDivElement;
	let cleanup = () => {};
	let { serverID } = $props();

	onMount(() => {
		startup();
	});

	export function startup() {
		cleanup();
		const ws = new WebSocket('ws://localhost:6502/api/server/stream/' + serverID);
		const term = new Terminal({
			cursorBlink: true,
			cursorStyle: 'bar'
		});
		const fitAddon = new FitAddon();
		if (!termHtml) {
			return;
		}
		term.loadAddon(fitAddon);
		term.open(termHtml);
		fitAddon.fit();

		ws.addEventListener('open', (e) => {
			fitAddon.fit();
			ws.send(
				JSON.stringify({
					type: 'resize',
					cols: term.cols,
					rows: term.rows
				})
			);
			term.clear();
			term.writeln(`Connected to server "${serverID}".`)
		});

		ws.addEventListener('message', (e) => {
			term.write(e.data);
		});

		term.onData((data) => {
			ws.send(data);
		});

		term.onResize(({ cols, rows }) => {
			ws.send(
				JSON.stringify({
					type: 'resize',
					cols: cols,
					rows: rows
				})
			);
		});

		requestAnimationFrame(() => {
			fitAddon.fit();
		});

		const resizeObserver = new ResizeObserver(() => {
			requestAnimationFrame(() => {
				fitAddon.fit();
			});
		});
		resizeObserver.observe(termHtml);

		ws.addEventListener('close', (e) => {
			term.clear();
			term.write('Server is not running.');
		});

		cleanup = () => {
			resizeObserver.disconnect();
			ws.close();
			term.dispose();
		};
	}

	onDestroy(() => {
		cleanup();
	});
</script>

<div class="terminalContainer">
	<div bind:this={termHtml} class="terminal"></div>
</div>

<style>
	.terminalContainer {
		width: 100%;
		height: 100%;
		min-height: 300px;

		display: flex;
		overflow: hidden;
	}

	.terminal {
		flex: 1;
		width: 100%;
		height: 100%;
		padding: 0.5rem;
	}
</style>
