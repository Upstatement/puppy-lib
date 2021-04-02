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

/**
 * Get the screenshot options for each page
 *
 * @param {object} page Puppy page data (path, title, description, thumbnail, other front-matter)
 * @param {object} pluginOptions Options to override default puppeteer options
 *
 * @returns {object}
 */
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

/**
 * Start the server to visit in the headless Chrome instance
 *
 * @see https://nodejs.org/api/http.html#http_http_createserver_options_requestlistener
 *
 * @returns {http.Server}
 */
function startServer(config) {
  return http.createServer((req, resp) => handle(req, resp, config)).listen(0);
}

/**
 * Launch a headless Chrome instance
 *
 * @returns {Promise}
 */
function startBrowser() {
  return puppeteer.launch({ headless: true });
}

/**
 * Gulp Screenshots plugin
 *
 * @param {object} options Puppeteer config options
 *
 * @returns {Stream} Stream to pipe back into Gulp pipeline
 */
module.exports = options => {
  options = defaultsDeep(options, DEFAULT_OPTIONS);

  let streamStarted = false;
  let server;
  let browser;
  let browserPage;

  const stream = through.obj(async function(file, enc, cb) {

    try {
      // Only start the server & browser once
      if (!streamStarted) {
        server = startServer(options.server);
        browser = await startBrowser();
        browserPage = await browser.newPage();
        streamStarted = true;
      }
    } catch (e) {
      console.error(`Error in gulp screenshots -> starting puppeteer: ${e}`);
    }

    const page = file.data && file.data.page;

    if (!file.contents || (page && options.exclude(page))) {
      cb();
      return;
    }

    try {
      const { port } = server.address();
      const baseUrl = `http://127.0.0.1:${port}`;

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
      console.error(`Error in gulp screenshots -> capture: ${e}`);
    }
  });

  // https://nodejs.org/api/stream.html#stream_event_finish
  stream.on('finish', async () => {
    await browser.close();
    await server.close();
  });

  return stream;
};
