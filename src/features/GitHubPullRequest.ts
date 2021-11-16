import {
  domScreen,
  matchUrl,
  tools,
  onOpen,
  userEvent,
  waitFor,
  findElement,
} from '../runtime'

onOpen((cmdpal) => {
  matchUrl(/https:\/\/github.com\/.*?\/pull\/(\d+)/, async (m) => {
    const actions: { text: string; fn: () => Promise<void> }[] = []

    const [assignYourself] = domScreen.queryAllByText('assign yourself')
    if (assignYourself) {
      actions.push({
        text: 'Assign yourself',
        fn: async () => {
          userEvent.click(assignYourself)
        },
      })
    }

    const suggestedReviewers = document.querySelectorAll(
      '.js-suggested-reviewer',
    )
    const selectReviewer = document.querySelector(
      '#reviewers-select-menu summary',
    )
    if (suggestedReviewers.length > 0 && selectReviewer) {
      actions.push({
        text: 'Request reviews',
        fn: async () => {
          userEvent.click(selectReviewer)
          const reviewers = await waitFor(async () => {
            const reviewers = document.querySelectorAll(
              '#reviewers-select-menu .js-extended-description',
            )
            if (reviewers.length === 0) {
              throw new Error('No reviewers suggested found')
            }
            return reviewers
          })
          for (const reviewer of reviewers) {
            await tools.nextFrame()
            userEvent.click(reviewer)
          }
          await tools.nextFrame()
          userEvent.click(selectReviewer)
        },
      })
    }

    const reviewLabel = document.querySelector(
      '#partial-discussion-sidebar .IssueLabel[data-name="review"]',
    )
    const selectLabels = document.querySelector('#labels-select-menu summary')
    if (!reviewLabel && selectLabels) {
      actions.push({
        text: 'Add review label',
        fn: async () => {
          userEvent.click(selectLabels)
          const labelCheckbox = await findElement(
            'input[type="checkbox"][data-label-name="review"]',
          )
          const menuItem = labelCheckbox?.parentNode
          if (menuItem) {
            userEvent.click(menuItem as HTMLElement)
          }
          await tools.nextFrame()
          userEvent.click(selectLabels)
        },
      })
    }

    if (actions.length > 0) {
      cmdpal.registerCommands('github-pr.request-review', [
        {
          // Requests reviews for the current PR by adding "review" label, assigning the pull request to the current user, and requesting reviews from suggested reviewers.
          id: 'github-pr.request-review',
          title: 'GitHub Pull Request: Request Review',
          detail: actions.map((a) => a.text).join(', '),
          handler: async () => {
            for (const action of actions) {
              await action.fn()
            }
          },
        },
      ])
    }
  })
})
