const fm = require('front-matter');
const { concat } = require('mississippi');
const stream = require('stream');
const vfs = require('vinyl-fs');
const yaml = require('js-yaml');

exports.loadPages = function(glob) {
  const parseFile = file => {
    if (!file.contents) {
      return;
    }

    // Parse Front Matter page headers
    const content = fm(file.contents.toString());

    // Add FM attributes to file data
    return {
      path: file.relative,
      title: file.stem,
      ...file.data,
      ...content.attributes,
    };
  };
  const src = vfs.src(glob);
  const generatePages = cb =>
    concat(files => {
      cb(files.map(parseFile).filter(page => !!page));
    });

  return new Promise((resolve, reject) => {
    stream.pipeline(src, generatePages(resolve), err => err && reject(err));
  });
};

exports.loadData = function(glob) {
  const parseData = async file => {
    if (!file.contents) {
      return;
    }

    let data;

    if (file.extname === '.json') {
      data = {
        key: file.relative,
        value: JSON.parse(file.contents.toString()),
      };
    } else if (file.extname === '.js') {
      let value = require(file.path);

      // If export is a function, invoke and wait for async result.
      if (typeof value === 'function') {
        value = await value();
      }

      data = {
        key: file.relative,
        value,
      };
    } else if (file.extname === '.yml' || file.extname === '.yaml') {
      data = {
        key: file.relative,
        value: yaml.safeLoad(file.contents.toString()),
      };
    }

    return data;
  };
  const src = vfs.src(glob);
  const generateSiteData = cb =>
    concat(files => {
      Promise.all(files.map(parseData)).then(data => {
        cb(
          data
            .filter(page => !!page)
            .reduce((map, obj) => {
              map[obj.key] = obj.value;
              return map;
            }, {}),
        );
      });
    });

  return new Promise((resolve, reject) => {
    stream.pipeline(src, generateSiteData(resolve), err => err && reject(err));
  });
};
