<script lang="ts">
	import DeleteModal from '$lib/components/DeleteModal.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Container, Row, Col, Button, Table, Input } from '@sveltestrap/sveltestrap';
	import axios from 'axios';
	import XTerm from '$lib/components/XTerm.svelte';
	import { ModloaderType } from '$lib/servers/servers.js';
	import { onMount } from 'svelte';

	let xterm;
	function restart() {
		xterm.startup();
	}

	let { data } = $props();

	let showDeleteModal = $state(false);
	let running = $state(false);

	let serverProps = $state({})

	onMount(async () => {
		await isRunning();
		await getProps()
		console.log(serverProps)
	});

	async function isRunning() {
		const tmpRunning = await axios.get(
			`http://${window.location.hostname}:6502/api/server/static/` + data.post.name + '/running'
		);
		running = tmpRunning.data;
	}

	async function getProps() {
		const tmpProps = await axios.get(
			`http://${window.location.hostname}:6502/api/server/static/` + data.post.name + '/props'
		)
		serverProps = tmpProps.data
	}

	async function saveProps() {
		const tmpProps = await axios.post(
			`http://${window.location.hostname}:6502/api/server/static/` + data.post.name + '/props', serverProps
		)
		
		serverProps = tmpProps.data
	}
</script>

<Container>
	<h1>{data.post.name}</h1>
	<Row>
		<Col>
			<Button
				disabled={!data.post.installed || running}
				color="success"
				onclick={async () => {
					await axios.get(`http://${window.location.hostname}:6502/api/server/static/` + data.post.name + '/start');
					restart();
					await isRunning();
				}}>Start</Button
			>
			<Button
				disabled={!data.post.installed || !running}
				color="warning"
				onclick={async () => {
					await axios.get(`http://${window.location.hostname}:6502/api/server/static/` + data.post.name + '/stop');
					restart();
					await isRunning();
				}}>Stop</Button
			>
			<Button
				disabled={!data.post.installed || !running}
				color="info"
				onclick={async () => {
					await axios.get(`http://${window.location.hostname}:6502/api/server/static/` + data.post.name + '/restart');
					restart();
					await isRunning();
				}}>Restart</Button
			>
			<Button
				onclick={async () => {
					await axios.post(`http://${window.location.hostname}:6502/api/server/static/` + data.post.name + '/setup');
					await isRunning();
				}}>Run Setup</Button
			>
			<Button
				onclick={() => {
					showDeleteModal = true;
				}}
				color="danger">Delete</Button
			>
		</Col>
	</Row>
	<Row>
		<h2>Server Console</h2>
		<Col>
			<XTerm serverID={data.post.name} bind:this={xterm}></XTerm>
		</Col>
	</Row>
	<Row>
		<h2>Info</h2>
		<Col>
			<p>Game Version: {data.post.mcVersion}</p>
			<p>
				Modloader: {data.post.modloader.type}
				{data.post.modloader.type !== ModloaderType.Vanilla
					? data.post.modloader.modloaderVersion
					: ''}
			</p>
		</Col>
	</Row>
	<Row>
		<h2>Settings</h2>
		<Col>
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
								<option value="peaceful">Peaceful</option>
								<option value="easy">Easy</option>
								<option value="normal">Normal</option>
								<option value="hard">Hard</option>
							</Input>
						</td>
					</tr>
					<tr>
						<td>Gamemode</td>
						<td>
							<Input type="select" bind:value={serverProps.gamemode}>
								<option value="survival">Survival</option>
								<option value="creative">Creative</option>
								<option value="adventure">Adventure</option>
								<option value="spectator">Spectator</option>
							</Input>
						</td>
					</tr>
					<tr>
						<td>Hardcore</td>
						<td><Input type="switch" bind:checked={serverProps["hardcore"]}></Input></td>
					</tr>
					<tr>
						<td>Allow Flight</td>
						<td><Input type="switch" bind:checked={serverProps["allow-flight"]}></Input></td>
					</tr>
					<tr>
						<td>Enforce Gamemode</td>
						<td><Input type="switch" bind:checked={serverProps["force-gamemode"]}></Input></td>
					</tr>
					<tr>
						<td>Use Whitelist</td>
						<td><Input type="switch" bind:checked={serverProps["white-list"]}></Input></td>
					</tr>
					<tr>
						<td>Enforce Whitelist Changes</td>
						<td><Input type="switch" bind:checked={serverProps["enforce-whitelist"]}></Input></td>
					</tr>
					<tr>
						<td>Max. Players</td>
						<td><Input bind:value={serverProps["max-players"]} type="number" min="0" max="99"></Input></td>
					</tr>
					<tr>
						<td><h3>World Settings</h3></td>
						<td></td>
					</tr>
					<tr>
						<td>Max. Render Distance</td>
						<td><Input bind:value={serverProps["view-distance"]} type="number" min="3" max="32"></Input></td>
					</tr>
					<tr>
						<td>Max. Simulation Distance</td>
						<td><Input bind:value={serverProps["simulation-distance"]} type="number" min="3" max="32"></Input></td>
					</tr>
					<tr>
						<td>Seed</td>
						<td><Input type="switch" bind:checked={serverProps["level-seed"]}></Input></td>
					</tr>
					<tr>
						<td>Spawn Protection Size</td>
						<td><Input bind:value={serverProps["spawn-protection"]} type="number" min="0"></Input></td>
					</tr>
					<tr>
						<td>Generate Structures</td>
						<td><Input type="switch" bind:checked={serverProps["generate-structures"]}></Input></td>
					</tr>
					<tr>
						<td>World Size</td>
						<td><Input bind:value={serverProps["max-world-size"]}  type="number" min="1" max="29999984"></Input></td>
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
						<td><Input type="switch" bind:checked={serverProps["enforce-secure-profile"]}></Input></td>
					</tr>
					<tr>
						<td>Enable Query</td>
						<td><Input type="switch" bind:checked={serverProps["enable-query"]}></Input></td>
					</tr>
					<tr>
						<td>Online Mode</td>
						<td><Input type="switch" bind:checked={serverProps["online-mode"]}></Input></td>
					</tr>
					<tr>
						<td><Button color="success" onclick={async()=>{
							await saveProps()
						}}>Save</Button></td>
						<td></td>
					</tr>
				</tbody>
			</Table>
		</Col>
	</Row>
</Container>

{#if showDeleteModal}
	<DeleteModal
		open={showDeleteModal}
		message={'Server ' + data.post.name}
		onClose={() => (showDeleteModal = false)}
		onDelete={async () => {
			await axios.delete(`http://${window.location.hostname}:6502/api/server/static/` + data.post.name + '');
			goto(resolve('/servers'));
		}}
	></DeleteModal>
{/if}
