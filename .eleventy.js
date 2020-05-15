const ms = require("ms");
const njkFilters = require("nunjucks/src/filters");
const pluralize = require("pluralize");

const gh = require("./gh-client");

module.exports = function (eleventyConfig) {
  eleventyConfig.addNunjucksFilter("map", (arr = [], key = "") =>
    [...arr].map((obj = {}) => obj[key])
  );
  eleventyConfig.addNunjucksFilter("sort", (arr = [], key = "") =>
    [...arr].sort((a, b) => String(a[key]).localeCompare(b[key]))
  );
  eleventyConfig.addNunjucksFilter("map_date", (arr = []) => {
    return arr.map((item) =>
      new Date(item).toLocaleDateString([], { month: "short", day: "numeric" })
    );
  });
  // Polyfill latest nunjucks filter into current env (since nunjucks dependency might not be latest).
  eleventyConfig.addNunjucksFilter("sort", njkFilters.sort);

  eleventyConfig.addNunjucksFilter(
    "github_issues",
    (label, owner = "", repo = "") => {
      const $label = label ? `label:${label}` : "no:label";
      const uri = new URL(`${owner}/${repo}/issues`, "https://github.com");
      uri.searchParams.append("q", `is:issue is:open ${$label}`);
      return uri.href;
    }
  );

  eleventyConfig.addFilter("locale_date_string", (date) =>
    new Date(date).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  );
  eleventyConfig.addFilter("to_fixed", (number, precision = 1) =>
    Number(number).toFixed(precision)
  );
  eleventyConfig.addFilter(
    "pluralize",
    (count = 0, word = "", inclusive = false) =>
      pluralize(word, count, inclusive)
  );

  eleventyConfig.addNunjucksAsyncShortcode("gh_issues_by_label", async function(owner, repo, labels) {
    let issues = await gh.getGitHubIssuesByLabel({
      owner,
      repo,
      labels,
    });

    const lastWeek = new Date(Date.now() - ms("1w"));
    const issueHTML = issues
      .filter(issue => issue.state === "open" || Date.parse(issue.created_at) >= lastWeek)
      .map(issue => `<li class="text-sm"><span class="font-bold uppercase ${issue.state === "open" ? "text-red-500" : "text-green-500"}">[${issue.state}]</span> <a href="${issue.html_url}" target="_blank" rel="noopener noreferer" class="text-indigo-700 hover:text-indigo-500">#${issue.number}</a> ${issue.title} <time class="font-bold text-xs">(${ new Date(issue.created_at).toLocaleDateString() })</time></li>`)
      .join("\n");

    if (issueHTML.length === 0) {
      return "";
    }

    const labelUri = `https://github.com/${owner}/${repo}/labels/${encodeURIComponent(labels)}`;

    return `<section class="py-2 border-t">
      <header>
        <h2 class="text-xl"><a href="${labelUri}" target="_blank" rel="noopener noreferer" class="text-indigo-700 hover:text-indigo-500">${labels}</a></h2>
      </header>
      <ol class="list-decimal list-outside px-8">${issueHTML}</ol>
    </section>`;
  });

  return {
    dir: {
      input: "src",
      output: "www",
    },
  };
};
