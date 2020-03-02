const base = require('./base');
const sanityRedirect = require('./sanityRedirect');
const defaultBabel = require('./defaultBabel');
const applyMiddlewareIf = require('./applyMiddlewareIf');

module.exports = {
  ...base,
  sanityRedirect,
  defaultBabel,
  applyMiddlewareIf,
};
