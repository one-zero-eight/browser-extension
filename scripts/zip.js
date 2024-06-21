import { createRequire } from 'node:module'
import process from 'node:process'
import gulp from 'gulp'
import zip from 'gulp-zip'

const require = createRequire(import.meta.url)
const manifest = require('../build/manifest.json')

const postfix = process.argv[2] ? `-${process.argv[2]}` : ''

const isFirefox = process.env.BROWSER === 'firefox'
const browserPostfix = isFirefox ? '-firefox' : '-chrome'

const dashedName = manifest.name.replaceAll(' ', '-')
const fileName = `${dashedName}-${manifest.version}${postfix}${browserPostfix}.zip`

gulp
  .src('build/**')
  .pipe(zip(fileName))
  .pipe(gulp.dest('package'))

console.log(fileName)
