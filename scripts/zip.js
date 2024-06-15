import { createRequire } from 'node:module'
import gulp from 'gulp'
import zip from 'gulp-zip'

const require = createRequire(import.meta.url)
const manifest = require('../build/manifest.json')

gulp
  .src('build/**')
  .pipe(zip(`${manifest.name.replaceAll(' ', '-')}-${manifest.version}.zip`))
  .pipe(gulp.dest('package'))
console.log(`${manifest.name.replaceAll(' ', '-')}-${manifest.version}.zip`)
