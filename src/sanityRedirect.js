/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

try {
  const BASE_URL = process.env.NEXT_STATIC_BASE_URL;
  const PARSED_BASE = new URL(BASE_URL);

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns {void}
   */
  module.exports = function sanityRedirect(req, res, next) {
    let sendRedirect = false;
    let protocol = req.headers['x-forwarded-proto'];
    let { url } = req;

    if (protocol) {
      protocol += ':';
      if (protocol !== PARSED_BASE.protocol) sendRedirect = true;
    }
    if (req.headers.host !== PARSED_BASE.host) sendRedirect = true;

    const match = url.match(/^([^?]+)\/($|\?.*)/);

    if (match) {
      url = `${match[1]}${match[2]}`;
      sendRedirect = true;
    }

    if (sendRedirect) {
      return res.redirect(301, `${BASE_URL}${url}`);
    }
    return next();
  };
} catch (err) {
  module.exports = function sanityRedirect(req, res, next) {
    console.error('Sanity redirect is not properly configured!');
    return next();
  };
}
