<script lang="ts">
	import JVMDownloadInterface from '$lib/components/JVMDownloadInterface.svelte';
	import { CorretoOpenJDK, JavaVersion } from '$lib/jvm/java';
	import axios from 'axios';
	import { onMount } from 'svelte';

	let allJavaVersions = $state(Object.values(JavaVersion));
	let localJavaVersions: CorretoOpenJDK[] = $state([])
	allJavaVersions = allJavaVersions.slice(0, allJavaVersions.length / 2);

	let selectedJavaVersion: JavaVersion = $state(JavaVersion.OpenJdk25);
	let showOpenJdkDownload: boolean = $state(false);

	onMount(async ()=> {
		await fetchLocalJavaVersions()
	})

	async function fetchLocalJavaVersions() {
		const tmpJavaVersions = await axios.get("http://localhost:6502/api/jvm")
		localJavaVersions = tmpJavaVersions.data
		allJavaVersions = allJavaVersions.filter((e)=> !localJavaVersions.map((e)=> JavaVersion[e.version]).includes(e))
	}
</script>

<h2>Java settings</h2>

<h3>Installations</h3>

<h4>Local Installations</h4>
{#each localJavaVersions as jversion, index (index)}
	<p>{JavaVersion[jversion.version]}</p>
	<p>Path: {jversion.pathOnDisk}</p>
{/each}

<h4>Available Installations</h4>
{#each allJavaVersions as jversion, index (index)}
	<p>{jversion}</p>
	<button
		onclick={() => {
			selectedJavaVersion = JavaVersion[jversion as keyof typeof JavaVersion];
			showOpenJdkDownload = true;
		}}>Download</button
	>
{/each}
{#if allJavaVersions.length < 1}
	<p>No Java Installations available</p>
{/if}

{#if showOpenJdkDownload}
	<JVMDownloadInterface javaVersion={selectedJavaVersion} onFinish={async ()=> {
		showOpenJdkDownload = false
		await fetchLocalJavaVersions()
	}}></JVMDownloadInterface>
	<button onclick={() => (showOpenJdkDownload = false)}>Close</button>
{/if}
