const pluralize = require("pluralize");

module.exports = function (eleventyConfig) {
  eleventyConfig.addNunjucksFilter("map", (arr = [], key = "") =>
    [...arr].map((obj = {}) => obj[key])
  );
  eleventyConfig.addNunjucksFilter("sort", (arr = [], key = "") =>
    [...arr].sort((a, b) => String(a[key]).localeCompare(b[key]))
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

  return {
    dir: {
      input: "src",
      output: "www",
    },
  };
};
