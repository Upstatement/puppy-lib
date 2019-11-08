const fm = require('front-matter');
const { concat, through } = require('mississippi');
const stream = require('stream');
const vfs = require('vinyl-fs');
const { loadPages, loadData } = require('./context');

const defaultOptions = {
  pages: './pages/**/*',
  data: './data/**/*',
  publicPath: '/',
  context: {},
  stream: true,
};

async function puppy(opts = defaultOptions) {
  opts = { ...defaultOptions, ...opts };

  // Load global template context asynchronously.
  const siteContext = await puppy.loadSiteContext(opts);

  return new Promise((resolve, reject) => {
    // Source files from vinyl file system.
    const src = vfs.src(opts.pages);
    const transform = puppy.transform({
      ...siteContext,
      publicPath: opts.publicPath,
      context: opts.context,
    });

    if (opts.stream) {
      resolve(src.pipe(transform));
    } else {
      stream.pipeline(src, transform, concat(resolve), err => err && reject(err));
    }
  });
}

puppy.loadSiteContext = async function(opts) {
  const [pages, data] = await Promise.all([loadPages(opts.pages), loadData(opts.data)]);

  return {
    pages,
    data,
  };
};

puppy.transform = function({ pages, data, publicPath, context }) {
  return through.obj(function(file, _, cb) {
    // Bail on empty files / directories.
    if (file.isNull()) {
      return cb(null, file);
    }

    file.data = file.data || {};

    // Merge site/page data and Puppy API functions into vinyl data.
    file.data = {
      // Merge existing data with...
      ...file.data,

      // Current page context.
      page: pages.find(f => f.path === file.relative),

      // Site-wide context.
      site: { pages, data, ...context },

      // Puppy API functions.
      puppy: require('./api')({ pages, publicPath }),
    };

    // Strip front matter header from file contents.
    file.contents = Buffer.from(fm(file.contents.toString()).body);

    cb(null, file);
  });
};

module.exports = puppy;
