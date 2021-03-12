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
    type: 'jpeg',
  },
  server: {
    public: 'dist',
  },
  pageCaptureOptions: page => page.screenshot,
  exclude: page => page.screenshot === false,
};

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

function startServer(config) {
  return http.createServer((req, resp) => handle(req, resp, config)).listen(0);
}

function startBrowser() {
  return puppeteer.launch({ headless: true });
}

module.exports = options => {
  options = defaultsDeep(options, DEFAULT_OPTIONS);

  let streamStarted = false;
  let server;
  let browser;
  let browserPage;

  const stream = through.obj(async function(file, enc, cb) {
    if (!streamStarted) {
      server = startServer(options.server);
      browser = await startBrowser();
      browserPage = await browser.newPage();
      streamStarted = true;
    }

    const page = file.data && file.data.page;

    if (!file.contents || (page && options.exclude(page))) {
      cb();
      return;
    }

    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      const image = await capture({
        file,
        baseUrl,
        browserPage,
        options: setupPageCaptureOptions(page, options),
      });

      // Push image to stream
      this.push(image);

      cb();

    } catch (e) {
      console.error(`Error in gulpScreenshots: ${e}`);
    }
  });

  stream.on('finish', async () => {
    await browser.close();
    await server.close();
  });

  return stream;
};
