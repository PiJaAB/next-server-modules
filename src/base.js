/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

const isProduction = process.env.NODE_ENV === 'production';
const isStaging = process.env.NODE_ENV === 'staging';
const isDev = !(isProduction || isStaging);

// Ensure that process.env.NODE_ENV is a known value.
if (isDev) process.env.NODE_ENV = 'development';
require('dotenv-load')();

const app = require('next').next({ dev: isDev });

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
  isStaging,
  isProduction,
  handleNext,
  render404,
  start,
};
