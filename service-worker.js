console.log("Background script running...");

// Listen for a click on the camera icon. On that click, take a screenshot.
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "screenshot") {
    console.log("Capturing screenshot...");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      console.error("No active tab found");
      return;
    }


    const tabId = tab.id;


    //


    async function captureAndCropScreenshot() {
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
        const cropWidth = 500;  // Change to your desired width
        const cropHeight = 1000; // Change to your desired height
        const cropX = 50;       // Change to your desired x coordinate
        const cropY = 50;       // Change to your desired y coordinate

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

    const screenshotUrl = await captureAndCropScreenshot();


    const result = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // Get the currently focused element
        const focusedElement = document.activeElement;
        return focusedElement?.outerHTML || null;
      }
    });


    const focusedElement = result[0]?.result || "";

    const htmlElement = focusedElement;

    console.log('Focused element acquired');

    console.log(htmlElement);


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

});