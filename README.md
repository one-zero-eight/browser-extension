# InNoHassle Browser extension

[Browser extension](https://innohassle.ru/extension)

This is a browser extension for students of Innopolis University. It is designed to make the life of students easier by providing a set of useful tools and features.

## Features

- **Moodle Autologin**: Automatically logs you in to Moodle when you open the page.
- **Useful Links**: Direct links to frequently accessed course pages, university portals and other useful resources.
- **Search Field**: Search anything using InNoHassle Search.
- **Download Course Content**: Every course in the popup's course list has a button that downloads all of its files as a single ZIP archive, keeping the section / activity folder structure. A floating **Download course** button also appears in the upper-right corner of any Moodle course page. These features reuse your existing Moodle browser session; when you are signed out the popup shows **Sign in** (and the download buttons show **Sign in to Moodle**) with a link to open Moodle.
- **All Courses Toggle**: A popup-wide switch between courses *in progress* and *all* enrolled courses (including finished ones).

## Development

### Prerequisites

- **Node.js** 18+ (20/22/24 work too)
- **pnpm** — pinned to 9 via the `packageManager` field (matches CI). With
  Corepack enabled, the right version is selected automatically:

  ```sh
  corepack enable
  ```

### Install

```sh
pnpm install
```

### Run the dev server

```sh
pnpm dev            # Chrome build, watch mode
pnpm dev:firefox    # Firefox build, watch mode
```

In Chrome, Vite serves on <http://localhost:5173> and writes the unpacked extension to
`build/` with hot-reload on save. In Firefox, crxjs can't serve extension pages
from the dev server, so `pnpm dev:firefox` runs `vite build --watch`: `build/` is
rebuilt on save, but you reload the add-on manually in `about:debugging`.

Load it into the browser:

- **Chrome / Edge** — open `chrome://extensions`, enable **Developer mode**,
  click **Load unpacked**, select the `build/` directory.
- **Firefox** — open `about:debugging#/runtime/this-firefox`, click
  **Load Temporary Add-on**, select `build/manifest.json`. Then grant the host
  permissions (Firefox does not grant them automatically, so without this the
  extension can't read Moodle and "Sign in" does nothing):
  1. Open `about:addons`, select the extension, open the **Permissions** tab.
  2. Enable access to `moodle.innopolis.university` and `*.innohassle.ru`.

Keep `pnpm dev` running; in Chrome the extension reloads automatically as you edit.

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
