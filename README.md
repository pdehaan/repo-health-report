# repo-health-report

Fetch GitHub repos and generate a report.

## INSTALLATION

Git clone, and stuff.
Create an `.env` file in the root of the project which has your GitHub API token (so you don't exhaust the 60 requests per hour limit of a token free life). See `.env-dist` for example and then BYOT (bring your own token).

## USAGE

To fetch repo data, run <kbd>npm run fetch</kbd> which grabs the specified repos from the package.json file and attempts to save the current stats in `./src/data/{owner}/{repo}/{date}.json`. Rerunning the command several times a day will overwrite the file for that date.

To view the results, run <kbd>npm run serve</kbd> launch a browser and go to the server URL/port in the terminal output and navigate to "/pages/{owner}/{repo}/{date}/". Suboptimal, but I'll work on building better index pages to make it easier to navigate.
