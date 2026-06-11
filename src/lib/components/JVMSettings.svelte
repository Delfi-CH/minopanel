<script lang="ts">
	import JVMDownloadInterface from '$lib/components/JVMDownloadInterface.svelte';
	import { CorretoOpenJDK, JavaVersion } from '$lib/jvm/java';
	import { Card, CardBody, CardHeader, CardTitle, Col, Button } from "@sveltestrap/sveltestrap"
	import axios from 'axios';
	import { onMount } from 'svelte';

	let allJavaVersions = $state(Object.values(JavaVersion));
	let localJavaVersions: CorretoOpenJDK[] = $state([]);
	allJavaVersions = allJavaVersions.slice(0, allJavaVersions.length / 2);

	let selectedJavaVersion: JavaVersion = $state(JavaVersion.OpenJdk25);
	let showOpenJdkDownload: boolean = $state(false);

	onMount(async () => {
		await fetchLocalJavaVersions();
	});

	async function fetchLocalJavaVersions() {
		const tmpJavaVersions = await axios.get('http://localhost:6502/api/jvm');
		localJavaVersions = tmpJavaVersions.data;
		allJavaVersions = allJavaVersions.filter(
			(e) => !localJavaVersions.map((e) => JavaVersion[e.version]).includes(e)
		);
	}
</script>

<h2>Java settings</h2>

<h3>Installations</h3>

<Col>
<h4>Local Installations</h4>
{#each localJavaVersions as jversion, index (index)}
	<Card>
		<CardHeader>
			<CardTitle>
				{JavaVersion[jversion.version]}
			</CardTitle>
		</CardHeader>
		<CardBody>
			<p>Path: {jversion.pathOnDisk}</p>
		</CardBody>
	</Card>
{/each}
</Col>

<Col>
<h4>Available Installations</h4>
{#each allJavaVersions as jversion, index (index)}
	<Card>
		<CardHeader>
			<CardTitle>{jversion}</CardTitle>
		</CardHeader>
		<CardBody>
			<Button
		onclick={() => {
			selectedJavaVersion = JavaVersion[jversion as keyof typeof JavaVersion];
			showOpenJdkDownload = true;
		}}>Download</Button
	>
		</CardBody>
	</Card>
{/each}
{#if allJavaVersions.length < 1}
	<p>No Java Installations available</p>
{/if}
</Col>

{#if showOpenJdkDownload}
	<JVMDownloadInterface
		javaVersion={selectedJavaVersion}
		onFinish={async () => {
			showOpenJdkDownload = false;
			await fetchLocalJavaVersions();
		}}
	></JVMDownloadInterface>
	<button onclick={() => (showOpenJdkDownload = false)}>Close</button>
{/if}
