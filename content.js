// content.js

// Function to write text to clipboard
async function writeTextToClipboard(value) {
    try {
        await navigator.clipboard.writeText(value);
        console.log('Text copied to clipboard successfully!');
    } catch (err) {
        console.error('Failed to add text to clipboard:', err);
    }
}

// Function to write blob to clipboard
async function writeBlobToClipboard(blob) {
    try {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        console.log('Image blob copied to clipboard successfully!');
    } catch (err) {
        console.error('Failed to add image blob to clipboard:', err);
    }
}

//
async function writeBase64ToClipboard(base64data) {
    try {
        const blob = await fetch(base64data).then(response => response.blob());
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        console.log('Image blob copied to clipboard successfully!');
    } catch (err) {
        console.error('Failed to add image blob to clipboard:', err);
    }
}


async function writeBlobToClipboard(blob) {
    try {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        console.log('Image blob copied to clipboard successfully!');
        return { status: 'success' };
    } catch (err) {
        if (err instanceof DOMException) {
            console.error('Failed to add image blob to clipboard: DOMException', err);
        } else if (err instanceof TypeError) {
            console.error('Failed to add image blob to clipboard: TypeError', err);
        } else {
            console.error('Failed to add image blob to clipboard: Unknown error', err);
        }

        console.error('Error details:', {
            name: err.name,
            message: err.message,
            stack: err.stack
        });

        return { status: 'error', message: err.toString() };
    }
}



// Listening for messages from background or popup scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'copyTextToClipboard') {
        writeTextToClipboard(request.value).then(() => {
            sendResponse({ status: 'success' });
        }).catch((error) => {
            sendResponse({ status: 'error', message: error.toString() });
        });
        return true;  // Will respond asynchronously
    } else if (request.action === 'copyBlobToClipboard') {
        writeBlobToClipboard(request.blob).then(() => {
            sendResponse({ status: 'success' });
        }).catch((error) => {
            sendResponse({ status: 'error', message: error.toString() });
        });
        return true;  // Will respond asynchronously
    }
    else if (request.action === 'copyImageUrlToClipboard') {
        const imageUrl = request.imageUrl;
        fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => writeBlobToClipboard(blob))
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ status: 'error', message: error.toString() }));
        return true;  // Will respond asynchronously
    }
    else return false;
});
