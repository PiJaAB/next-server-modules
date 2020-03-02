const base = require('./base');
const sanityRedirect = require('./sanityRedirect');
const defaultBabel = require('./defaultBabel');
const applyMiddlewareIf = require('./applyMiddlewareIf');
const createAuth = require('./auth');

module.exports = {
  ...base,
  sanityRedirect,
  defaultBabel,
  applyMiddlewareIf,
  createAuth,
};
