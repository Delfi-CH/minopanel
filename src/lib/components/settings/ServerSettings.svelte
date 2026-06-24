<script lang="ts">
	import axios from 'axios';
	import { onMount } from 'svelte';
	import { Table, Button, Input } from '@sveltestrap/sveltestrap';

	const { name } = $props();
	let serverProps = $state({});
	let showWarn = $state(false)

	onMount(async () => {
		await getProps();
		if (showWarn) {
			setInterval(async ()=>{
				await getProps()
			}, 3000)
		}
	});

	async function saveProps() {
		const tmpProps = await axios.post(
			`http://${window.location.hostname}:6502/api/server/static/` + name + '/props',
			serverProps
		);

		serverProps = tmpProps.data;
		showWarn = JSON.stringify(tmpProps.data) === JSON.stringify({})
	}

	async function getProps() {
		const tmpProps = await axios.get(
			`http://${window.location.hostname}:6502/api/server/static/` + name + '/props'
		);
		serverProps = tmpProps.data;
		showWarn = JSON.stringify(tmpProps.data) === JSON.stringify({})
	}
</script>

{#if showWarn}<p class="text-danger">"server.properties" doesnt exist! Please start the server once to generate "server.properties".</p>{/if}
<Table>
	<tbody>
		<tr>
			<td><h3>Player Settings</h3></td>
			<td></td>
		</tr>
		<tr>
			<td>Difficulty</td>
			<td>
				<Input type="select" bind:value={serverProps.difficulty}>
					<option value="0">Peaceful</option>
					<option value="1">Easy</option>
					<option value="2">Normal</option>
					<option value="3">Hard</option>
				</Input>
			</td>
		</tr>
		<tr>
			<td>Gamemode</td>
			<td>
				<Input type="select" bind:value={serverProps.gamemode}>
					<option value="0">Survival</option>
					<option value="1">Creative</option>
					<option value="2">Adventure</option>
					<option value="3">Spectator</option>
				</Input>
			</td>
		</tr>
		<tr>
			<td>Hardcore</td>
			<td><Input type="switch" bind:checked={serverProps['hardcore']}></Input></td>
		</tr>
		<tr>
			<td>Allow Flight</td>
			<td><Input type="switch" bind:checked={serverProps['allow-flight']}></Input></td>
		</tr>
		<tr>
			<td>Enforce Gamemode</td>
			<td><Input type="switch" bind:checked={serverProps['force-gamemode']}></Input></td>
		</tr>
		<tr>
			<td>Use Whitelist</td>
			<td><Input type="switch" bind:checked={serverProps['white-list']}></Input></td>
		</tr>
		<tr>
			<td>Enforce Whitelist Changes</td>
			<td><Input type="switch" bind:checked={serverProps['enforce-whitelist']}></Input></td>
		</tr>
		<tr>
			<td>Max. Players</td>
			<td><Input bind:value={serverProps['max-players']} type="number" min="0" max="99"></Input></td
			>
		</tr>
		<tr>
			<td><h3>World Settings</h3></td>
			<td></td>
		</tr>
		<tr>
			<td>Max. Render Distance</td>
			<td
				><Input bind:value={serverProps['view-distance']} type="number" min="3" max="32"
				></Input></td
			>
		</tr>
		<tr>
			<td>Max. Simulation Distance</td>
			<td
				><Input bind:value={serverProps['simulation-distance']} type="number" min="3" max="32"
				></Input></td
			>
		</tr>
		<tr>
			<td>Seed</td>
			<td><Input type="switch" bind:checked={serverProps['level-seed']}></Input></td>
		</tr>
		<tr>
			<td>Spawn Protection Size</td>
			<td><Input bind:value={serverProps['spawn-protection']} type="number" min="0"></Input></td>
		</tr>
		<tr>
			<td>Generate Structures</td>
			<td><Input type="switch" bind:checked={serverProps['generate-structures']}></Input></td>
		</tr>
		<tr>
			<td>World Size</td>
			<td
				><Input bind:value={serverProps['max-world-size']} type="number" min="1" max="29999984"
				></Input></td
			>
		</tr>
		<tr>
			<td><h3>Other Settings</h3></td>
			<td></td>
		</tr>
		<tr>
			<td>MOTD</td>
			<td><Input bind:value={serverProps.motd}></Input></td>
		</tr>
		<tr>
			<td>Enable Chat Reporting</td>
			<td><Input type="switch" bind:checked={serverProps['enforce-secure-profile']}></Input></td>
		</tr>
		<tr>
			<td>Enable Query</td>
			<td><Input type="switch" bind:checked={serverProps['enable-query']}></Input></td>
		</tr>
		<tr>
			<td>Online Mode</td>
			<td><Input type="switch" bind:checked={serverProps['online-mode']}></Input></td>
		</tr>
		<tr>
			<td
				><Button
					color="success"
					onclick={async () => {
						await saveProps();
					}}
					disabled={showWarn}
					>Save</Button
				></td
			>
			<td></td>
		</tr>
	</tbody>
</Table>
