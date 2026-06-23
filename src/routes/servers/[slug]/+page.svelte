<script lang="ts">
	import DeleteModal from '$lib/components/DeleteModal.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Container, Row, Col, Button } from '@sveltestrap/sveltestrap';
	import axios from 'axios';
	import XTerm from '$lib/components/XTerm.svelte';
	import { ModloaderType } from '$lib/servers/servers.js';
	import { onMount } from 'svelte';
	import FileViewer from '$lib/components/fs/FileViewer.svelte';
	import ServerSettings from '$lib/components/settings/ServerSettings.svelte';
	import ServerLogs from '$lib/components/logs/ServerLogs.svelte';

	let xterm;
	function restart() {
		xterm.startup();
	}

	let { data } = $props();

	let showDeleteModal = $state(false);
	let running = $state(false);

	let fsData = $state([]);

	onMount(async () => {
		await isRunning();
		await getFS();
	});

	async function isRunning() {
		const tmpRunning = await axios.get(
			`http://${window.location.hostname}:6502/api/server/static/` + data.post.name + '/running'
		);
		running = tmpRunning.data;
	}

	async function getFS() {
		const tmpFS = await axios.get(
			`http://${window.location.hostname}:6502/api/server/static/` + data.post.name + '/fs'
		);
		fsData = tmpFS.data;
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
					await axios.get(
						`http://${window.location.hostname}:6502/api/server/static/` + data.post.name + '/start'
					);
					restart();
					await isRunning();
				}}>Start</Button
			>
			<Button
				disabled={!data.post.installed || !running}
				color="warning"
				onclick={async () => {
					await axios.get(
						`http://${window.location.hostname}:6502/api/server/static/` + data.post.name + '/stop'
					);
					restart();
					await isRunning();
				}}>Stop</Button
			>
			<Button
				disabled={!data.post.installed || !running}
				color="info"
				onclick={async () => {
					await axios.get(
						`http://${window.location.hostname}:6502/api/server/static/` +
							data.post.name +
							'/restart'
					);
					restart();
					await isRunning();
				}}>Restart</Button
			>
			<Button
				onclick={async () => {
					await axios.post(
						`http://${window.location.hostname}:6502/api/server/static/` + data.post.name + '/setup'
					);
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
			<ServerSettings name={data.post.name}></ServerSettings>
		</Col>
	</Row>
	<Row>
		<h2>Filesystem</h2>
		<Col>
			<FileViewer fsData={fsData}></FileViewer>
		</Col>
	</Row>
	<Row>
		<h2>Server Logs</h2>
		<Col>
			<ServerLogs name={data.post.name}></ServerLogs>
		</Col>
	</Row>
</Container>

{#if showDeleteModal}
	<DeleteModal
		open={showDeleteModal}
		message={'Server ' + data.post.name}
		onClose={() => (showDeleteModal = false)}
		onDelete={async () => {
			await axios.delete(
				`http://${window.location.hostname}:6502/api/server/static/` + data.post.name + ''
			);
			goto(resolve('/servers'));
		}}
	></DeleteModal>
{/if}
