// Background script for Intervize Video Extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Intervize Video Extension installed');
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'INIT_VIDEO') {
    // Extension is ready
    sendResponse({ type: 'EXTENSION_READY' });
  } else if (request.type === 'START_WEBCAM') {
    // Forward to content script
    chrome.tabs.sendMessage(sender.tab.id, request, (response) => {
      sendResponse(response);
    });
    return true; // Keep message channel open
  } else if (request.type === 'STOP_WEBCAM' || request.type === 'START_RECORDING' || request.type === 'STOP_RECORDING') {
    // Forward to content script
    chrome.tabs.sendMessage(sender.tab.id, request, (response) => {
      sendResponse(response);
    });
    return true;
  }
});
