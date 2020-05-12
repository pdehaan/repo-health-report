const njkFilters = require("nunjucks/src/filters");
const pluralize = require("pluralize");

module.exports = function (eleventyConfig) {
  eleventyConfig.addNunjucksFilter("map", (arr = [], key = "") =>
    [...arr].map((obj = {}) => obj[key])
  );
  eleventyConfig.addNunjucksFilter("sort", (arr = [], key = "") =>
    [...arr].sort((a, b) => String(a[key]).localeCompare(b[key]))
  );
  eleventyConfig.addNunjucksFilter("map_date", (arr = []) => {
    return arr.map(item => new Date(item).toLocaleDateString([], { month: "short", day: "numeric" }));
  });
  // Polyfill latest nunjucks filter into current env (since nunjucks dependency might not be latest).
  eleventyConfig.addNunjucksFilter("sort", njkFilters.sort);

  eleventyConfig.addNunjucksFilter("github_issues", (label, owner="", repo="") => {
    const $label = label ? `label:${label}` : "no:label";
    const uri = new URL(`${owner}/${repo}/issues`, "https://github.com");
    uri.searchParams.append("q", `is:issue is:open ${ $label }`);
    return uri.href;
  });

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

  return {
    dir: {
      input: "src",
      output: "www",
    },
  };
};
