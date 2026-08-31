import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  rules: {
    'ts/ban-ts-comment': 'off',
    'no-console': 'off',
  },
}, {
  ignores: ['**/__generated__.ts'],
})
