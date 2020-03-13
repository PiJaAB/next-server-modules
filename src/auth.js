const basicAuth = require('express-basic-auth');

const applyMiddleWareIf = require('./applyMiddlewareIf');

const HASH =
  process.env.DEV_ARGON2_HASH ||
  '$argon2i$v=19$m=4096,t=3,p=1$dykrgWHatWg4gdVHe10rUg$sFD2j0mI+nIVB8JmM10g2qDBj+t9OFuRuz1vp4yDhL8';

const defaultUsers = [
  {
    username: 'admin',
    hash: HASH,
  },
  {
    username: 'pija',
    hash: HASH,
  },
];

const defaultExcludeRoutes = ['manifest.json'];

/**
 *
 * @param {string} [domain]
 * @param {ReadonlyArray<string>} [extcludedRoutes]
 * @param {ReadonlyArray<{username: string, hash: string}>} [extraUsers]
 */
function createAuth(
  domain = 'pija.se',
  excludedRoutes = ['manifest.json'],
  extraUsers = [],
) {
  const argon2 = (() => {
    try {
      // eslint-disable-next-line global-require
      return require('argon2');
    } catch (err) {
      err.message = `Failed to import argon2, try running the command 'npm rebuild --update-binary'\nThat worked for me!\n-Linn\n${err.message}`;
      throw err;
    }
  })();
  const allUsers = defaultUsers.concat(defaultUsers, extraUsers || []);

  const auth = basicAuth({
    challenge: true,
    realm: `${process.env.NODE_ENV}.${domain}`,
    authorizer(username, password, cb) {
      let hash = HASH;
      const [user] = allUsers.filter(({ username: u }) =>
        basicAuth.safeCompare(username, u),
      );
      if (user) ({ hash } = user);
      argon2.verify(hash, password).then(
        passwordMatches => {
          // Cybersecurity people want me to use bitwise & to avoid
          // optimizations that could make us vulnerable to timing attacks
          // eslint-disable-next-line no-bitwise
          cb(null, Boolean(user) & passwordMatches);
        },
        err => {
          cb(err, null);
        },
      );
    },
    authorizeAsync: true,
  });
  return applyMiddleWareIf(
    auth,
    req =>
      !(excludedRoutes || defaultExcludeRoutes).includes(
        new URL(req.url, `http://${req.headers.host}`).pathname,
      ),
  );
}

module.exports = createAuth;
