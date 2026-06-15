<script lang="ts">
	import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from '@sveltestrap/sveltestrap';

	let { open, message, onDelete, onClose } = $props();

	function toggle() {
		onClose();
	}
</script>

<Modal isOpen={open} {toggle}>
	<ModalHeader {toggle} class="bg-warning text-white">Warning!</ModalHeader>
	<ModalBody>
		Are you sure you want do delete {message}?
	</ModalBody>
	<ModalFooter>
		<Button onclick={onDelete} color="warning">Delete</Button>
		<Button onclick={onClose}>Close</Button>
	</ModalFooter>
</Modal>
