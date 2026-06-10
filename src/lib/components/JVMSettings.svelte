<script lang="ts">
	import JVMDownloadInterface from '$lib/components/JVMDownloadInterface.svelte';
	import { JavaVersion } from '$lib/jvm/java';

	let javaVersions = $state(Object.values(JavaVersion));
	javaVersions = javaVersions.slice(0, javaVersions.length / 2);

	let selectedJavaVersion: JavaVersion = $state(JavaVersion.OpenJdk25);
	let showOpenJdkDownload: boolean = $state(false);
</script>

<h2>Java settings</h2>

<h3>Installations</h3>

{#each javaVersions as jversion, index (index)}
	<p>{jversion}</p>
	<button
		onclick={() => {
			selectedJavaVersion = JavaVersion[jversion as keyof typeof JavaVersion];
			showOpenJdkDownload = true;
		}}>Download</button
	>
{/each}

{#if showOpenJdkDownload}
	<JVMDownloadInterface javaVersion={selectedJavaVersion}></JVMDownloadInterface>
	<button onclick={() => (showOpenJdkDownload = false)}>Close</button>
{/if}
