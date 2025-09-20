
console.log("AirBrush Add-on content script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getDeviceId") {
    const deviceId = localStorage.getItem("deviceId");
    sendResponse({ deviceId: deviceId });
  }
});
