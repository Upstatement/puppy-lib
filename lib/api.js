const { join } = require('path');

module.exports = function api(site) {
  function siteUrl(path) {
    return join(site.publicPath, path);
  }

  function staticUrl(path) {
    return join(site.publicPath, 'static', path);
  }

  function assetUrl(path) {
    return join(site.publicPath, 'assets', path);
  }

  function url(page) {
    const target = site.pages.find(p => p === page);
    return target && siteUrl(target.path);
  }

  return {
    siteUrl,
    staticUrl,
    assetUrl,
    url,
  };
};
