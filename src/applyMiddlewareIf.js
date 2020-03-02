/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/**
 * Applies a middleware if a condition is met, otherwise skips the middleware and continues
 * @param {(req: Request, res: Response, next: NextFunction) => void} middleware
 * @param {(req: Request, res: Response) => boolean | Promise<boolean>} cond
 * @returns {void}
 */
const applyMiddleWareIf = (middleware, cond) => async (req, res, next) => {
  if (await cond(req, res)) {
    return middleware(req, res, next);
  }
  return next();
};

module.exports = applyMiddleWareIf;
