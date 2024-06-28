console.log("Background script running...");

// Listen for click on the extension button
chrome.action.onClicked.addListener(async function () {
    console.log("Capturing screenshot...");

    // Query for active tab
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        try { // Error handling
            if (tabs.length > 0) {
            const tabId = tabs[0].id;

            console.log('Active tab found:', tabId);

            // Capture visible tab
            const screenshotUrl = await chrome.tabs.captureVisibleTab(tabId.currentWindowId, { format: 'png' });

            // console.log('Screenshot captured:', screenshotUrl);

            chrome.tabs.sendMessage(tabId, { msg: 'screenshot', data: screenshotUrl });

            
            const viewTabUrl = chrome.runtime.getURL('screenshot.html');

            // Create a new tab to display the screenshot
            const tab = await chrome.tabs.create({ url: viewTabUrl });

            // Listen for tab update to send screenshot
            let targetId = tab.id;
            chrome.tabs.sendMessage(targetId, { msg: 'screenshot', data: screenshotUrl });
        } else {
            console.error('No active tab found.');
        }
        } catch (error) {
            console.error(error);
            return;
        }
        
    });
});

// Listener for messages from content script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'getFocusedElementBoundingBox') {
        // Handle the message from content script if needed
    }
});
