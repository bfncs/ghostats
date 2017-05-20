# ghostats

Fetch Github organisation members stats.

## Install

`npm install ghostats`

## Usage example

```js
const getStats = require('ghostats');

getStats(ORG_NAME, GITHUB_OAUTH_TOKEN)
  .then(stats => {
    stats.forEach(({ userName, repos, stars, forks, openIssues }) => {
      console.log(userName);
      console.log(repos + ' repos');
      console.log(stars + ' stars');
      console.log(forks + ' forks');
      console.log(openIssues + ' open issues');
    });
  })
  .catch(err => {
    console.error(err.message);
  });
```

## CLI

Install this module globally to use the CLI: 

```shell
npm install --global ghostats
```

You will need a valid OAuth token to fetch data from Github. Amongst [other ways](https://developer.github.com/v3/oauth/), you can simply acquire a personal token with this command using curl:

```shell
curl -u 'YOUR_USERNAME' -d '{"note":"ghostats"}' https://api.github.com/authorizations
```

Look for the `token` field in the returned JSON object. *Do not give a token for your account to anyone else, never put it into your application.*

You should provide the token as environment variable `TOKEN` to the tool.

```shell
TOKEN=abcdefgh12345678 ghostats ORG_NAME
```

Also you can create a file called `.env` with the following content in the folder where you execute the program:

```
TOKEN=abcdefgh12345678
```