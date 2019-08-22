const fm = require('front-matter');
const { concat, through } = require('mississippi');
const stream = require('stream');
const vfs = require('vinyl-fs');
const { loadPages, loadData } = require('./utils');

const defaultOptions = {
  pages: './pages/**/*',
  data: './data/**/*',
  publicPath: '/',
  stream: true,
};

async function puppy(opts = defaultOptions) {
  opts = { ...defaultOptions, ...opts };

  // Load global template context asynchronously.
  const [pages, data] = await Promise.all([loadPages(opts.pages), loadData(opts.data)]);

  return new Promise((resolve, reject) => {
    // Source files from vinyl file system.
    const src = vfs.src(opts.pages);
    const transform = puppy.transform({ pages, data, publicPath: opts.publicPath });

    if (opts.stream) {
      resolve(stream.pipeline(src, transform));
    } else {
      stream.pipeline(src, transform, concat(resolve), err => err && reject(err));
    }
  });
}

puppy.transform = function({ pages, data, publicPath }) {
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
      site: { pages, data },

      // Puppy API functions.
      puppy: require('./api')({ pages, publicPath }),
    };

    // Strip front matter header from file contents.
    file.contents = Buffer.from(fm(file.contents.toString()).body);

    cb(null, file);
  });
};

module.exports = puppy;
