# AccessCapture

AccessCapture is a Chrome extension developed by HPS to streamline accessibility testing workflows. It provides focused tools for inspecting and copying key accessibility-related information directly from web pages. This extension promotes best practices in web development and accessibility auditing, contributing to a more inclusive web environment.

## Features

### Keyboard Shortcuts

- **Ctrl+Shift+Y**: Capture a screenshot of the current tab's visible area.
- **Ctrl+Shift+U**: Capture the currently focused element on the page.
- **Ctrl+Shift+E**: Inspect the focused element and copy its HTML to the clipboard.

### Functionality Versions

AccessCapture uses different methods to handle its core functions:

- **Screenshot Capture**: Utilizes the `chrome.tabs.captureVisibleTab` API for capturing screenshots.
- **Element Inspection**: Retrieves the HTML of focused elements using `document.activeElement`.
- **Clipboard Operations**: Manages clipboard operations with `navigator.clipboard` API for text and `ClipboardItem` for images.

### Accessibility Benefits

AccessCapture is designed to enhance productivity and accessibility:

- **Enhanced Productivity**: Simplifies the process of capturing screenshots and inspecting elements, thereby boosting productivity for all users.
- **Accessibility**: Facilitates screenshot capture and element inspection, making digital interactions more accessible for users with motor disabilities or visual impairments.

### Browser Support

AccessCapture is currently supported on Chrome. For the latest updates on browser compatibility, refer to [Chrome Platform Status](https://www.chromestatus.com/features).

## Usage

1. **Capturing Screenshots**:
   - Use **Ctrl+Shift+Y** to capture a screenshot of focused element.

2. **Inspecting Elements**:
   - Use **Ctrl+Shift+E** to inspect the focused element and copy its HTML to the clipboard.

3. **Open Element in new tab**
   - Use **Ctrl+Shift+U** to open the focused element in a new tab.

## Development Notes

AccessCapture incorporates different versions of functionalities to ensure robustness and compatibility:

- **Clipboard Operations**: Due to deprecations and replacements in clipboard APIs, AccessCapture employs alternative methods (`addToClipboardV2`) to ensure reliable clipboard operations.
- **Offscreen Document Usage**: To work around limitations of service workers in accessing the clipboard, AccessCapture uses offscreen documents for clipboard operations.
