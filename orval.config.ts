import { defineConfig } from 'orval'

export default defineConfig({
  events: {
    input: {
      target: 'https://api.innohassle.ru/events/staging-v0/openapi.json',
    },
    output: {
      mode: 'single',
      target: './src/shared/innohassle-api/events/__generated__.ts',
      client: 'axios',
      override: {
        mutator: {
          path: './src/shared/innohassle-api/events/axios.ts',
          name: 'eventsQueryPromise',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: {
        command: 'pnpm run lint:fix:generated',
        injectGeneratedDirsAndFiles: false,
      },
    },
  },
  search: {
    input: {
      target: 'https://api.innohassle.ru/search/staging-v0/openapi.json',
    },
    output: {
      mode: 'single',
      target: './src/shared/innohassle-api/search/__generated__.ts',
      client: 'axios',
      override: {
        mutator: {
          path: './src/shared/innohassle-api/search/axios.ts',
          name: 'searchQueryPromise',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: {
        command: 'pnpm run lint:fix:generated',
        injectGeneratedDirsAndFiles: false,
      },
    },
  },
})
