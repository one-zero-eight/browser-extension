import antfu from '@antfu/eslint-config'

export default antfu({
  unocss: true,
  react: true,
  rules: {
    'ts/ban-ts-comment': 'off',
    'no-console': 'off',
  },
}, {
  ignores: ['**/__generated__.ts'],
})
