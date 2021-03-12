const Vinyl = require('vinyl');

/**
 * Capture screenshot with Puppeteer.
 *
 * @param {Object} captureParams
 * @param {Buffer} captureParams.file Buffer for the current file
 * @param {Object} captureParams.browserPage Puppeteer Page object https://pptr.dev/#?product=Puppeteer&version=v8.0.0&show=api-class-page
 * @param {String} captureParams.baseUrl Local server base URL
 * @param {Object} captureParams.options Page capture options
 *
 * @return {Vinyl}
 */
module.exports = async ({ file, browserPage, baseUrl, options }) => {
  await browserPage.setViewport(options.viewport);

  const url = `${baseUrl}/${file.relative}`;
  await browserPage.goto(url, options.goto);

  const screenshot = await browserPage.screenshot({
    ...options.screenshot,
    encoding: 'binary'
  });

  // https://github.com/gulpjs/vinyl#readme
  return new Vinyl({
    cwd: file.cwd,
    path: `${file.relative}.${options.screenshot.type}`,
    contents: screenshot,
  });
};
