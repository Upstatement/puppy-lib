# Puppy Library

[![Version](https://img.shields.io/npm/v/@upstatement/puppy)](https://npmjs.com/package/@upstatement/puppy)

> An adorable library for building static site generators

Looking to build a Puppy-powered prototype? Head over to the [main Puppy repo](https://github.com/Upstatement/puppy)!

## Prerequisites

![Prerequisite](https://img.shields.io/badge/node-14.16.0-blue.svg)
![Prerequisite](https://img.shields.io/badge/npm-7.11.2-blue.svg)

## Install

1. `nvm install`
2. `npm install`

## Usage

```js
const puppy = require('@upstatement/puppy');
const stream = require('stream');
const twig = require('gulp-twig');
const util = require('util');

const html = async function () {
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

Feel free to check the [issues page](https://github.com/upstatement/puppy-lib/issues).

## 🚀 Release

This library is hosted on [npmjs.com](https://npmjs.com). To create a new release and publish to NPM:

1. Make sure you are on the `main` branch, have pulled the latest changes from GitHub, and have no local changes:

   ```shell
   git checkout main
   git pull
   git status
   ```

   The last command should return the following:

   ```shell
   On branch main
   Your branch is up to date with 'origin/main'.

   nothing to commit, working tree clean
   ```

2. Bump the version according to [semantic versioning rules](https://semver.org/)

   ```shell
   npm version major|minor|patch
   ```

3. Push the commit up to the GitHub repository

4. Make sure you are logged in as a user that has access to the [`@upstatement/puppy` package](https://www.npmjs.com/package/@upstatement/puppy)

   ```shell
   # Check who you are currently logged in as
   npm whoami

   # Login if you're not logged in
   npm login
   ```

5. Publish to NPM

   ```shell
   npm publish
   ```

After the release is published, submit a PR to the [@upstatement/puppy template repo](https://github.com/Upstatement/puppy) ([example PR](https://github.com/Upstatement/puppy/pull/179)) that updates the version constraint to the new release number.

## 📝License

Copyright &copy; 2022 Upstatement, LLC
