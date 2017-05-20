const request = require('request-promise-native');

const parseLinkHeader = header => {
  if (!header) {
    return [];
  }
  return header
    .split(',')
    .map(item => item.trim().split(';').map(part => part.trim()))
    .filter(item => item.length === 2)
    .map(([urlPart, attributePart]) => {
      const [, uri] = urlPart.match(/^<([^>]+)>$/);
      if (!uri) {
        return null;
      }
      const attributes = attributePart
        .match(/\w+="[^"]+"/g)
        .map(attribute => attribute.match(/^(\w+)="([^"]+)"$/))
        .reduce((acc, [, name, value]) => {
          if (!name || !value) {
            return acc;
          }
          return Object.assign(acc, { [name]: value });
        }, {});
      return { uri, attributes };
    });
};

const paginatedFetch = (uri, token, maxPages = 50) =>
  new Promise((resolve, reject) => {
    request({
      uri,
      resolveWithFullResponse: true,
      headers: {
        'User-Agent': 'github-org-leaderboard-client',
        Authorization: `token ${token}`,
      },
    })
      .then(({ body, headers }) => {
        let result;
        try {
          result = JSON.parse(body);
        } catch (err) {
          reject(err);
        }

        const linkHeader = headers['Link'] || headers['link'];
        const nextUri = parseLinkHeader(linkHeader)
          .filter(({ attributes: { rel } = {} }) => rel === 'next')
          .map(({ uri }) => uri)[0];
        if (maxPages > 1 && nextUri) {
          paginatedFetch(nextUri, token, maxPages - 1)
            .then(nextResult => {
              resolve([...result, ...nextResult]);
            })
            .catch(reject);
        } else {
          resolve(result);
        }
      })
      .catch(reject);
  });

module.exports = paginatedFetch;
