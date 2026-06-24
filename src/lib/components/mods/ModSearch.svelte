<script lang="ts">
	import { getAllTheMods, type ModrinthQueryOptions, resultsPerPage } from '$lib/mods/modrinth';
	import { ModloaderType } from '$lib/servers/servers';
	import {
		Label,
		Input,
		Col,
		Row,
		Pagination,
		PaginationItem,
		PaginationLink
	} from '@sveltestrap/sveltestrap';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import ModSearchItem from '$lib/components/mods/ModSearchItem.svelte';

	let modList = $state([]);
	let queryString = $state('');
	let showIncompatibleVersions = $state(false);
	let paginationPosition = $state(1);
	let queryOffset = $derived((paginationPosition - 1) * resultsPerPage);
	let paginationLength = $state(1);
	let paginationList: SvelteSet<number> = new SvelteSet<number>();

	let { gameVersion, modloader, serverName } = $props();

	onMount(async () => {
		await queryModrinth();
	});

	async function queryModrinth() {
		let opts: ModrinthQueryOptions = {
			modloader: modloader,
			offset: queryOffset
		};
		if (!showIncompatibleVersions) {
			opts = { ...opts, gameVersion: gameVersion };
		}
		if (queryString !== '') {
			opts = { ...opts, query: queryString };
		}
		const tmpList = await getAllTheMods(opts);
		paginationLength = Math.ceil(tmpList.total_hits / resultsPerPage);
		for (let x = 1; x < paginationLength; x++) {
			paginationList.add(x);
		}
		modList = tmpList.hits;
	}
</script>

{#if modloader !== ModloaderType.Vanilla}
	<Row>
		<h2>
			{modloader === ModloaderType.Forge ||
			modloader === ModloaderType.Fabric ||
			modloader === ModloaderType.NeoForge
				? 'Mods'
				: 'Plugins'}
		</h2>
		<Col>
			<h3>Search & Install {modloader === ModloaderType.Forge ||
			modloader === ModloaderType.Fabric ||
			modloader === ModloaderType.NeoForge
				? 'Mods'
				: 'Plugins'} from Modrinth</h3>

			<Label>Name</Label>
			<Input bind:value={queryString} type="text" onchange={async () => await queryModrinth()}
			></Input>

			<div class="d-flex gap-2 align-items-center">
				<Label>Show incompatible versions</Label>
				<Input
					bind:checked={showIncompatibleVersions}
					type="switch"
					onchange={async () => await queryModrinth()}
				></Input>
			</div>
		</Col>
	</Row>
	<Row cols={1}>
		{#each modList as mod, index (index)}
			<ModSearchItem mod={mod} gameVersion={gameVersion} modloader={modloader} serverName={serverName}></ModSearchItem>
		{/each}
		<Col>
			<Pagination>
				<PaginationItem>
					<PaginationLink
						first
						onclick={async (e) => {
							e.preventDefault();
							paginationPosition = 1;
							await queryModrinth();
						}}
					></PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink
						previous
						onclick={async (e) => {
							e.preventDefault();
							paginationPosition--;
							await queryModrinth();
						}}
					></PaginationLink>
				</PaginationItem>
				{#each paginationList as num, index (index)}
					{#if paginationPosition + 3 >= num && paginationPosition - 3 <= num}
						<PaginationItem active={paginationPosition === num}>
							<PaginationLink
								onclick={async (e) => {
									e.preventDefault();
									paginationPosition = num;
									await queryModrinth();
								}}>{num}</PaginationLink
							>
						</PaginationItem>
					{/if}
				{/each}
				<PaginationItem>
					<PaginationLink
						next
						onclick={async (e) => {
							e.preventDefault();
							paginationPosition++;
							await queryModrinth();
						}}
					></PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink
						last
						onclick={async (e) => {
							e.preventDefault();
							paginationPosition = paginationLength - 1;
							await queryModrinth();
						}}
					></PaginationLink>
				</PaginationItem>
			</Pagination>
		</Col>
	</Row>
{/if}
