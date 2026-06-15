<script lang="ts">
	import { webDownloadManager } from '$lib/download/downloader';
	import { CorretoOpenJDK, JavaVersion } from '$lib/jvm/java';
	import { Card, CardBody, CardHeader, CardTitle, Col, Button } from '@sveltestrap/sveltestrap';
	import DeleteModal from './DeleteModal.svelte';
	import axios from 'axios';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	let allJavaVersions = $state(Object.values(JavaVersion));
	let downloadingVersions: SvelteSet<string | JavaVersion> = new SvelteSet<string | JavaVersion>();
	let localJavaVersions: CorretoOpenJDK[] = $state([]);

	let showDeleteModal = $state(false);
	let deleteModalMessage = $state('');
	let deletedJavaVersion = $state();

	onMount(async () => {
		await fetchLocalJavaVersions();
	});

	async function fetchLocalJavaVersions() {
		allJavaVersions = Object.values(JavaVersion);
		allJavaVersions = allJavaVersions.slice(0, allJavaVersions.length / 2);
		const tmpJavaVersions = await axios.get('http://localhost:6502/api/jvm');
		localJavaVersions = tmpJavaVersions.data;
		allJavaVersions = allJavaVersions.filter(
			(e) => !localJavaVersions.map((e) => JavaVersion[e.version]).includes(e)
		);
	}
</script>

<h2>Java settings</h2>

<h3>Java Versions</h3>

<Col>
	<h4>Installed</h4>
	{#each localJavaVersions as jversion, index (index)}
		<Card class="m-1">
			<CardHeader>
				<CardTitle>
					{JavaVersion[jversion.version]}
				</CardTitle>
			</CardHeader>
			<CardBody>
				<p>Path: {jversion.pathOnDisk}</p>
				<Button
					onclick={async () => {
						try {
							await axios.post(
								'http://localhost:6502/api/jvm/' + JavaVersion[jversion.version] + '/test'
							);
							jversion.selfTestState = 'Self Test was sucessfull';
						} catch {
							jversion.selfTestState = 'Self Test failed!';
						}
					}}>Run Self Test</Button
				>
				<Button
					color="warning"
					onclick={() => {
						deleteModalMessage = JavaVersion[jversion.version];
						showDeleteModal = true;
						deletedJavaVersion = jversion.version;
					}}>Delete</Button
				>
				<p
					class={jversion.selfTestState == 'Self Test was sucessfull'
						? 'text-success'
						: 'text-danger'}
				>
					{jversion.selfTestState}
				</p>
			</CardBody>
		</Card>
	{/each}
</Col>

<Col>
	<h4>Available</h4>
	{#each allJavaVersions as jversion, index (index)}
		<Card class="m-1">
			<CardHeader>
				<CardTitle>{jversion}</CardTitle>
			</CardHeader>
			<CardBody>
				<Button
					disabled={downloadingVersions.has(jversion)}
					onclick={() => {
						downloadingVersions.add(jversion);
						const task = webDownloadManager.addOpenJDKDownload(
							JavaVersion[jversion as keyof typeof JavaVersion]
						);
						webDownloadManager.startDownloadSilent(task.id);
						const interval = setInterval(async () => {
							console.log(!webDownloadManager.exists(task.id));
							if (!webDownloadManager.exists(task.id)) {
								clearInterval(interval);
								await fetchLocalJavaVersions();
								downloadingVersions.delete(jversion);
							}
						}, 1000);
					}}>{downloadingVersions.has(jversion) ? 'Downloading...' : 'Download'}</Button
				>
			</CardBody>
		</Card>
	{/each}
	{#if allJavaVersions.length < 1}
		<p>No Java Installations available</p>
	{/if}
	{#if showDeleteModal}
		<DeleteModal
			open={showDeleteModal}
			message={deleteModalMessage}
			onClose={() => {
				showDeleteModal = false;
			}}
			onDelete={async () => {
				showDeleteModal = false;
				// @ts-expect-error womp womp
				await axios.delete('http://localhost:6502/api/jvm/' + JavaVersion[deletedJavaVersion]);
				await fetchLocalJavaVersions();
			}}
		></DeleteModal>
	{/if}
</Col>
