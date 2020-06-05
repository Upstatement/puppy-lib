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
  goto: {
    waitUntil: 'networkidle2',
  },
  screenshot: {
    type: 'png',
  },
  server: {
    public: 'dist',
  },
  pageCaptureOptions: page => page.screenshot,
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

    const image = await capture({
      file,
      baseUrl,
      browser,
      options: setupPageCaptureOptions(page, options),
    });

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

function setupPageCaptureOptions(page, pluginOptions) {
  const captureOptions = {
    viewport: pluginOptions.viewport,
    goto: pluginOptions.goto,
    screenshot: pluginOptions.screenshot,
  };
  const pageOptions =
    typeof pluginOptions.pageCaptureOptions === 'function' &&
    pluginOptions.pageCaptureOptions(page);
  if (pageOptions && typeof pageOptions === 'object') {
    return defaultsDeep(pageOptions, captureOptions);
  }
  return captureOptions;
}
