<script lang="ts">
	import { Config } from '$lib/config/config';
	import { ApplicatonPaths } from '$lib/config/paths';
	import { Col, ListGroup, ListGroupItem } from '@sveltestrap/sveltestrap';
	import axios from 'axios';
	import { onMount } from 'svelte';

	let config: Config = $state(Config.blank());

	onMount(async () => {
		const tmpConfig = await axios.get(`http://${window.location.hostname}:6502/api/config`);
		config = tmpConfig.data;
	});
</script>

<h2>General Settings</h2>

<h3>Instance Information</h3>
<Col>
	<p>{config.branding === 'Minopanel' ? 'Minopanel' : 'Branding: ' + config.branding}</p>
	<p>{config.branding === 'Minopanel' ? '' : 'Minopanel '}Version {config.version}</p>
	<p>Host Operating System: {config.system}</p>
	<p>Host Architecture: {config.arch}</p>
	<p>Total Memory: ~{Math.floor(config.memory / 1000)}GB</p>
</Col>

<h3>Paths</h3>
<Col>
	<ListGroup>
		{#each ApplicatonPaths.toFancyStrings(config.paths) as path, index (index)}
			<ListGroupItem color={index % 2 === 0 ? 'info' : 'secondary'}>{path}</ListGroupItem>
		{/each}
	</ListGroup>
</Col>

<h3>Server Settings</h3>
<Col>
	<p>TCP Port: {config.backend.port}</p>
</Col>
