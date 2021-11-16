import { waitForOptions } from '@testing-library/dom'
import TestingLibrary from './vendor/testing-library'

export const domScreen = TestingLibrary.DomTestingLibrary.screen
export const userEvent = TestingLibrary.userEvent
export const waitFor = TestingLibrary.DomTestingLibrary.waitFor

export function onOpen(callback: (cmdpal: Cmdpal) => void) {
  addEventListener('cmdpal', (e) => {
    const payload = (e as any).detail
    if (payload.open) {
      callback(new Cmdpal())
    }
  })
}

const registeredCommandHandlers: Record<string, CommandHandler> = {}

export class Cmdpal {
  registerCommands(group: string, commands: Command[]) {
    dispatchEvent(
      new CustomEvent('cmdpal', {
        detail: {
          register: {
            group: group,
            commands: commands.map((c) => {
              return {
                id: c.id,
                title: c.title,
                description: c.description,
                detail: c.detail,
              }
            }),
          },
        },
      }),
    )
    for (const command of commands) {
      registeredCommandHandlers[command.id] = command.handler
    }
  }
}

type Command = {
  id: string
  title: string
  description?: string
  detail?: string
  handler: CommandHandler
}

export function matchUrl(
  regexp: RegExp,
  onMatch: (match: RegExpExecArray) => void,
) {
  const match = regexp.exec(window.location.href)
  if (match) {
    onMatch(match)
  }
}

type CommandHandler = (...args: any[]) => void

export function initialize() {
  addEventListener('cmdpal', (e) => {
    const payload = (e as any).detail
    if (payload.execute) {
      const handler = registeredCommandHandlers[payload.execute.command]
      if (handler) {
        Promise.resolve()
          .then(() => handler(payload.execute.options))
          .catch((error) => {
            console.error(error)
            alert(
              `Unable to execute command ${payload.execute.command}: ${error}`,
            )
          })
      }
    }
  })
  Object.assign(globalThis, { tools, domScreen, userEvent })
}

export namespace tools {
  export function fetchPageTitle(url: string) {
    return new Promise<string>((resolve, reject) => {
      chrome.runtime.sendMessage({ fetchTitle: { url } }, (response) => {
        resolve(response.title || '')
      })
    })
  }
  export async function copy(text: string) {
    var copyFrom = document.createElement('textarea')
    copyFrom.textContent = text
    document.body.appendChild(copyFrom)
    copyFrom.select()
    document.execCommand('copy')
    copyFrom.blur()
    document.body.removeChild(copyFrom)
  }
  export async function nextFrame() {
    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)
  }
}

export async function findElement(selector: string, options?: waitForOptions) {
  return TestingLibrary.DomTestingLibrary.waitFor(() => {
    const element = document.querySelector(selector)
    if (!element) {
      throw new Error(`Element ${selector} not found`)
    }
    return element
  }, options)
}
