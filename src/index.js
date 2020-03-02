const base = require('./base');
const sanityRedirect = require('./sanityRedirect');
const applyMiddlewareIf = require('./applyMiddlewareIf');
const createAuth = require('./auth');

module.exports = {
  ...base,
  sanityRedirect,
  applyMiddlewareIf,
  createAuth,
};
