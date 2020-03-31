const base = require('./base');
const sanityRedirect = require('./sanityRedirect');
const applyMiddlewareIf = require('./applyMiddlewareIf');
const createAuth = require('./auth');
const createSitemap = require('./sitemap');
const createRegexRedirect = require('./regexRedir');

module.exports = {
  ...base,
  sanityRedirect,
  applyMiddlewareIf,
  createAuth,
  createSitemap,
  createRegexRedirect,
};
