import { defineConfig } from 'orval'

export default defineConfig({
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
