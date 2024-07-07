// background.js

console.log("Background script running...");

// Listen for a command from the user.
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "get-element") {
    console.log("Capturing element...");
    console.log("Capturing screenshot...");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      console.error("No active tab found");
      return;
    }

    const tabId = tab.id;

    async function captureAndCropScreenshot(rect) {
      try {
        console.log('Capturing and cropping screenshot...');
        const preCut = await new Promise((resolve, reject) => {
          chrome.tabs.captureVisibleTab(null, { format: "png" }, function (dataUrl) {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(dataUrl);
            }
          });
        });

        const response = await fetch(preCut);
        const blob = await response.blob();

        const imgBitmap = await createImageBitmap(blob);
        const canvas = new OffscreenCanvas(imgBitmap.width, imgBitmap.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgBitmap, 0, 0);

        const { x, y, width, height } = rect;
        const cropWidth = Math.floor(width);
        const cropHeight = Math.floor(height);
        const cropX = Math.floor(x);
        const cropY = Math.floor(y);

        const croppedCanvas = new OffscreenCanvas(cropWidth, cropHeight);
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCtx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        const croppedBlob = await croppedCanvas.convertToBlob();
        const croppedDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(croppedBlob);
        });

        return croppedDataUrl;

      } catch (error) {
        console.error('Error capturing or cropping screenshot:', error);
      }
    }

    const result = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const focusedElement = document.activeElement;
        const rect = focusedElement?.getBoundingClientRect() || null;
        const padding = 5; // Adjust the padding value as needed
        return rect ? {
          x: Math.floor(rect.left) - padding,
          y: Math.floor(rect.top) - padding,
          width: Math.floor(rect.width) + 2 * padding,
          height: Math.floor(rect.height) + 2 * padding
        } : null;
      }
    });

    const rect = result[0]?.result || { x: 0, y: 0, width: 400, height: 1000 };
    const screenshotUrl = await captureAndCropScreenshot(rect);

    const focusedElementHTML = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement !== document.body && focusedElement !== document.documentElement) {
          const escapedHTML = escapeHtml(focusedElement.outerHTML);

          function escapeHtml(html) {
            return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          }

          return `Here is the HTML of the focused element:\n${escapedHTML}`;
        } else {
          return "No element focused on";
        }
      }
    });

    const htmlElement = focusedElementHTML[0]?.result || "";
    console.log('Focused element acquired');
    console.log(htmlElement);

    const viewTabUrl = chrome.runtime.getURL('screenshot.html');
    let targetId = null;

    chrome.tabs.onUpdated.addListener(function listener(tabId, changedProps) {
      if (tabId != targetId || changedProps.status != 'complete') return;

      chrome.tabs.onUpdated.removeListener(listener);
      chrome.tabs.sendMessage(tabId, { msg: 'screenshot', data: { screenshotUrl, htmlElement } });
    });

    const tab2 = await chrome.tabs.create({ url: viewTabUrl });
    targetId = tab2.id;

  } else if (command === "screenshot-element") {
    console.log("Capturing screenshot...");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      console.error("No active tab found");
      return;
    }
    const tabId = tab.id;

    // Function to capture and crop a screenshot

    async function captureAndCropScreenshot(rect) {
      try {
        console.log('Capturing and cropping screenshot...');
        const preCut = await new Promise((resolve, reject) => {
          chrome.tabs.captureVisibleTab(null, { format: "png" }, function (dataUrl) {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(dataUrl);
            }
          });
        });

        const response = await fetch(preCut);
        const blob = await response.blob();

        const imgBitmap = await createImageBitmap(blob);
        const canvas = new OffscreenCanvas(imgBitmap.width, imgBitmap.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgBitmap, 0, 0);

        const { x, y, width, height } = rect;
        const cropWidth = Math.floor(width);
        const cropHeight = Math.floor(height);
        const cropX = Math.floor(x);
        const cropY = Math.floor(y);

        const croppedCanvas = new OffscreenCanvas(cropWidth, cropHeight);
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCtx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        const croppedBlob = await croppedCanvas.convertToBlob();
        const croppedDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(croppedBlob);
        });

        return croppedDataUrl;

      } catch (error) {
        console.error('Error capturing or cropping screenshot:', error);
      }
    }

    // Get the focused element's bounding box
    // Ensuring the rec dont go out of screen
    const result = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement !== document.body && focusedElement !== document.documentElement) {
          const rect = focusedElement?.getBoundingClientRect() || null;
          const padding = 5; // Adjust the padding value as needed
          if (rect) {
            const x = Math.max(Math.floor(rect.left) - padding, 0);
            const y = Math.max(Math.floor(rect.top) - padding, 0);
            const width = Math.min(Math.floor(rect.width) + 2 * padding, window.innerWidth - x);
            const height = Math.min(Math.floor(rect.height) + 2 * padding, window.innerHeight - y);
            return { x, y, width, height };
          }
          return null;
        } else {
          return "No element focused on";
        }
      }
    });


    const rect = result[0]?.result || { x: 0, y: 0, width: 400, height: 1000 };
    const imgUrl = await captureAndCropScreenshot(rect);


    async function addToClipboard(imageUrl) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;

        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            files: ['content.js']
          },
          () => {
            chrome.tabs.sendMessage(tabId, { action: 'copyImageUrlToClipboard', imageUrl: imageUrl }, (response) => {
              if (response && response.status === 'success') {
                console.log('Image URL processed and image blob added to clipboard successfully');
              } else {
                console.error('Failed to add image blob to clipboard:', response ? response.message : 'Unknown error');
              }
            });
          }
        );
      });
    }


    async function addToClipboardV2(blob) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;

        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            files: ['content.js']
          },
          () => {
            chrome.tabs.sendMessage(tabId, { action: 'copyBlobToClipboard', blob: blob }, (response) => {
              if (response && response.status === 'success') {
                console.log('Image blob added to clipboard successfully');
              } else {
                console.error('Failed to add image blob to clipboard:', response ? response.message : 'Unknown error');
              }
            });
          }
        );
      });
    }

    // Add the image to the clipboard
    await addToClipboard(imgUrl);


  } else if (command === "inspect-element") {
    console.log("Inspecting element...");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      console.error("No active tab found");
      return;
    }

    const tabId = tab.id;

    const focusedElementHTML = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement !== document.body && focusedElement !== document.documentElement) {
          console.log(focusedElement.outerHTML);
          return focusedElement.outerHTML;
        } else {
          return "No element focused on";
        }
      }
    });

    const textToCopy = focusedElementHTML[0]?.result || "";

    try {
      await addToClipboard(textToCopy);
      console.log('Text added to clipboard using addToClipboard');
    } catch (error) {
      console.error('Failed to add text to clipboard using addToClipboard:', error);
      try {
        await addToClipboardV2(textToCopy);
        console.log('Text added to clipboard using addToClipboardV2');
      } catch (v2Error) {
        console.error('Failed to add text to clipboard using addToClipboardV2:', v2Error);
      }
    }

    async function addToClipboard(value) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: [chrome.offscreen.Reason.CLIPBOARD],
        justification: 'Write text to the clipboard.'
      });

      chrome.runtime.sendMessage({
        type: 'copy-data-to-clipboard',
        target: 'offscreen-doc',
        data: value
      });
    }

    async function addToClipboardV2(value) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;

        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            files: ['content.js']
          },
          () => {
            chrome.tabs.sendMessage(tabId, { action: 'copyTextToClipboard', value: value }, (response) => {
              if (response && response.status === 'success') {
                console.log('Text added to clipboard successfully');
              } else {
                console.error('Failed to add text to clipboard:', response ? response.message : 'Unknown error');
              }
            });
          }
        );
      });
    }
  }
});
