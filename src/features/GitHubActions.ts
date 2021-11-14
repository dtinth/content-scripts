import { domScreen, matchUrl, tools, onOpen } from '../runtime'

onOpen((cmdpal) => {
  matchUrl(/https:\/\/github.com\/.*?\/runs\/(\d+)/, async (m) => {
    const [summaryLink] = domScreen.queryAllByText('Summary', { selector: 'a' })
    if (summaryLink) {
      const cmd = `gh run-watch ${(summaryLink as HTMLAnchorElement).href}`
      cmdpal.registerCommands('gh-actions.run-watch', [
        {
          id: 'gh-actions.run-watch',
          title: 'GitHub Actions: Copy `gh run-watch` command',
          detail: cmd,
          handler: async () => {
            await tools.copy(cmd)
          },
        },
      ])
    }
  })
})
