import { defineConfig, presetIcons, presetWind } from 'unocss'

// https://unocss.dev/guide/config-file
export default defineConfig({
  presets: [presetWind(), presetIcons()],
  theme: {
    colors: {
      moodle: '#f60',
    },
  },
})
