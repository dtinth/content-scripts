import {
  domScreen,
  findElement,
  matchUrl,
  tools,
  userEvent,
  onOpen,
} from '../runtime'

import config from '../config.yaml'

onOpen((cmdpal) => {
  const projects: Record<string, string> = config.jiraProjects

  const issueReferencePattern = new RegExp(
    `(${Object.keys(projects).join('|')})-(\\d+)`,
  )

  matchUrl(/(https:\/\/github.com\/.*?\/pull\/\d+)/, async (m) => {
    const jiraMatch = document.title.match(issueReferencePattern)
    if (jiraMatch) {
      const jiraUrl = `${projects[jiraMatch[1]]}/browse/${jiraMatch[1]}-${
        jiraMatch[2]
      }`
      const text = `${jiraUrl}\n${m[1]}`
      cmdpal.registerCommands('gh-jira.pr-view', [
        {
          // When viewing a pull request whose title contains a Jira issue reference,
          // copies both the Jira issue URL and the pull request URL to the clipboard.
          id: 'gh-jira.copy',
          title: 'GitHub: Copy Jira URL and GitHub URL',
          detail: text,
          handler: async () => {
            await tools.copy(text)
          },
        },
      ])
    }
  })

  matchUrl(issueReferencePattern, async (m) => {
    const issueKey = `${m[1]}-${m[2]}`
    const jiraUrl = `${projects[m[1]]}/browse/${issueKey}`

    cmdpal.registerCommands('jira.copy', [
      {
        // Copies the Jira issue key.
        id: 'jira.copy-key',
        title: 'Jira: Copy Issue Key',
        detail: issueKey,
        handler: async () => {
          await tools.copy(issueKey)
        },
      },
      {
        // Copies the normalized Jira issue URL to the clipboard.
        id: 'jira.copy-url',
        title: 'Jira: Copy Issue URL',
        detail: jiraUrl,
        handler: async () => {
          await tools.copy(jiraUrl)
        },
      },
    ])

    if (document.querySelector('#createGlobalItem')) {
      const createIssueWithRelation = async (relation: string) => {
        userEvent.click(document.querySelector('#createGlobalItem')!)
        userEvent.selectOptions(
          await domScreen.findByLabelText('Linked Issues'),
          relation,
        )
        userEvent.type(
          document.querySelector('#issuelinks-issues-textarea')!,
          m[1],
        )
        userEvent.click(
          await findElement('#issuelinks-issues-multi-select .drop-menu'),
        )
        userEvent.click(await findElement('#user-inputted-option a'))
        userEvent.type(await findElement('#summary'), '')
      }
      cmdpal.registerCommands('jira.create-issue', [
        {
          // Creates a new Jira issue with the current issue as the cause.
          id: 'jira.create-follow-up',
          title: 'Jira: Create Follow-Up Issue',
          detail: `caused by ${issueKey}`,
          handler: async () => {
            await createIssueWithRelation('is caused by')
          },
        },
        {
          // Creates a new Jira issue that blocks the current issue.
          id: 'jira.create-dep',
          title: 'Jira: Create Blocker Dependency',
          detail: `blocks ${issueKey}`,
          handler: async () => {
            await createIssueWithRelation('blocks')
          },
        },
      ])
    }

    if (
      location.origin === 'https://github.com' &&
      document.querySelector('#pull_request_title')
    ) {
      const pageTitle = await tools.fetchPageTitle(jiraUrl)
      const match = pageTitle.match(/\[([^\]]+)\]\s+(.+) - Jira/i)
      if (match) {
        cmdpal.registerCommands('gh-jira.pr-create', [
          {
            // When creating a pull request whose head branch contains a Jira issue reference,
            // copies the Jira issue key and title into the pull request title.
            id: 'gh-jira.prefill',
            title: 'GitHub: Prefill Pull Requests from Jira Issue',
            description: match[1],
            detail: match[2],
            handler: () => {
              const prTitleField = document.querySelector(
                '#pull_request_title',
              ) as HTMLInputElement
              const prBodyField = document.querySelector(
                '#pull_request_body',
              ) as HTMLTextAreaElement
              prTitleField.value = match[1] + ': ' + match[2]
              prBodyField.value = prBodyField.value.replace(
                '<!-- Link to task here -->',
                jiraUrl,
              )
            },
          },
        ])
      }
    }
  })
})
