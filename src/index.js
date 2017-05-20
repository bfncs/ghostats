const fetch = require('./paginatedFetch');

const BASE_URL = 'https://api.github.com';

const userNamesToRepoPromises = (userNames, token) =>
  userNames.map(userName =>
    fetch(`${BASE_URL}/users/${userName}/repos`, token)
  );

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
        Promise.all(userNamesToRepoPromises(userNames, token))
          .then(userRepos =>
            resolve(
              userRepos
                .map((repos, index) =>
                  Object.assign(
                    { userName: userNames[index] },
                    userReposToStats(repos)
                  )
                )
                .sort((a, b) => a.stars < b.stars)
            )
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
