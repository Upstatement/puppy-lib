const http = require('http');
const defaultsDeep = require('lodash.defaultsdeep');
const puppeteer = require('puppeteer');
const handle = require('serve-handler');
const through = require('through2');
const capture = require('./capture');

const DEFAULT_OPTIONS = {
  viewport: {
    width: 1000,
    height: 750,
    deviceScaleFactor: 1,
  },
  server: {
    public: 'dist',
  },
  exclude: page => page.screenshot === false,
};

module.exports = options => {
  options = defaultsDeep(options, DEFAULT_OPTIONS);
  return through.obj(async function(file, enc, cb) {
    const page = file.data && file.data.page;
    if (!file.contents || (page && options.exclude(page))) {
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
};

function startServer(config) {
  return http.createServer((req, resp) => handle(req, resp, config)).listen(0);
}

function startBrowser() {
  return puppeteer.launch({ headless: true });
}
