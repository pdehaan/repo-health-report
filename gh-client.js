const { Octokit } = require("@octokit/rest");
const dotenv = require("dotenv");

// Load any ENV vars declared in a local .env file.
dotenv.config();

const github = new Octokit({
  auth: process.env.GH_API_KEY,
});

/**
 * Paginated array of issues in a GitHub repo.
 * @param {object} options
 * @returns {array}
 */
async function getGitHubIssues(options) {
  options = Object.assign(
    {
      per_page: 100, // Max 100
      state: "open",
    },
    options
  );
  const $options = github.issues.listForRepo.endpoint.merge(options);
  return github.paginate($options);
}

/**
 * Paginated array of labels in a GitHub repo.
 * @param {object} options
 * @returns {array}
 */
async function getGitHubLabels(options = {}) {
  options = Object.assign(
    {
      per_page: 100, // Max 100
    },
    options
  );
  const $options = await github.issues.listLabelsForRepo.endpoint.merge(
    options
  );
  const repoLabels = await github.paginate($options);
  return repoLabels.reduce((coll = {}, label = {}) => {
    coll[label.name] = label;
    return coll;
  }, {});
}

async function getGitHubPullRequests(options = {}) {
  options = Object.assign(
    {
      per_page: 100, // Max 100
    },
    options
  );
  const $options = await github.pulls.list.endpoint.merge(options);
  return github.paginate($options);
}

module.exports = {
  getGitHubIssues,
  getGitHubLabels,
  getGitHubPullRequests,
};
