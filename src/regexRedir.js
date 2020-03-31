const LRUCache = require('lru-cache');

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/**
 * @typedef {{matcher: RegExp, rewrite: (match: RegExpMatchArray) => (string | Promise<string>), temporary: boolean}} Redirection
 */

/** @typedef {{target: string, temp: boolean }} RedirMatch */

/**
 * @param {object} conf - The configuration
 * @param {Redirection[]} conf.redirections - The redirection configurations
 * @param {number} [conf.max] - Max amount of redirect chains to cache.
 * @returns {(req: Request, res: Response, next: NextFunction) => void}
 */
module.exports = function regexRedir(conf) {
  const redirCache = new LRUCache({
    max: conf.max || 1024 * 100,
    length(n, key) {
      return key + (n ? n.target.length : 1);
    },
  });

  const redirections = [...conf.redirections];

  async function getRecurse(path) {
    if (redirCache.has(path)) {
      const cache = redirCache.get(path);
      if (!cache) {
        return null;
      }

      return cache;
    }
    // 2 functions calling themselves recursively can't
    // be ordered according to this rule
    // eslint-disable-next-line no-use-before-define
    return getRedirect(path, false);
  }
  /**
   * @param {string} path - Current path to check redirects for
   * @param {boolean} cache - Whether to include matches in redirect cache.
   * @returns { null | RedirMatch}
   */
  async function getRedirect(path, cache = true) {
    for (const { match: matcher, rewrite, temporary } of redirections) {
      const match = path.match(matcher);
      if (match) {
        // Okay to disable in this instance,
        // since we'll break out of the loop and
        // not run multiple async methods in series rather than paralell
        // eslint-disable-next-line no-await-in-loop
        let target = await rewrite(match);
        let temp = temporary;
        // eslint-disable-next-line no-await-in-loop
        const recurse = await getRecurse(target);
        if (recurse) {
          ({ target } = recurse);
          temp = temp || recurse.temp;
        }
        if (cache) redirCache.set(path, { target, temp });
        return { target, temp };
      }
      if (cache) redirCache.set(path, null);
    }
    return null;
  }

  return async (req, res, next) => {
    const { path } = req;
    if (redirCache.has(path)) {
      const cache = redirCache.get(path);
      if (!cache) {
        return next();
      }

      const { target, temp } = cache;
      return res.redirect(temp ? 302 : 301, target);
    }
    const redir = await getRedirect(path);
    if (!redir) {
      return next();
    }
    return res.redirect(redir.temp ? 302 : 301, redir.target);
  };
};
