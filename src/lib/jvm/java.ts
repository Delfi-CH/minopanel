import { ApplicatonPaths } from "$lib/config/paths"
import { OperatingSystem, MachineArchitecture } from "$lib/system"
import isNode from "is-node"

export enum JavaVersion {
    OpenJdk26 = 26,
    OpenJdk25 = 25,
    OpenJdk21 = 21,
    OpenJdk17 = 17,
    OpenJdk8 = 8
}

export class CorretoOpenJDK {
    name: string
    version: JavaVersion
    system: OperatingSystem
    arch: MachineArchitecture
    downloadURL: string
    sha256URL: string
    fileExtension: string
    pathOnDisk: string = ""
    constructor(name: string, version: JavaVersion, system: OperatingSystem, arch: MachineArchitecture) {
        this.name = name
        this.version = version
        this.system = system
        this.arch = arch
        this.fileExtension = system === OperatingSystem.Windows ? "zip" : "tar.gz" 
        this.downloadURL = `https://corretto.aws/downloads/latest/amazon-corretto-${version}-${arch}-${system}-jdk.${this.fileExtension}`
        this.sha256URL = `https://corretto.aws/downloads/latest_sha256/amazon-corretto-${version}-${arch}-${system}-jdk.${this.fileExtension}`
    }

    test() {

    }

    async writeToDisk() {
        if (isNode) {
            const { writeFile } = await import("node:fs/promises")
            const paths = new ApplicatonPaths(this.system)
            const filepath = paths.jdkMetadataDirectory + "/openjdk" + this.version + ".json"
            await writeFile(filepath, JSON.stringify(this), 'utf8')
        } else {
            throw new Error("not a nodejs enviroment")
        }
    }
}