# dtinth’s content scripts

This is my content script that I installed in my browser.
It integrates with [cmdpal](https://docs.dt.in.th/cmdpal/index.html).

## Command list

<!-- begin-command-list -->

* <a name='gh-actions.run-watch'></a>[**GitHub Actions: Copy `gh run-watch` Command**](src/features/GitHubActions.ts#L10) — When on a GitHub Actions run page, copies the command to track the run using [gh run-watch](https://docs.dt.in.th/gh-run-watch/index.html) to the clipboard.

* <a name='gh-jira.copy'></a>[**GitHub: Copy Jira URL and GitHub URL**](src/features/GitHubJira.ts#L28) — When viewing a pull request whose title contains a Jira issue reference, copies both the Jira issue URL and the pull request URL to the clipboard.

* <a name='gh-jira.prefill'></a>[**GitHub: Prefill Pull Requests from Jira Issue**](src/features/GitHubJira.ts#L114) — When creating a pull request whose head branch contains a Jira issue reference, copies the Jira issue key and title into the pull request title.

* <a name='jira.copy-key'></a>[**Jira: Copy Issue Key**](src/features/GitHubJira.ts#L47) — Copies the Jira issue key to the clipboard.

* <a name='jira.copy-url'></a>[**Jira: Copy Issue URL**](src/features/GitHubJira.ts#L56) — Copies the normalized Jira issue URL to the clipboard.

* <a name='jira.create-dep'></a>[**Jira: Create Blocker Dependency**](src/features/GitHubJira.ts#L94) — Creates a new Jira issue that blocks the current issue.

* <a name='jira.create-follow-up'></a>[**Jira: Create Follow-Up Issue**](src/features/GitHubJira.ts#L85) — Creates a new Jira issue with the current issue as the cause.

<!-- end-command-list -->

## Configuration

This project will not compile until you create a configuration file at `src/config.yaml`.
The configuration schema is documented in [`src/config.yaml.d.ts`](src/config.yaml.d.ts).