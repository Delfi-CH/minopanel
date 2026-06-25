<script lang="ts">
	import { onMount } from 'svelte';
	import { Container, Row, Col } from '@sveltestrap/sveltestrap';
	import axios from 'axios';
	import { getBackendURL } from '$lib/config/web';

	let config = $state({
		branding: 'Minopanel',
		version: '0.0.1'
	});

	onMount(async () => {
		const backendURL = getBackendURL();
		const res = await axios.get(`${backendURL}/api/config`);
		config = res.data;
	});
</script>

<Container>
	<Row>
		<Col>
			<h1>About {config.branding}</h1>
			{#if config.branding == 'Minopanel'}
				<p>{config.branding} Version {config.version}</p>
			{:else}
				<p>{config.branding}, based on Minopanel Version {config.version}</p>
			{/if}

			<p>
				This program is free software: you can redistribute it and/or modify it under the terms of
				the GNU Affero General Public License as published by the Free Software Foundation, either
				version 3 of the License, or (at your option) any later version.
			</p>
			<p>
				This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
				without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
				See the GNU Affero General Public License for more details.
			</p>
			<p>
				You should have received a copy of the GNU Affero General Public License along with this
				program. If not, see <a href="https://www.gnu.org/licenses/" target="_blank"
					>https://www.gnu.org/licenses/</a
				>.
			</p>
		</Col>
	</Row>
</Container>
