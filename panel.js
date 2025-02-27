// panel.js - Fixed version with reliable message clearing
document.addEventListener('DOMContentLoaded', function() {
  const untickButton = document.getElementById('untickButton');
  const closeButton = document.getElementById('closeButton');
  const statusDiv = document.getElementById('status');
  const absentIdsTextarea = document.getElementById('absentIds');

  // Load previously saved IDs
  chrome.storage.local.get(['absentIds'], function(result) {
    if (result.absentIds) {
      absentIdsTextarea.value = result.absentIds;
    }
  });

  // Function to clear status message after delay
  function clearStatusAfterDelay(delay = 5000) {
    setTimeout(() => {
      statusDiv.textContent = '';
    }, delay);
  }

  // Function to clear the input field and saved data
  function clearInputField() {
    console.log("Clearing input field and storage");
    absentIdsTextarea.value = '';
    chrome.storage.local.remove(['absentIds'], function() {
      console.log("Storage cleared");
    });
  }

  // Handle messages from the content script
  window.addEventListener('message', function(event) {
    console.log("Panel received message:", event.data);
    
    // Make sure the message is from our extension
    if (event.data && event.data.action === "untickResult") {
      const result = event.data;
      statusDiv.textContent = `Completed: Marked ${result.studentsFound} out of ${result.totalStudents} student(s)`;
      
      // Always clear input after processing, regardless of results
      clearInputField();
      
      // Clear the status message after 5 seconds
      clearStatusAfterDelay();
    }
  });

  // Handle untick button click
  untickButton.addEventListener('click', function() {
    const input = absentIdsTextarea.value.trim();
    
    // Split input by any combination of newlines, spaces, or commas
    const absentIds = input.split(/[\n\s,]+/).filter(id => id.trim() !== '');
    
    // Skip if no IDs entered
    if (absentIds.length === 0) {
      statusDiv.textContent = "Please enter at least one student ID";
      clearStatusAfterDelay();
      return;
    }
    
    // Save entered IDs for next use (temporary)
    chrome.storage.local.set({ absentIds: absentIds.join('\n') });
    
    // Send IDs to content script via postMessage
    window.parent.postMessage({
      action: "untickAbsent",
      absentIds: absentIds,
      from: "panel"
    }, "*");
    
    // Set status message
    statusDiv.textContent = "Processing...";
    
    // Add a direct clearing mechanism with a slight delay
    // This ensures the field clears even if the result message isn't received
    setTimeout(clearInputField, 2000);
    
    // FIXED: Clear the "Processing..." message after 5 seconds
    clearStatusAfterDelay();
  });
  
  // Handle close button click
  closeButton.addEventListener('click', function() {
    window.parent.postMessage({
      action: "togglePanel",
      from: "panel"
    }, "*");
  });
  
  // FIXED: Set the close button text with proper character encoding
  if (closeButton) {
    closeButton.innerHTML = "\u00D7"; // Unicode for multiplication sign ×
    closeButton.style.fontSize = "20px";
    closeButton.style.fontWeight = "bold";
  }
});