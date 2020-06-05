const Vinyl = require('vinyl');

/**
 * Capture screenshot with Puppeteer.
 *
 * @return Vinyl
 */
module.exports = async ({ file, browser, baseUrl, options }) => {
  const page = await browser.newPage();
  await page.setViewport(options.viewport);

  const url = `${baseUrl}/${file.relative}`;
  await page.goto(url, options.goto);
  const screenshot = await page.screenshot({ ...options.screenshot, encoding: 'binary' });

  return new Vinyl({
    cwd: file.cwd,
    path: `${file.relative}.${options.screenshot.type}`,
    contents: screenshot,
  });
};
