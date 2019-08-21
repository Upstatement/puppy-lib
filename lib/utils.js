const fm = require('front-matter');
const { concat } = require('mississippi');
const stream = require('stream');
const vfs = require('vinyl-fs');

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
  const parseData = file => {
    if (!file.contents) {
      return;
    }

    let data;

    // TODO: Check file extension and parse accordingly:
    // - [x]  .json = json
    // - [ ] .yml/.yaml = YAML
    // - [ ] .js = JS module(check for object or function / async function)

    if (file.extname === '.json') {
      data = {
        key: file.relative,
        value: JSON.parse(file.contents.toString()),
      };
    }

    return data;
  };
  const src = vfs.src(glob);
  const generateSiteData = cb =>
    concat(files => {
      const data = files
        .map(parseData)
        .filter(page => !!page)
        .reduce((map, obj) => {
          map[obj.key] = obj.value;
          return map;
        }, {});

      cb(data);
    });

  return new Promise((resolve, reject) => {
    stream.pipeline(src, generateSiteData(resolve), err => err && reject(err));
  });
};
