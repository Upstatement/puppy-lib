const through = require('through2');
const http = require('http');
const puppeteer = require('puppeteer');
const handle = require('serve-handler');
const capture = require('./capture');

module.exports = (
  options = {
    viewport: {
      width: 1200,
      height: 600,
      deviceScaleFactor: 1,
    },
    server: {
      public: 'dist',
    },
  },
) =>
  through.obj(async function(file, enc, cb) {
    const page = file.data && file.data.page;
    if (
      !file.contents ||
      (page && (page.screenshot === false || page.menu === false))
    ) {
      cb();
      return;
    }
    const server = startServer(options.server);
    const browser = await startBrowser();

    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    const image = await capture({ file, baseUrl, browser, viewport: options.viewport });

    this.push(image);

    browser.close();
    server.close();

    cb();
  });

function startServer(config) {
  return http.createServer((req, resp) => handle(req, resp, config)).listen(0);
}

function startBrowser() {
  return puppeteer.launch({ headless: true });
}
