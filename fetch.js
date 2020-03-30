#!/usr/bin/env node

const path = require("path");

const fs = require("fs-extra");

const lib = require("./lib");
// TODO: Move these from package.json to a dedicated JSON config file?
const repos = require("./package.json").repos;

main(repos);

async function main(repos = []) {
  const date = new Date().toLocaleDateString(["en-CA"]); // YYYY-MM-DD
  for (const { owner, repo } of repos) {
    // TODO: Un-hardcode the output path? This somewhat ties us to Eleventy;
    // which is awesome, but not sure if Express is maybe a better solution.
    const dir = path.join("./src/_data", owner, repo);
    const filepath = path.join(dir, `${date}.json`);
    const contents = await lib.fetchGitHubIssues(owner, repo, date);

    await fs.ensureDir(dir);
    await fs.writeJson(filepath, contents, { spaces: 2 });
  }
}
