<script lang="ts">
	import DeleteModal from '$lib/components/DeleteModal.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from "$app/paths"
	let { data } = $props();
	import { Container, Row, Col, Button } from '@sveltestrap/sveltestrap';
	import axios from 'axios';

	let showDeleteModal = $state(false)
</script>

<Container>
	<Row>
		<h1>{data.post.name}</h1>
		<Col>
			<h2>hamburger</h2>
		</Col>
		<Col>
			<Button onclick={async ()=> {
				await axios.post("http://localhost:6502/api/server/static/" + data.post.name + "/setup")
			}}>Run Setup</Button>
			<Button onclick={()=> {
				showDeleteModal = true
			}} color="warning">Delete</Button>
		</Col>
	</Row>
</Container>

{#if showDeleteModal}
	<DeleteModal open={showDeleteModal} message={"Server " + data.post.name} onClose={()=> showDeleteModal =false} onDelete={async()=>{
		await axios.delete("http://localhost:6502/api/server/static/" + data.post.name + "")
		goto(resolve("/servers"))
	}}></DeleteModal>
{/if}


