const fetch = require('./paginatedFetch');
const mapLimit = require('async/mapLimit');

const BASE_URL = 'https://api.github.com';
const CONNECTION_LIMIT = 10;

const fetchUserReposByName = (userNames, token) =>
  new Promise((resolve, reject) => {
    mapLimit(
      userNames,
      CONNECTION_LIMIT,
      (userName, cb) => {
        const uri = `${BASE_URL}/users/${userName}/repos`;
        fetch(uri, token)
          .then(result => cb(null, result), cb)
      },
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    )
  });

const userReposToStats = userRepos =>
  userRepos.reduce(
    (acc, repo) => ({
      stars: acc.stars + repo['stargazers_count'],
      forks: acc.forks + repo['forks_count'],
      openIssues: acc.openIssues + repo['open_issues_count'],
      repos: acc.repos + 1,
    }),
    {
      stars: 0,
      forks: 0,
      openIssues: 0,
      repos: 0,
    }
  );

module.exports = (orgName, token) =>
  new Promise((resolve, reject) => {
    fetch(`${BASE_URL}/orgs/${orgName}/members`, token)
      .then(members => {
        const userNames = members.map(item => item['login']);
        fetchUserReposByName(userNames, token)
          .then(userRepos => {
            const userStats = userRepos
              .map((repos, index) =>
                Object.assign(
                  {userName: userNames[index]},
                  userReposToStats(repos)
                )
              )
              .sort((a, b) => a.stars < b.stars);
            resolve(userStats);
            }
          )
          .catch(reject);
      })
      .catch(err =>
        reject(
          new Error(
            err.statusCode === 404
              ? `The provided org "${orgName}" does not exist.`
              : err.message
          )
        )
      );
  });
