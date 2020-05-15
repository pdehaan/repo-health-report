const path = require("path");

const { Octokit } = require("@octokit/rest");
const dotenv = require("dotenv");
const fs = require("fs-extra");
const LRU = require("lru-cache");
const ms = require("ms");

// Load any ENV vars declared in a local .env file.
dotenv.config();

// Name of the disk-based cache backup file.
const CACHE_FILE = path.join(__dirname, ".cache");

const cache = loadCache();

function loadCache(options = {}, file = CACHE_FILE) {
  options = {
    max: 500,
    maxAge: ms("1h"),
    ...options,
  };

  // This is sync since I can't do a top-level await, and the timing is pretty important.
  const $data = fs.readJSONSync(file);

  const $cache = new LRU(options);
  $cache.load($data);
  return $cache;
}

async function writeCache() {
  const $data = cache.dump();
  await fs.writeJSON(CACHE_FILE, $data);
}

const github = new Octokit({
  auth: process.env.GH_API_KEY,
});

/**
 * Build in a persistent, harddrive backed LRU cache for requests/responses.
 */
github.hook.wrap("request", async (request, options) => {
  const key = options.url;
  // Exit fast if we have a cache hit.
  if (cache.has(key)) {
    console.info(`Found cached results for ${key}`);
    return cache.get(key);
  }

  const startTime = Date.now();
  const response = await request(options);
  const duration = Date.now() - startTime;
  console.info(
    `caching ${options.method} ${key} – ${response.status} in ${duration}ms`
  );
  // Add the response to the cache, and save the cache to disk so it persists between restarts (or local debugging).
  cache.set(key, response);
  writeCache();
  return response;
});

async function paginate(fn = () => {}, options = {}) {
  options.per_page = options.per_page || 100;
  const req = fn.endpoint.merge(options);
  return github.paginate(req);
}

/**
 * Paginated array of issues in a GitHub repo.
 * @param {object} options
 * @returns {array}
 */
async function getGitHubIssues(options = {}) {
  options.state = options.state || "open";
  return paginate(github.issues.listForRepo, options);
}

async function getGitHubIssuesByLabel(options = {}) {
  options.state = options.state || "all";
  return paginate(github.issues.listForRepo, options);
}

/**
 * Paginated array of labels in a GitHub repo.
 * @param {object} options
 * @returns {array}
 */
async function getGitHubLabels(options = {}) {
  const repoLabels = await paginate(github.issues.listLabelsForRepo, options);

  return repoLabels.reduce((coll = {}, label = {}) => {
    coll[label.name] = label;
    return coll;
  }, {});
}

async function getGitHubPullRequests(options = {}) {
  return paginate(github.pulls.list, options);
}

module.exports = {
  getGitHubIssues,
  getGitHubIssuesByLabel,
  getGitHubLabels,
  getGitHubPullRequests,
};
