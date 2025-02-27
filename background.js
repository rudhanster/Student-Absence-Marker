// background.js - Optimized version

// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Send a message to the content script to toggle the panel
  chrome.tabs.sendMessage(tab.id, { action: "togglePanel" })
    .catch(err => console.log("Error sending togglePanel message:", err));
});

// Listen for messages from the panel or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Forward untickAbsent action to active tab
  if (message.action === "untickAbsent") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, message)
          .then(response => {
            if (response) sendResponse(response);
          })
          .catch(err => console.log("Error forwarding untickAbsent message:", err));
      }
    });
    return true; // Required for async response
  }
});