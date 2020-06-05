# Gulp Screenshots Plugin

> Capture page screenshots with Puppeteer

## Usage

```js
const { src, dest } = require('gulp');
const gulpScreenshots = require('@upstatement/puppy/lib/gulp/screenshots')

const capture = async function() =>
  src('./*.html')
    .pipe(gulpScreenshots({
        // Global options for `Page.setViewport()`
        // https://pptr.dev/#?product=Puppeteer&version=v2.1.1&show=api-pagesetviewportviewport
        viewport: {
          width: 1400,
          height: 1000,
          deviceScaleFactor: 0.75,
        },
        // Global options for `Page.goto()
        // https://pptr.dev/#?product=Puppeteer&version=v2.1.1&show=api-pagegotourl-options
        goto: {
            waitUntil: 'networkidle2',
        },
        // Global options for `Page.screenshot()
        // https://pptr.dev/#?product=Puppeteer&version=v2.1.1&show=api-pagescreenshotoptions
        screenshot: {
            type: 'png',
        }
      },
      // Function resolving page-specific capture options
      pageCaptureOptions: page => page.thumbnail,
      // Function to filter out pages that should not get screenshots
      exclude: page => !page.thumbnail || !page.thumbnail.match(/auto/i),
    });
    .pipe(dest('./screenshots))
};

```
