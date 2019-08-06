const fm = require('front-matter');
const through = require('through2');
const vfs = require('vinyl-fs');
const { loadPages, loadData } = require('./utils');

module.exports = async function puppy(
  opts = { pages: './pages/**/*', data: './data/**/*', publicPath: '/' },
) {
  // Load global template context asynchronously.
  const [pages, data] = await Promise.all([
    loadPages(opts.pages), // TODO: PuppyPage[]
    loadData(opts.data), // TODO: PuppyData
  ]);

  // Annotate each file with global site data.
  return vfs.src(opts.pages).pipe(
    through.obj(function(file, _, cb) {
      if (file.isNull()) {
        return cb(null, file);
      }

      // Pull current page.
      const page = pages.find(f => f.path === file.relative);

      file.data = file.data || {};

      // Merge site/page data and Puppy API functions into vinyl data.
      file.data = {
        ...file.data,
        page, // TODO: PuppyPage
        site: { pages, data }, // TODO: PuppySite
        puppy: require('./api')({ pages, publicPath: opts.publicPath }),
      };

      // Remove front matter header,
      file.contents = Buffer.from(fm(file.contents.toString()).body);

      cb(null, file);
    }),
  );
};
