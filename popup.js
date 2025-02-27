// PANEL.JS FIXES
// Replace the message event listener in panel.js with this:

window.addEventListener('message', function(event) {
  // Make sure the message is from our extension
  if (event.data && event.data.action === "untickResult") {
    const result = event.data;
    statusDiv.textContent = `Completed: Marked ${result.studentsFound} out of ${result.totalStudents} student(s)`;
    
    // Always clear input after processing, regardless of results
    absentIdsTextarea.value = '';
    chrome.storage.local.remove(['absentIds']);
    
    // Clear the status message after 5 seconds
    clearStatusAfterDelay();
  }
});

// PANEL.HTML FIXES
// Update the dev-info button CSS in panel.html to ensure visibility:

.dev-info {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 10px;
  background-color: #3367d6;
  color: white;
  padding: 5px 8px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  width: auto;
  height: auto;
  min-width: 20px;
  min-height: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  opacity: 0.9;
  transition: opacity 0.3s ease;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dev-info:hover {
  opacity: 1;
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0,0,0,0.3);
}

// POPUP.JS FIXES
// Replace the message listener in popup.js with this:

chrome.runtime.onMessage.addListener(function (message) {
  if (message && message.action === "untickResult") {
    statusDiv.textContent = `Found ${message.studentsFound} of ${message.totalStudents} student(s). Unticked ${message.checkboxCount} checkbox(es).`;
    
    // Always clear the input field after processing
    absentIdsTextarea.value = '';
    chrome.storage.local.remove(['absentIds']);
    
    // Clear the status message after 5 seconds
    clearStatusAfterDelay();
    
    // Return true to indicate we want to send a response asynchronously
    return true;
  }
});

// CONTENT.JS FIXES
// Update the processAbsentIds function in content.js to ensure proper result handling:

function processAbsentIds(absentIds) {
  let checkboxCount = 0;
  let studentsFound = 0;

  // Process each enrollment ID
  absentIds.forEach((id) => {
    // Look for the enrollment ID in the page
    const elements = findElementsContainingText(id);
    
    // If elements found, count this student
    if (elements.length > 0) {
      studentsFound++;
      
      elements.forEach((element) => {
        // Find the closest row
        const row = findClosestRow(element);
        if (row) {
          // Find and untick checkboxes
          const checkboxes = row.querySelectorAll('input[type="checkbox"]');
          
          checkboxes.forEach((checkbox) => {
            if (checkbox.checked) {
              // Untick the checkbox
              checkbox.checked = false;
              
              // Trigger events to simulate user interaction
              checkbox.dispatchEvent(new Event('change', { bubbles: true }));
              checkbox.dispatchEvent(new Event('click', { bubbles: true }));
              
              checkboxCount++;
            }
          });
        }
      });
    }
  });

  // Prepare result
  const result = {
    action: "untickResult",
    checkboxCount,
    studentsFound,
    totalStudents: absentIds.length
  };
  
  console.log("Processing result:", result); // Debug log
  
  // Show feedback on the webpage
  showFeedbackOnPage(checkboxCount, studentsFound, absentIds.length);
  
  // Send result to background script
  chrome.runtime.sendMessage(result).catch(err => {
    console.log("Error sending result to background:", err);
  });
  
  // Also send to panel if it exists
  sendMessageToPanel(result);
  
  return result;
}

// Improve the sendMessageToPanel function for more reliable messaging:
function sendMessageToPanel(message) {
  const panel = document.getElementById('student-absence-panel-frame');
  if (panel) {
    // Try to post message directly
    try {
      panel.contentWindow.postMessage(message, '*');
      console.log("Message sent to panel:", message); // Debug log
    } catch (err) {
      console.log("Error sending to panel directly:", err);
      
      // Try again after a short delay
      setTimeout(() => {
        try {
          panel.contentWindow.postMessage(message, '*');
        } catch (innerErr) {
          console.log("Retry failed:", innerErr);
        }
      }, 200);
    }
  }
}