export class fsDTO {
	path: string;
	directory: boolean;
	children: fsDTO[];
	constructor(path: string, directory: boolean, children?: fsDTO[]) {
		this.path = path;
		this.directory = directory;
		if (!children) {
			this.children = [];
		} else {
			this.children = children;
		}
	}
}
