const github = require("./gh-client");

module.exports = {
  fetchGitHubIssues,
  groupByLabel,
};

async function fetchGitHubIssues(owner, repo, date) {
  const issues = await github.getGitHubIssues({ owner, repo });
  const repoLabels = await github.getGitHubLabels({ owner, repo });

  return {
    owner,
    repo,
    date,
    labels: groupByLabel(issues),
    repoLabels,
  };
}

function groupByLabel(data, filterPRs = true) {
  if (filterPRs) {
    // Ignore pull requests...
    data = data.filter((issue) => !issue.pull_request);
  }
  const UNLABELED_LABEL = "Unlabeled";
  const labels = new Map();
  labels.set(UNLABELED_LABEL, []);

  for (const issue of data) {
    if (issue.labels.length === 0) {
      const arr = labels.get(UNLABELED_LABEL);
      arr.push(issue);
      labels.set(UNLABELED_LABEL, arr);
      continue;
    }
    for (const label of issue.labels) {
      const arr = labels.get(label.name) || [];
      arr.push(issue);
      labels.set(label.name, arr);
    }
  }

  let results = [];

  for (const [label, issues] of labels.entries()) {
    const current = {
      label,
      issues,
      count: issues.length,
      pct: (issues.length / data.length) * 100,
    };
    results.push(current);
  }

  return results.sort((a, b) => {
    // Sort by count, descending.
    const val = b.count - a.count;
    if (val === 0) {
      // If label counts are equal, sort by label name (ascending).
      return String(a.label).localeCompare(b.label);
    }
    return val;
  });
}
