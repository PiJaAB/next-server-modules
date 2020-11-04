const { SitemapStream, streamToPromise } = require('sitemap');
const axios = require('axios').default;

function writeCacheHeaders(res, cacheTime) {
  const cacheDate = new Date(cacheTime);
  const now = new Date().getTime();
  const maxAge = Math.max(0, (cacheDate.getTime() - now) / 1000).toFixed(0);
  res.setHeader('Expires', cacheDate.toUTCString());
  res.setHeader('Cache-Control', `max-age=${maxAge}`);
}

/**
 * @param {Object} conf - The configuration
 * @param {string} conf.baseUrl - The base URL to use for the sitemap
 * @param {string} pagesManifest - Path to the Next.js pagesManifest file
 * @param {number} [conf.cacheTime] - The amount of time in seconds to cache the sitemap for
 * @param {string|string[]} [conf.additionalUrl] - Extra URL's to include
 * @param {Object|Object[]} [conf.dynamic] - Dynamic routes config
 * @param {string} conf.dynamic.listUrl - The API endpoint to fetch the list of dynamic urls from
 * @param {string} [conf.dynamic.prefx] - The prefix to prepend to the responses from listUrl
 * @param {string} [conf.dynamic.suffix] - The suffix to append to the responses from listUrl
 */
function sitemap(conf) {
  const parsedConf = { ...conf };
  let additionalUrls = [];
  let dynamic = [];
  if (parsedConf.additionalUrl) {
    if (!Array.isArray(conf.additionalUrl)) {
      parsedConf.additionalUrls = [conf.additionalUrl];
    }
    additionalUrls = [...conf.additionalUrl];
  }
  if (conf.dynamic) {
    if (!Array.isArray(conf.dynamic)) {
      parsedConf.dynamic = [conf.dynamic];
    }
    dynamic = parsedConf.dynamic.map(o => ({ ...o }));
  }
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const pages = Object.keys(require(parsedConf.pagesManifest)).filter(
    s => !s.startsWith('/_') && !s.match(/\[[a-z]+\]/) && s !== '/404',
  );

  let cache = null;
  let cacheTime = null;

  return async (req, res) => {
    res.header('Content-Type', 'application/xml');
    // if we have a cached entry send it
    const now = new Date().getTime();
    if (cache && cacheTime > now) {
      writeCacheHeaders(res, cacheTime);
      res.send(cache);
      return;
    }
    try {
      const smStream = new SitemapStream({ hostname: parsedConf.baseUrl });
      for (const page of pages) {
        smStream.write({ url: page });
      }
      for (const page of additionalUrls) {
        smStream.write({ url: page });
      }
      dynamic = await Promise.all(
        dynamic.map(async dynConf => ({
          ...dynConf,
          urls: (await axios.get(dynConf.listUrl)).data,
        })),
      );
      for (const dynConf of dynamic) {
        for (const url of dynConf.urls) {
          smStream.write({
            url: `${dynConf.prefix || ''}${url}${dynConf.suffix || ''}`,
          });
        }
      }
      smStream.end();
      cache = await streamToPromise(smStream);
      if (parsedConf.cacheTime) {
        cacheTime = new Date().getTime() + parsedConf.cacheTime * 1000;
        writeCacheHeaders(res, cacheTime);
        res.send(cache);
      } else {
        res.send(cache);
        cache = null;
      }
    } catch (e) {
      console.error(e);
      res.status(500).end();
    }
  };
}

module.exports = sitemap;
