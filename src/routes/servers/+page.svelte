<script lang="ts">
	import { resolve } from '$app/paths';
	import { ModloaderType, type MCServer } from '$lib/servers/servers';
	import {
		Container,
		Row,
		Col,
		Card,
		CardBody,
		CardHeader,
		CardTitle,
		Button,
		CardFooter

	} from '@sveltestrap/sveltestrap';
	import axios from 'axios';
	import { onMount } from 'svelte';

	let activeList: MCServer[] = $state([]);
	let inactiveList: MCServer[] = $state([]);

	onMount(async () => {
		const tmpList = await axios.get('http://localhost:6502/api/server/static');
		activeList = tmpList.data.filter((srv) => srv.running === true);
		inactiveList = tmpList.data.filter((srv) => srv.running === false);

	});
</script>

<Container>
	<h1>Servers</h1>
	<Row>
		<Col>
			<h2>Running</h2>
			{#each activeList as srv (srv.name)}
				<Card class="m-1">
					<CardHeader>
						<CardTitle>{srv.name}</CardTitle>
					</CardHeader>
				</Card>
			{/each}
		</Col>
		<Col>
			<h2>Stopped</h2>
			{#each inactiveList as srv (srv.name)}
				<Card class="m-1">
					<CardHeader>
						<CardTitle><a href={resolve("/servers/[slug]", {slug: srv.name})}>{srv.name}</a></CardTitle>
					</CardHeader>
					<CardBody>
						<p>Minecraft {srv.mcVersion}</p>
						{#if srv.modloader.type !== ModloaderType.Vanilla}
							<p>{srv.modloader.type} {srv.modloader.modloaderVersion}</p>
						{:else}
							<p>{srv.modloader.type}</p>
						{/if}
						<p>Java Version: {srv.preferedJavaVersion}</p>
						<p>Allocated RAM: {srv.memoryMin} - {srv.memoryMax}</p>
						<p>Installed: {srv.installed ? "Yes" : "No"}</p>
					</CardBody>
					<CardFooter>
						<Button href={resolve("/servers/[slug]", {slug: srv.name})}>View</Button>
					</CardFooter>
				</Card>
			{/each}
		</Col>
	</Row>
</Container>
