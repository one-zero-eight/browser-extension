import { defineConfig, presetIcons, presetWind } from 'unocss'

// https://unocss.dev/guide/config-file
export default defineConfig({
  content: {
    pipeline: {
      include: [
        'src/**/*.{tsx,ts,html}',
      ],
    },
  },
  presets: [presetWind(), presetIcons()],
  theme: {
    colors: {
      moodle: '#f60',
    },
  },
})
