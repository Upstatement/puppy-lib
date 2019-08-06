const { dest } = require('gulp');
const twig = require('gulp-twig');
const puppy = require('../index.js');

exports.default = async function() {
  const pages = await puppy({
    publicPath: '/',
    pages: './src/pages/**/*',
    data: './src/data/**/*',
  });

  return pages
    .pipe(
      twig({
        namespaces: { 'puppy': './src/templates' },
        useFileContents: true,
      }),
    )
    .pipe(dest('./dist'));
};
