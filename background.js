let rotationInterval = null;

// Generate a random 12-digit UUID
function generateDeviceId() {
  return "xxxxxxxxxxxx".replace(/[x]/g, function (c) {
    const r = Math.floor(Math.random() * 16);
    return r.toString(16);
  });
}

// Start the deviceId rotation
function startRotation() {
  if (rotationInterval) {
    clearInterval(rotationInterval);
  }

  rotationInterval = setInterval(() => {
    // Query the active tab to find if it's our target website
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0] && tabs[0].url) {
        try {
          const url = new URL(tabs[0].url);
          if (url.hostname.includes("airbrush.com")) {
            // Execute content script to change deviceId
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: changeDeviceId,
              args: [generateDeviceId()],
            });
          }
        } catch (e) {
          console.log("Not a standard URL, skipping deviceId rotation");
        }
      }
    });
  }, 5000);
}

// Function to be executed in the content script context
function changeDeviceId(newDeviceId) {
  if (typeof Storage !== "undefined") {
    localStorage.setItem("deviceId", newDeviceId);
    console.log("Device ID changed to:", newDeviceId);
  }
}

// Stop the deviceId rotation
function stopRotation() {
  if (rotationInterval) {
    clearInterval(rotationInterval);
    rotationInterval = null;
  }
}

// Initialize extension state
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["extensionEnabled"], function (result) {
    const isEnabled =
      result.extensionEnabled !== undefined ? result.extensionEnabled : true;
    if (isEnabled) {
      startRotation();
    }
  });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleExtension") {
    if (request.value) {
      startRotation();
    } else {
      stopRotation();
    }
  }
});

// Start rotation when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ extensionEnabled: true });
  startRotation();
});

// Handle tab updates (when user navigates to a new page)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    // Check if we need to restart rotation for the new page
    chrome.storage.local.get(["extensionEnabled"], function (result) {
      const isEnabled =
        result.extensionEnabled !== undefined ? result.extensionEnabled : true;
      if (isEnabled && rotationInterval === null) {
        startRotation();
      }
    });
  }
});
