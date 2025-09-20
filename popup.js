document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('toggleExtension');
    
    // Load saved state
    chrome.storage.local.get(['extensionEnabled'], function(result) {
      const isEnabled = result.extensionEnabled !== undefined ? result.extensionEnabled : true;
      toggle.checked = isEnabled;
      updateStatusText(isEnabled);
    });
    
    // Toggle extension state
    toggle.addEventListener('change', function() {
      const isEnabled = this.checked;
      chrome.storage.local.set({extensionEnabled: isEnabled});
      updateStatusText(isEnabled);
      
      // Send message to background script
      chrome.runtime.sendMessage({
        action: "toggleExtension",
        value: isEnabled
      });
    });
    
    function updateStatusText(isEnabled) {
      const statusText = document.getElementById('statusText');
      statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';
      statusText.style.color = isEnabled ? '#4CAF50' : '#F44336';
    }
  });