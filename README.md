# dtinth’s content scripts

This is my content script that I installed in my browser.
It integrates with [cmdpal](https://docs.dt.in.th/cmdpal/index.html).

<!-- begin-command-list -->

* <a name='gh-actions.run-watch'></a>**GitHub Actions: Copy `gh run-watch` command** — When on a GitHub Actions run page, copies the command to track the run using [gh run-watch](https://docs.dt.in.th/gh-run-watch/index.html) to the clipboard.
* <a name='gh-jira.copy'></a>**GitHub: Copy Jira URL and GitHub URL** — When viewing a pull request whose title contains a Jira issue reference, copies both the Jira issue URL and the pull request URL to the clipboard.
* <a name='gh-jira.prefill'></a>**GitHub: Prefill pull requests from Jira issue** — When creating a pull request whose head branch contains a Jira issue reference, copies the Jira issue key and title into the pull request title.
* <a name='jira.copy-key'></a>**Jira: Copy issue key** — Copies the Jira issue key.
* <a name='jira.copy-url'></a>**Jira: Copy issue URL** — Copies the normalized Jira issue URL to the clipboard.
* <a name='jira.create-dep'></a>**Jira: Create blocker dependency** — Creates a new Jira issue that blocks the current issue.
* <a name='jira.create-follow-up'></a>**Jira: Create follow-up issue** — Creates a new Jira issue with the current issue as the cause.

<!-- end-command-list -->
