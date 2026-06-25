<script lang="ts">
	import {
		Button,
		Modal,
		ModalBody,
		ModalFooter,
		ModalHeader,
		Label,
		Input
	} from '@sveltestrap/sveltestrap';
	import axios from 'axios';

	let { open, name, fullPath, onClose, onChange, backendURL } = $props();

	function toggle() {
		onClose();
	}

	async function uploadFiles(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const files = input.files;
		if (!files) return;

		const form = new FormData();
		form.append('targetPath', fullPath);

		for (const file of files) {
			form.append('files', file);
		}

		try {
			await axios.post(
				`${backendURL}/api/server/static/${name}/fs`,
				form
			);
			onChange();
		} catch (err) {
			console.error('Upload Error: ' + err);
		}
	}

	async function uploadFolder(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const files = input.files;
		if (!files) return;

		const form = new FormData();
		for (const file of files) {
			form.append('files', file);
		}
	}
</script>

<Modal isOpen={open} {toggle}>
	<ModalHeader {toggle} class="">Upload to {fullPath}</ModalHeader>
	<ModalBody>
		<Label for="fileInput">Upload Files</Label>
		<Input type="file" multiple onchange={async (e) => await uploadFiles(e)} />

		<Label for="dirInput">Upload a Folder</Label>
		<Input type="file" multiple webkitdirectory onchange={async (e) => await uploadFolder(e)} />
	</ModalBody>
	<ModalFooter>
		<Button onclick={onClose}>Close</Button>
	</ModalFooter>
</Modal>
