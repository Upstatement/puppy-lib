const Vinyl = require('vinyl');

/**
 * Capture screenshot with Puppeteer.
 *
 * @return Vinyl
 */
module.exports = async ({ file, browserPage, baseUrl, options }) => {
  await browserPage.setViewport(options.viewport);

  const url = `${baseUrl}/${file.relative}`;
  await browserPage.goto(url, options.goto);

  const screenshot = await browserPage.screenshot({
    ...options.screenshot,
    encoding: 'binary'
  });

  return new Vinyl({
    cwd: file.cwd,
    path: `${file.relative}.${options.screenshot.type}`,
    contents: screenshot,
  });
};
