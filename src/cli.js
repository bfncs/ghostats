#!/usr/bin/env node
require('dotenv').config();
const chalk = require('chalk');
const ora = require('ora');
const getStats = require('./index');

const log = console.log;

const star = chalk.yellow('★');
const cross = chalk.red('✘');

const token = process.env.TOKEN;
if (!token) {
  console.error(cross + ' Please provide a Github authorization token.');
  process.exit(1);
}
const [, , orgName] = process.argv;

if (!orgName) {
  console.error(cross + ' Please provide the Github Organisation name');
  process.exit(1);
}

const spinner = ora(`Loading stats for "${orgName}"`).start();

getStats(orgName, token)
  .then(stats => {
    spinner.stop();
    stats.forEach(({ userName, stars, forks, openIssues, repos }) => {
      log(chalk.black.bgYellow.bold(userName));
      log(`${star} ${stars} stars`);
      log(`${star} ${repos} repos`);
      log(`${star} ${forks} forks`);
      log(`${star} ${openIssues} open issues`);
      log();
    });
  })
  .catch(err => {
    spinner.stopAndPersist({
      symbol: cross,
      text: err.message,
    });
  });
