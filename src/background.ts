chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.pageLoaded) {
    if (sender.tab && sender.tab.id != undefined) {
      chrome.scripting.executeScript({
        target: {
          tabId: sender.tab.id,
        },
        files: ['/dist/content-script.js'],
      })
    }
  } else if (request.fetchTitle) {
    fetch(request.fetchTitle.url, { credentials: 'include' })
      .then((response) => response.text())
      .then((value) => {
        const match = value.match(/<title>([^<]*)<\/title>/)
        sendResponse({ title: match ? match[1] : '' })
      })
    return true // Will respond asynchronously.
  }
})
