console.log("Background script running...");

// Listen for a click on the camera icon. On that click, take a screenshot.
chrome.action.onClicked.addListener(async function () {

  console.log("Capturing screenshot...");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tab.id;

  const screenshotUrl = await chrome.tabs.captureVisibleTab();

  console.log('Screenshot captured');

  const result = await chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: () => {
      // Get the currently focused element
      const focusedElement = document.activeElement;
      return focusedElement?.outerHTML || null;
    }
  });


  const focusedElement = result[0].result;

  const htmlElement = focusedElement + 'hi';

  console.log('Focused element acquired');

  console.log(htmlElement);


  chrome.permissions.contains({ permissions: ['clipboardWrite'] }, (result) => {
    if (result) {
      console.log('Clipboard write permission is granted');
      // Perform actions that require clipboard write permission
    } else {
      console.log('Clipboard write permission is not granted');
      // Optionally, request permission here or inform the user
    }
  });


  function copyToClipboard(text) {
    if (!navigator.clipboard) {
      console.error('Clipboard API not supported');
      return;
    }

    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Text copied to clipboard');
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  }

  // Example usage:
  copyToClipboard('Hello, clipboard!');


  // const viewTabUrl = chrome.runtime.getURL('screenshot.html');
  // let targetId = null;

  // chrome.tabs.onUpdated.addListener(function listener(tabId, changedProps) {
  //   // We are waiting for the tab we opened to finish loading.
  //   // Check that the tab's id matches the tab we opened,
  //   // and that the tab is done loading.
  //   if (tabId != targetId || changedProps.status != 'complete') return;

  //   // Passing the above test means this is the event we were waiting for.
  //   // There is nothing we need to do for future onUpdated events, so we
  //   // use removeListner to stop getting called when onUpdated events fire.
  //   chrome.tabs.onUpdated.removeListener(listener);


  //   // Send screenshotUrl to the tab.
  //   chrome.tabs.sendMessage(tabId, { msg: 'screenshot', data: {screenshotUrl,htmlElement} });
  // });

  // const tab2 = await chrome.tabs.create({ url: viewTabUrl });
  // targetId = tab2.id;

});