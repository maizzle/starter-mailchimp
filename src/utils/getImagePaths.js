module.exports = htmlString => {
  const imagePaths = []
  const regexSrcAttribute = /src=["'](.*?)["']/gi
  const regexBackgroundAttribute = /background=["'](.*?)["']/gi
  const regexInlineBackgroundCSS = /background(-image)?:\s?url\(['"](.*?)['"]\)/gi
  const regexSrcsetAttribute = /srcset=["'](.*?)["']/gi
  const regexPosterAttribute = /poster=["'](.*?)["']/gi
  const regexStyleTag = /<style\b[^>]*>(.*?)<\/style>/gi

  // Extract image paths from src attributes
  const srcMatches = htmlString.match(regexSrcAttribute)
  if (srcMatches) {
    srcMatches.forEach(match => {
      const imagePath = match.replace(regexSrcAttribute, '$1')
      imagePaths.push(imagePath)
    })
  }

  // Extract image paths from background attributes
  const backgroundMatches = htmlString.match(regexBackgroundAttribute)
  if (backgroundMatches) {
    backgroundMatches.forEach(match => {
      const imagePath = match.replace(regexBackgroundAttribute, '$1')
      imagePaths.push(imagePath)
    })
  }

  // Extract image paths from inline background CSS
  const inlineBackgroundMatches = htmlString.match(regexInlineBackgroundCSS)
  if (inlineBackgroundMatches) {
    inlineBackgroundMatches.forEach(match => {
      const imagePath = match.replace(regexInlineBackgroundCSS, '$2')
      imagePaths.push(imagePath)
    })
  }

  // Extract image paths from srcset attributes
  const srcsetMatches = htmlString.match(regexSrcsetAttribute)
  if (srcsetMatches) {
    srcsetMatches.forEach(match => {
      const imagePath = match.replace(regexSrcsetAttribute, '$1')
      // Split the srcset and add each image path individually
      const imagePathsArray = imagePath.split(/\s*,\s*/)
      imagePaths.push(...imagePathsArray)
    })
  }

  // Extract image paths from poster attributes
  const posterMatches = htmlString.match(regexPosterAttribute)
  if (posterMatches) {
    posterMatches.forEach(match => {
      const imagePath = match.replace(regexPosterAttribute, '$1')
      imagePaths.push(imagePath)
    })
  }

  // Extract image paths from CSS inside <style> tags in the <head>
  const styleTagMatches = htmlString.match(regexStyleTag)
  if (styleTagMatches) {
    styleTagMatches.forEach(styleTag => {
      const cssMatches = styleTag.match(regexInlineBackgroundCSS)
      if (cssMatches) {
        cssMatches.forEach(match => {
          const imagePath = match.replace(regexInlineBackgroundCSS, '$2')
          imagePaths.push(imagePath)
        })
      }
    })
  }

  return imagePaths
}
