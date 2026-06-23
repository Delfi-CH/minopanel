import * as fsPromises from 'node:fs/promises';
import { fsDTO } from './dataTransferObjects';
import * as path from 'node:path';

export async function readDirectory(dirPath: string): Promise<fsDTO> {
	const dir = await fsPromises.opendir(dirPath);
	const children: fsDTO[] = [];

	for await (const dirent of dir) {
		const fullPath = path.join(dirPath, dirent.name);

		let grandChildren: fsDTO[] = [];

		if (dirent.isDirectory()) {
			const subtree = await readDirectory(fullPath);
			grandChildren = subtree.children;
		}

		children.push(new fsDTO(dirent.name, dirent.isDirectory(), grandChildren));
	}

	return new fsDTO(path.basename(dirPath) || dirPath, true, children);
}
