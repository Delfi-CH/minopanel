# Minopanel Documentation

## User Manuel

### What is Minopanel

### Supported Systems

This is a list of Operating Systems and their support status

**Fully supported**: Officially supported with prebuilt Packages.

**Partially supported**: Working but not fully tested. Builds might exist for these systems.

**Untested**: Might work but hasn't been tested.

**Not supported**: These systems are confirmed not to wor.

Format:

- {Operating System Name} ({Processor Architectures})

#### Fully supported

none

#### Partially supported

- Debian GNU/Linux (x64, aarch64)

- Ubuntu Linux (x64, aarch64)

- Fedora Linux (x64)

- RedHat Enterprise Linux (x64)

- ArchLinux (x64)

- Generic Linux (x64)

#### Untested

- Windows 11 (x64, aarch64)

- macOS (x64, aarch64)

- FreeBSD (x64, aarch64)

- OpenBSD (x64, aarch64)

#### Not supported

- TempleOS (x64)

- Solaris and deriviates (x64)

### Installation

Not Implemented

### Configuration

#### Server

todo

#### WebUI

todo

#### CLI

todo

### Usage

todo

### FAQ

todo

## For Developers

### Tech-Stack

#### Frontend

- Toolkit: [Svelte](https://svelte.dev/)

- Styling: [Bootstrap](https://getbootstrap.com) via [Sveltestrap](https://sveltestrap.js.org) with a [Bootswatch Theme](https://bootswatch.com/)

- Development/Building: [Vite](https://vite.dev), [ESLint](https://eslint.org), [Prettier](https://prettier.io)

#### Backend

- Language/Toolkit: [Typescript](https://typescriptlang.org) with [NodeJS](https://nodejs.org) + [ExpressJS](https://expressjs.com/)

#### CLI

- Language/Toolkit: [Typescript](https://typescriptlang.org) with [NodeJS](https://nodejs.org)

#### Installer

todo

### Prerequesites

[NodeJS 22](https://nodejs.org/en/download) (or later)

[pnpm](https://pnpm.io/)

### Build from Source

1. Clone the repository

```sh
git clone https://github.com/Delfi-CH/minopanel.git
cd minopanel
```

2. Install all dependencies

```sh
pnpm install
```

3. Build a Target

**Frontend**

```sh
pnpm frontend:build
```

Output: `/build`

**Backend**

```sh
pnpm server:build
```

Output: `/dist/minopaneld.cjs`

**CLI**

```sh
pnpm cli:build
```

Output: `/dist/minoctl.cjs`

### Contribute

Contributions are always welcome as long as you follow the contribution rules.

#### Rules

1. Dont be a jerk.

    Be nice and respectful to other people. Dont harass, shame or insult anyone.

2. Understand your code.

    You must understand the code you are submitting. If you cant explain what your code does, dont submit it.

3. Be human.

    We dont want fully AI-generated Contributions. The usage of AI/LLMs is still allowed to assist with coding as long as you, a human, understands the code and opens the pull-request.

    Fully AI generated pull-request descriptions are not allowed.

4. Use english

    All Contributions (code, docs, Commit/PR descriptions, etc.) and Communication must be in english. You may use AI/LLM's to translate from/to your native language.

5. Test your code

    Make sure your code builds and runs on your Machine without any major issues before opening a pull-request.

To make a contributon, fork the repository, add your code and open a pull-request.
