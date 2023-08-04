/*
|-------------------------------------------------------------------------------
| Production config                       https://maizzle.com/docs/environments
|-------------------------------------------------------------------------------
|
| This is where you define settings that optimize your emails for production.
| These will be merged on top of the base config.js, so you only need to
| specify the options that are changing.
|
*/

const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const baseConfig = require('./config')
const getImagePathsFromHTML = require('./src/utils/getImagePaths')

const queue = []

module.exports = {
  build: {
    templates: {
      assets: false,
      destination: {
        path: 'build_production',
      },
    },
  },
  prettify: true,
  inlineCSS: true,
  removeUnusedCSS: true,
  shorthandCSS: true,
  events: {
    afterTransformers(html, config) {
      // Get image paths from HTML
      const imagePaths = getImagePathsFromHTML(html)

      queue.push({
        images: imagePaths,
        ...config.build.current,
      })

      return html
    },
    afterBuild() {
      // Process each item in the queue
      for (const {path: template, images} of queue) {
        // Read template's directory
        fs.readdir(template.dir, (err, files) => {
          // Exit early if there's an error
          if (err) throw err

          // Create archive
          const output = fs.createWriteStream(`${template.dir}/${template.name}.zip`)
          const archive = archiver('zip', {
            zlib: {
              level: 9 // Sets the compression level
            }
          })

          archive.on('error', function(err) {
            throw err
          })

          // Pipe archive data to the file
          archive.pipe(output)

          // Add files from template's directory to archive
          files.forEach(file => {
            archive.file(`${template.dir}/${file}`, { name: file })
          })

          // Get a list of files found in `src/images` that have been used in the template
          const assetsSource = baseConfig.build.templates.assets.source
          const globalImages = fs.readdirSync(assetsSource)
            .filter(file => images.includes(path.basename(file)))
            .map(file => path.join(assetsSource, file))

          // Add global images to archive
          globalImages.forEach(image => {
            archive.file(image, { name: path.basename(image) })
          })

          // Finalize the archive
          archive.finalize()
        })
      }
    },
  },
}
