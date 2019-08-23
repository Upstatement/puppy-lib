# Puppy

[![Version](https://img.shields.io/npm/v/@upstatement/puppy)](https://npmjs.com/package/@upstatement/puppy)

> An adorable library for building a static site generator

## Prerequisites
![Prerequisite](https://img.shields.io/badge/node-10.13.0-blue.svg)
![Prerequisite](https://img.shields.io/badge/npm-6.4.1-blue.svg)

## Install

1. `nvm install`
2. `npm install`

## Usage

```js
const puppy = require('@upstatement/puppy');
const stream = require('stream');
const twig = require('gulp-twig');
const util = require('util');

const html = async function() {
  const pipeline = util.promisify(stream.pipeline);

  const pages = await puppy({
    publicPath: '/',
    pages: 'src/pages/**/*',
    data: 'src/data/**/*',
  });
  const compile = twig({
    namespaces: { puppy: 'src/templates' },
    useFileContents: true,
  });
  const dist = dest('dist');

  return pipeline(pages, compile, dist);
};

```

## 🤝Contributing

Contributions, issues and feature requests are welcome!

Feel free to check the [issues page](https://github.com/upstatement/puppy-starter/issues).

## 📝License

Copyright &copy; 2019 Upstatement, LLC
