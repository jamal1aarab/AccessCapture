function getScreenshotOfElement(element, posX, posY, width, height, callback) {
  html2canvas(element, {
    onrendered: function (canvas) {
      var context = canvas.getContext('2d');
      var imageData = context.getImageData(posX, posY, width, height).data;
      var outputCanvas = document.createElement('canvas');
      var outputContext = outputCanvas.getContext('2d');
      outputCanvas.width = width;
      outputCanvas.height = height;

      var idata = outputContext.createImageData(width, height);
      idata.data.set(imageData);
      outputContext.putImageData(idata, 0, 0);
      callback(outputCanvas.toDataURL().replace("data:image/png;base64,", ""));
    },
    width: width,
    height: height,
    useCORS: true, // Handle cross-origin content
    taintTest: false,
    allowTaint: false
  });
}

// Listen for keyboard shortcut to capture screenshot
document.addEventListener('keydown', function (event) {
  if (event.shiftKey && event.altKey && event.key === 'Y') {
    var focusedElement = document.activeElement;
    if (focusedElement) {
      getScreenshotOfElement(focusedElement, 0, 0, focusedElement.offsetWidth, focusedElement.offsetHeight, function (data) {
        // Optionally, you can send data to background.js or process it here
        console.log('Captured screenshot:', data);
        // Send captured data to background.js or use it as needed
        chrome.runtime.sendMessage({ action: 'screenshotCaptured', data: data });
      });
    } else {
      console.error('No focused element found.');
    }
  }
});
