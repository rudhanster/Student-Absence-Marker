// content.js - Optimized version

// Panel state tracking
let panelInjected = false;
let panelVisible = false;

// Listen for messages from the background script or panel
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // Toggle panel visibility when the extension icon is clicked
  if (message.action === "togglePanel") {
    if (!panelInjected) {
      injectPanel();
      panelInjected = true;
      panelVisible = true;
    } else {
      togglePanelVisibility();
    }
    // Return a response to acknowledge receipt
    if (sendResponse) sendResponse({ success: true });
    return true; // Required for async response
  }
  
  // Handle untick absent request
  else if (message.action === "untickAbsent") {
    const result = processAbsentIds(message.absentIds);
    // Send result back to sender
    if (sendResponse) sendResponse(result);
    // Also send to panel if it exists
    sendMessageToPanel(result);
    return true; // Required for async response
  }
});

// Function to process absent IDs and untick checkboxes
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
// Function to inject the panel iframe
function injectPanel() {
  // Create panel container
  const panelContainer = document.createElement('div');
  panelContainer.id = 'student-absence-panel-container';
  panelContainer.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;box-shadow:0 4px 8px rgba(0,0,0,0.2);border-radius:8px;overflow:hidden;';
  
  // Create iframe for the panel
  const panelFrame = document.createElement('iframe');
  panelFrame.id = 'student-absence-panel-frame';
  panelFrame.style.cssText = 'width:320px;height:300px;border:none;border-radius:8px;';
  panelFrame.src = chrome.runtime.getURL('panel.html');
  
  // Add drag handle
  const dragHandle = document.createElement('div');
  dragHandle.id = 'student-absence-panel-drag';
  dragHandle.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:25px;cursor:move;background:transparent;';
  
  // Assemble and append to document
  panelContainer.appendChild(panelFrame);
  panelContainer.appendChild(dragHandle);
  document.body.appendChild(panelContainer);
  
  // Make the panel draggable
  makeDraggable(panelContainer, dragHandle);
}

// Function to make an element draggable
function makeDraggable(element, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  handle.addEventListener('mousedown', dragMouseDown);
  
  function dragMouseDown(e) {
    e.preventDefault();
    // Get cursor position
    pos3 = e.clientX;
    pos4 = e.clientY;
    // Add document event listeners
    document.addEventListener('mouseup', closeDragElement);
    document.addEventListener('mousemove', elementDrag);
  }
  
  function elementDrag(e) {
    e.preventDefault();
    // Calculate new position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // Set new position
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }
  
  function closeDragElement() {
    // Remove document event listeners
    document.removeEventListener('mouseup', closeDragElement);
    document.removeEventListener('mousemove', elementDrag);
  }
}

// Function to toggle panel visibility
function togglePanelVisibility() {
  const panel = document.getElementById('student-absence-panel-container');
  if (panel) {
    panelVisible = !panelVisible;
    panel.style.display = panelVisible ? 'block' : 'none';
  }
}

// Function to send a message to the panel iframe
function sendMessageToPanel(message) {
  console.log("Attempting to send message to panel:", message);
  
  const panel = document.getElementById('student-absence-panel-frame');
  if (panel && panel.contentWindow) {
    // Check if panel is fully loaded
    if (panel.contentDocument && panel.contentDocument.readyState === 'complete') {
      try {
        panel.contentWindow.postMessage(message, '*');
        console.log("Message sent to panel successfully");
      } catch (err) {
        console.error("Error sending message to panel:", err);
      }
    } else {
      // Try again after a short delay
      console.log("Panel not ready, retrying after delay");
      setTimeout(() => sendMessageToPanel(message), 200);
    }
  } else {
    console.log("Panel element not found or contentWindow not available");
  }
}

// Helper function to find elements containing specific text
function findElementsContainingText(text) {
  const elements = [];

  // Try data attributes first
  const dataElements = document.querySelectorAll(
    `[data-student-id="${text}"], [data-enrollment-id="${text}"]`
  );
  if (dataElements.length) {
    return Array.from(dataElements);
  }

  // If no data attributes found, try text content
  const allElements = document.querySelectorAll("td, th, span, div, p");
  return Array.from(allElements).filter(el => el.textContent.includes(text));
}

// Helper function to find the closest table row
function findClosestRow(element) {
  // Check if element is a row
  if (element.tagName === "TR") {
    return element;
  }

  // Try to find parent row
  let current = element;
  while (current && current !== document.body) {
    if (current.tagName === "TR") {
      return current;
    }
    current = current.parentElement;
  }

  // Try to find a row containing this element's text
  const text = element.textContent.trim();
  const rows = document.querySelectorAll("tr");
  return Array.from(rows).find(row => row.textContent.includes(text)) || null;
}

// Helper function to show feedback on the webpage
function showFeedbackOnPage(checkboxCount, studentsFound, totalStudents) {
  // Remove existing feedback
  const existingFeedback = document.getElementById("extension-feedback");
  if (existingFeedback) {
    existingFeedback.remove();
  }

  // Create feedback element
  const feedbackElement = document.createElement("div");
  feedbackElement.id = "extension-feedback";
  feedbackElement.style.cssText = "position:fixed;bottom:20px;right:20px;padding:10px;background-color:#4285f4;color:white;border-radius:8px;z-index:9999;box-shadow:0 2px 10px rgba(0,0,0,0.2);";
  feedbackElement.textContent = `Marked ${studentsFound} out of ${totalStudents} student(s)`;

  // Add to page and remove after delay
  document.body.appendChild(feedbackElement);
  setTimeout(() => {
    if (feedbackElement && feedbackElement.parentNode) {
      feedbackElement.remove();
    }
  }, 3000);
}

// Listen for messages from the panel iframe
window.addEventListener('message', function(event) {
  // Handle messages from our panel
  if (event.data && event.data.from === "panel") {
    if (event.data.action === "untickAbsent") {
      const result = processAbsentIds(event.data.absentIds);
      sendMessageToPanel(result);
    }
    else if (event.data.action === "togglePanel") {
      togglePanelVisibility();
    }
  }
});