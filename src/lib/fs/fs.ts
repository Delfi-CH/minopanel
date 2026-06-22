import * as fsPromises from 'node:fs/promises';
import { fsDTO } from './dataTransferObjects';
import * as path from 'node:path';

export async function readDirectory(dirPath: string): Promise<fsDTO[]> {
	const dir = await fsPromises.opendir(dirPath);
	const fsList: fsDTO[] = [];

	for await (const dirent of dir) {
		const fullPath = path.join(dirPath, dirent.name);

		let children: fsDTO[] = [];

		if (dirent.isDirectory()) {
			children = await readDirectory(fullPath);
		}

		fsList.push(
			new fsDTO(
				dirent.name, // or fullPath if you want the complete path
				dirent.isDirectory(),
				children
			)
		);
	}

	return fsList;
}
