const Vinyl = require('vinyl');

/**
 * Capture screenshot with Puppeteer.
 *
 * @return Vinyl
 */
module.exports = async ({ file, browser, baseUrl, viewport }) => {
  const page = await browser.newPage();
  await page.setViewport(viewport);

  const url = `${baseUrl}/${file.relative}`;
  await page.goto(url);
  const screenshot = await page.screenshot();

  return new Vinyl({
    cwd: file.cwd,
    path: `${file.relative}.png`,
    contents: screenshot,
  });
};
