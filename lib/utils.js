const fm = require('front-matter');
const through = require('through2');
const vfs = require('vinyl-fs');

exports.reduce = function(fn, acc) {
  return through.obj(
    function(data, _, cb) {
      acc = fn(acc, data);
      cb(null, acc);
    },
    function() {
      this.emit('data', acc);
      this.emit('end');
    },
  );
};

exports.reduceFiles = function(glob, fn, acc) {
  return new Promise((resolve, reject) => {
    vfs
      .src(glob)
      .pipe(exports.reduce.call(this, fn, acc))
      .on('data', data => resolve(data))
      .on('error', reject);
  });
};

exports.loadPages = function(glob) {
  return exports.reduceFiles(
    glob,
    (acc, file) => {
      if (file.isNull()) {
        return acc;
      }

      // Parse Front Matter page headers
      const content = fm(file.contents.toString());

      // Add FM attributes to file data
      const data = {
        path: file.relative,
        title: file.stem,
        ...file.data,
        ...content.attributes,
      };

      acc.push(data);

      return acc;
    },
    [],
  );
};

exports.loadData = function(glob) {
  return exports.reduceFiles(
    glob,
    (acc, file) => {
      if (file.isNull()) {
        return acc;
      }

      // TODO: Check file extension and parse accordingly:
      // - [x]  .json = json
      // - [ ] .yml/.yaml = YAML
      // - [ ] .js = JS module(check for object or function / async function)

      if (file.extname === '.json') {
        // TODO: dot path, recursive (may require sorting)
        acc[file.relative] = JSON.parse(file.contents.toString());
      }

      return acc;
    },
    {},
  );
};
