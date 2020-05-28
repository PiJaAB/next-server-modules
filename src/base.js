/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

if (process.env.NODE_ENV == null) process.env.NODE_ENV = 'development';
if (
  process.env.NODE_ENV !== 'development' &&
  process.env.NODE_ENV !== 'production'
) {
  console.warn(`NODE_ENV set to unsupported value: ${process.env.NODE_ENV}`);
}

const isProduction = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';

const dotenvConfig = require('dotenv').config;

function loadEnv(env = null) {
  if (env == null) {
    dotenvConfig({ path: '.env.override' });
    dotenvConfig({ path: '.env' });
  } else {
    dotenvConfig({ path: `.env.${env}.override` });
    dotenvConfig({ path: `.env.${env}` });
  }
}
if (process.env.DEPLOY_ENV == null) process.env.DEPLOY_ENV = 'localdev';
loadEnv(process.env.DEPLOY_ENV);
loadEnv(process.env.NODE_ENV);
loadEnv();

const app = require('next')({ dev: isDev });

/**
 * Send request to next handler
 * @type {(req: Request, res: Response, next: NextFunction) => void}
 */
const handleNext = app.getRequestHandler();

/**
 * Render a 404 error page.
 * @type {(req: Request, res: Response) => void}
 */
function render404(req, res) {
  const err = new Error('File not found', 'ENOENT');
  err.statusCode = 404;
  res.statusCode = 404;
  app.renderError(err, req, res, req.path, req.query);
}

/**
  Starts the server
  @param {()=>void} init initialize the server.
 */
const start = init => {
  app
    .prepare()
    .then(init)
    .catch(err => console.error(err));
};

module.exports = {
  app,
  isDev,
  isProduction,
  handleNext,
  render404,
  start,
};
