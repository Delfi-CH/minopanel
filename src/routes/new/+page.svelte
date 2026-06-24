<script lang="ts">
	import { MCServer, Modloader, ModloaderType } from '$lib/servers/servers';
	import { onMount } from 'svelte';
	import { Container, Row, Col, Form, Label, Input, Button } from '@sveltestrap/sveltestrap';
	import { CorretoOpenJDK, JavaVersion } from '$lib/jvm/java';
	import axios from 'axios';
	import type { ApplicatonPaths } from '$lib/config/paths';

	let newServerName: string = $state('');
	let selectedVersion: string = $state('');
	let availableMCVersions: string[] = $state([]);
	let selectedModloader: ModloaderType = $state(ModloaderType.Vanilla);
	let availableModloaders = $state(Object.values(ModloaderType));
	let selectedJavaVersion: JavaVersion = $state(JavaVersion.OpenJdk26);
	let avialableJavaVersions: CorretoOpenJDK[] = $state([]);
	let agreedToEula = $state(false)
	let errorMessage = $state('');

	let paths: ApplicatonPaths | undefined = $state();

	onMount(async () => {
		await getAvailableVersions();

		const tmpJavaVersions = await axios.get(`http://${window.location.hostname}:6502/api/jvm`);
		avialableJavaVersions = tmpJavaVersions.data;

		const config = await axios.get(`http://${window.location.hostname}:6502/api/config`);
		paths = config.data.paths;
	});

	async function getAvailableVersions() {
		const tmpVersions = await Modloader.getSupportedMCVersions(selectedModloader);
		availableMCVersions = tmpVersions;
		if (!availableMCVersions.includes(selectedVersion)) {
			selectedVersion = '';
		}
	}

	function checkIfJavaVersionIsEnabled(version: JavaVersion) {
		const list = Modloader.getSupportedJavaVersions(selectedVersion);
		console.log(list.includes(JavaVersion.OpenJdk26));
		return list.includes(version);
	}

	function validateEmAll() {
		return (
			newServerName !== '' &&
			selectedVersion !== '' &&
			checkIfJavaVersionIsEnabled(selectedJavaVersion) &&
			agreedToEula
		);
	}
</script>

<Container>
	<Row>
		<h1>Create new Server</h1>
		<Col>
			<Form
				onsubmit={async () => {
					const ml = new Modloader(selectedModloader, selectedVersion);

					await ml.buildURL();

					const server = new MCServer(
						newServerName,
						selectedVersion,
						ml,
						selectedJavaVersion as JavaVersion
					);
					console.log(server);
					if (!paths) {
						throw new Error('Paths not loaded!');
					}
					try {
						await axios.post(`http://${window.location.hostname}:6502/api/server/static`, server);
						server.installFiles(paths);
						setTimeout(async () => {
							await axios.post(
								`http://${window.location.hostname}:6502/api/server/static/` +
									server.name +
									'/setup'
							);
						}, 2000);
					} catch (err) {
						if (err.status === 409) {
							errorMessage = `Duplicate name: "${server.name}"! Each Server must have a unique name!`;
						} else {
							errorMessage = 'Server Error: ' + err;
						}
					}
				}}
			>
				<Label for="name">Name</Label>
				<Input
					type="text"
					id="name"
					bind:value={newServerName}
					valid={newServerName !== ''}
					required
					invalid={newServerName === ''}
					pattern="[A-Za-z0-9_-]+"
				/>
				{#if newServerName === ''}
					<p class="text-danger">Enter a name!</p>
				{:else}
					<br />
				{/if}
				<Label for="version">Modloader</Label>
				<Input
					id="version"
					bind:value={selectedModloader}
					type="select"
					required
					onchange={async () => await getAvailableVersions()}
				>
					{#each availableModloaders as ver (ver)}
						<option value={ver}>{ver}</option>
					{/each}
				</Input>
				<br />
				<Label for="version">Game Version</Label>
				<Input
					id="version"
					bind:value={selectedVersion}
					type="select"
					required
					valid={selectedVersion !== ''}
					invalid={selectedVersion === ''}
					disabled={availableMCVersions.length <= 0}
				>
					{#each availableMCVersions as ver (ver)}
						<option value={ver}>{ver}</option>
					{/each}
				</Input>
				{#if selectedVersion === ''}
					<p class="text-danger">Select a Minecraft Version!</p>
				{:else}
					<br />
				{/if}
				<Label for="java">Java Version</Label>
				{#if avialableJavaVersions.length > 1 && selectedVersion != ''}
					<Input id="java" bind:value={selectedJavaVersion} type="select" required>
						{#each avialableJavaVersions as ver (ver)}
							<option value={ver.version} disabled={!checkIfJavaVersionIsEnabled(ver.version)}
								>{JavaVersion[ver.version]}</option
							>
						{/each}
					</Input>
					<br />
					{#if !checkIfJavaVersionIsEnabled(selectedJavaVersion)}
						<p class="text-danger">
							Minecraft {selectedVersion} does not support {JavaVersion[selectedJavaVersion]}!
							Please select a newer Java Version!
						</p>
					{/if}
				{:else if selectedVersion == ''}
					<p class="text-danger">No Minecraft Version selected!</p>
				{:else}
					<p class="text-danger">
						No Java Versions installed! Please install one from the Settings Page.
					</p>
				{/if}
				<div class="d-flex gap-2 align-items-center">
					<Label for="eula">I agree to the Minecraft EULA <a href="https://www.minecraft.net/eula" target="_blank">(minecraft.net/eula)</a></Label>
					<Input type="checkbox" bind:checked={agreedToEula} id="eula" required></Input>
				</div>
				<br />
				<Button
					type="submit"
					disabled={!validateEmAll()}
					class={validateEmAll() ? 'bg-success' : 'bg-dark'}>Create</Button
				>
				<br />
				<p class="text-danger">{errorMessage}</p>
			</Form>
		</Col>
	</Row>
</Container>
