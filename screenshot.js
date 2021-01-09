const { parse } = require('url')
const { getScreenshot } = require('./chromium')
const { getInt, getUrlFromPath, isValidUrl } = require('./validator')

module.exports = async function (req, res) {
  try {
    const { pathname = '/', query = {} } = parse(req.url, true)
    const { type = 'png', quality, fullPage } = query
    const url = getUrlFromPath(pathname)
    /*
      List (Strings) of domains that should be allowed to have the screenshot service,
      for example: const setOfDomains = ['rishi-raj-jain.github.io']
    */
    const setOfDomains = []
    if (
      setOfDomains.map((item) => url.indexOf(item) === -1).indexOf(false) < 0
    ) {
      res.statusCode = 403
      res.setHeader('Content-Type', 'text/html')
      res.end('Not a valid domain')
      return
    }
    const qual = getInt(quality)
    let viewportWidth = parseInt(req.query.viewportWidth || '1920')
    let viewportHeight = parseInt(req.query.viewportHeight || '1080')
    if (!isValidUrl(url)) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'text/html')
      res.end('Invalid URL')
      return
    } else {
      const file = await getScreenshot(
        url,
        type,
        qual,
        fullPage,
        viewportWidth,
        viewportHeight
      )
      res.statusCode = 200
      res.setHeader('Content-Type', `image/${type}`)
      /*
        Caching set to one day, change as per convenience
      */
      res.setHeader('Cache-Control', 's-maxage=86400')
      res.end(file)
    }
  } catch (e) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/html')
    res.end('There was some error')
    console.error(e.message)
  }
}
