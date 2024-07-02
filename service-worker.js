console.log("Background script running...");

// Listen for a click on the camera icon. On that click, take a screenshot.
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


    //


    async function captureAndCropScreenshot(rect) {
      try {
        console.log('Capturing and cropping screenshot...');
        // Step 1: Capture the screenshot
        const preCut = await new Promise((resolve, reject) => {
          chrome.tabs.captureVisibleTab(null, { format: "png" }, function (dataUrl) {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(dataUrl);
            }
          });
        });

        // Step 2: Convert the captured data URL to a Blob
        const response = await fetch(preCut);
        const blob = await response.blob();

        // Step 3: Create an OffscreenCanvas and draw the image onto it
        const imgBitmap = await createImageBitmap(blob);
        const canvas = new OffscreenCanvas(imgBitmap.width, imgBitmap.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgBitmap, 0, 0);

        // Step 4: Crop the desired area from the canvas

        const { x, y, width, height } = rect;
        const cropWidth = Math.floor(width);
        const cropHeight = Math.floor(height);
        const cropX = Math.floor(x);
        const cropY = Math.floor(y);


        const croppedCanvas = new OffscreenCanvas(cropWidth, cropHeight);
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCtx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        // Step 5: Convert the cropped area back to a data URL
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

    //

    const result = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // Get the currently focused element
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

    //

    const focusedElementHTML = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement !== document.body && focusedElement !== document.documentElement) {
          const escapedHTML = escapeHtml(focusedElement.outerHTML);

          function escapeHtml(html) {
            return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          }

          return `Here is the HTML of the focused element:
           ${escapedHTML}`;
        } else {
          return "No element focused on";
        }
      }
    });



    const htmlElement = focusedElementHTML[0]?.result || "";

    console.log('Focused element acquired');
    console.log(htmlElement);


    //


    const viewTabUrl = chrome.runtime.getURL('screenshot.html');
    let targetId = null;

    chrome.tabs.onUpdated.addListener(function listener(tabId, changedProps) {
      // We are waiting for the tab we opened to finish loading.
      // Check that the tab's id matches the tab we opened,
      // and that the tab is done loading.
      if (tabId != targetId || changedProps.status != 'complete') return;

      // Passing the above test means this is the event we were waiting for.
      // There is nothing we need to do for future onUpdated events, so we
      // use removeListner to stop getting called when onUpdated events fire.
      chrome.tabs.onUpdated.removeListener(listener);


      // Send screenshotUrl to the tab.
      chrome.tabs.sendMessage(tabId, { msg: 'screenshot', data: { screenshotUrl, htmlElement } });
    });

    const tab2 = await chrome.tabs.create({ url: viewTabUrl });
    targetId = tab2.id;

  }

  //

  if (command === "screenshot-element") {
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
        // Step 1: Capture the screenshot
        const preCut = await new Promise((resolve, reject) => {
          chrome.tabs.captureVisibleTab(null, { format: "png" }, function (dataUrl) {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(dataUrl);
            }
          });
        });

        // Step 2: Convert the captured data URL to a Blob
        const response = await fetch(preCut);
        const blob = await response.blob();

        // Step 3: Create an OffscreenCanvas and draw the image onto it
        const imgBitmap = await createImageBitmap(blob);
        const canvas = new OffscreenCanvas(imgBitmap.width, imgBitmap.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgBitmap, 0, 0);

        // Step 4: Crop the desired area from the canvas

        const { x, y, width, height } = rect;
        const cropWidth = Math.floor(width);
        const cropHeight = Math.floor(height);
        const cropX = Math.floor(x);
        const cropY = Math.floor(y);


        const croppedCanvas = new OffscreenCanvas(cropWidth, cropHeight);
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCtx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        // Step 5: Convert the cropped area back to a data URL
        const croppedBlob = await croppedCanvas.convertToBlob();
        const croppedDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(croppedBlob);
        });

        return croppedBlob;

      } catch (error) {
        console.error('Error capturing or cropping screenshot:', error);
      }
    }

    //

    //get the rect of the focused element
    const result = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // Get the currently focused element
        const focusedElement = document.activeElement;
        const rect = focusedElement?.getBoundingClientRect() || null;
        const padding = 5; // Adjust the padding value as needed
        return rect ? {
          // Add padding to the rect to ensure the element is fully captured including the focus ring
          x: Math.floor(rect.left) - padding,
          y: Math.floor(rect.top) - padding,
          width: Math.floor(rect.width) + 2 * padding,
          height: Math.floor(rect.height) + 2 * padding
        } : null;
      }
    });


    const rect = result[0]?.result || { x: 0, y: 0, width: 400, height: 1000 };

    const croppedBlob = await captureAndCropScreenshot(rect);

    await addToClipboard(croppedBlob);



    async function addToClipboard(value) {
      try {
        console.log("Adding to clipboard...");

        
        await navigator.clipboard.write([new ClipboardItem({ "image/png": value })]);


      }
      catch (error) {
        console.error('Error adding to clipboard:', error);
      }
    }


  }
  //

  if (command === "inspect-element") {
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

    // When the browser action is clicked, `addToClipboard()` will use an offscreen
    // document to write the value of `textToCopy` to the system clipboard.
    await addToClipboardV2(textToCopy);

    // Solution 1 - As of Jan 2023, service workers cannot directly interact with
    // the system clipboard using either `navigator.clipboard` or
    // `document.execCommand()`. To work around this, we'll create an offscreen
    // document and pass it the data we want to write to the clipboard.
    async function addToClipboard(value) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: [chrome.offscreen.Reason.CLIPBOARD],
        justification: 'Write text to the clipboard.'
      });

      // Now that we have an offscreen document, we can dispatch the
      // message.
      chrome.runtime.sendMessage({
        type: 'copy-data-to-clipboard',
        target: 'offscreen-doc',
        data: value
      });
    }

    async function addToClipboardV2(value) {
      try {
        await navigator.clipboard.writeText(value);
        console.log('Text added to clipboard successfully');
      } catch (err) {
        console.error('Failed to add text to clipboard: ', err);
        // Handle errors or provide fallback method here
      }
    }
  }

});
