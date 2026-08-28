# InNoHassle Browser extension

[Browser extension](https://innohassle.ru/extension)

This is a browser extension for students of Innopolis University. It is designed to make the life of students easier by providing a set of useful tools and features.

## Features

- **Moodle Autologin**: Automatically logs you in to Moodle when you open the page.
- **Useful Links**: Direct links to frequently accessed course pages, university portals and other useful resources.
- **Search Field**: Search anything using InNoHassle Search.
- **Download Course Content**: Every course in the popup's course list has a button that downloads all of its files as a single ZIP archive, keeping the section / activity folder structure.
- **All Courses Toggle**: A popup-wide switch between courses *in progress* and *all* enrolled courses (including finished ones).

## Development

### Prerequisites

- **Node.js** 18+ (20/22/24 work too)
- **pnpm** — the project uses a `pnpm-lock.yaml`. pnpm 9 matches CI:

  ```sh
  corepack enable pnpm
  corepack prepare pnpm@9 --activate
  ```

  pnpm 10/11 also work; they require the settings already present in
  `pnpm-workspace.yaml` (`onlyBuiltDependencies` to allow esbuild's build
  script, `verifyDepsBeforeRun: false` so `pnpm dev` doesn't re-run install).

### Install

```sh
pnpm install
```

### Run the dev server

```sh
pnpm dev            # Chrome build, watch mode
pnpm dev:firefox    # Firefox build, watch mode
```

Vite serves on <http://localhost:5173> and writes the unpacked extension to
`build/` with hot-reload on save.

Load it into the browser:

- **Chrome / Edge** — open `chrome://extensions`, enable **Developer mode**,
  click **Load unpacked**, select the `build/` directory.
- **Firefox** — open `about:debugging#/runtime/this-firefox`, click
  **Load Temporary Add-on**, select `build/manifest.json`.

Keep `pnpm dev` running; the extension reloads automatically as you edit.

### Production build

```sh
pnpm build:chrome   # or: pnpm build:firefox  (runs tsc, then vite build -> build/)
pnpm zip:chrome     # or: pnpm zip:firefox    (build + package -> package/*.zip)
```

### Other scripts

| Command | Description |
| --- | --- |
| `pnpm lint` / `pnpm lint:fix` | Run ESLint (with `--fix`) |
| `pnpm generate-api` | Regenerate the InNoHassle API clients with Orval |
| `pnpm deps` | Interactively upgrade dependencies with taze |
