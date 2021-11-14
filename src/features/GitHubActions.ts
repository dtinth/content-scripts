import { domScreen, matchUrl, tools, onOpen } from '../runtime'

onOpen((cmdpal) => {
  matchUrl(/https:\/\/github.com\/.*?\/runs\/(\d+)/, async (m) => {
    const [summaryLink] = domScreen.queryAllByText('Summary', { selector: 'a' })
    if (summaryLink) {
      const cmd = `gh run-watch ${(summaryLink as HTMLAnchorElement).href}`
      cmdpal.registerCommands('gh-actions.run-watch', [
        {
          // When on a GitHub Actions run page, copies the command to track
          // the run using [gh run-watch](https://docs.dt.in.th/gh-run-watch/index.html) to the clipboard.
          id: 'gh-actions.run-watch',
          title: 'GitHub Actions: Copy `gh run-watch` Command',
          detail: cmd,
          handler: async () => {
            await tools.copy(cmd)
          },
        },
      ])
    }
  })
})
