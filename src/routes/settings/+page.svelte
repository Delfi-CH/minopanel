<script lang="ts">
	import JVMSettings from '$lib/components/settings/JVMSettings.svelte';
	import { Container, Row } from '@sveltestrap/sveltestrap';
	import InstanceSettings from '$lib/components/settings/InstanceSettings.svelte';
</script>

<Container>
	<h1>Settings</h1>
	<Row>
		<InstanceSettings></InstanceSettings>
	</Row>
	<Row>
		<JVMSettings></JVMSettings>
	</Row>
</Container>
