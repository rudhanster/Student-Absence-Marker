// popup-modal.js
document.addEventListener('DOMContentLoaded', function() {
  // Developer info modal functionality
  document.getElementById('devInfoBtn').addEventListener('click', function() {
    document.getElementById('devModal').style.display = 'flex';
  });
  
  document.getElementById('devModalClose').addEventListener('click', function() {
    document.getElementById('devModal').style.display = 'none';
  });
  
  // Close modal when clicking outside
  document.getElementById('devModal').addEventListener('click', function(e) {
    if (e.target === this) {
      this.style.display = 'none';
    }
  });
  
  // FIXED: Set the modal close button text with proper Unicode character
  const modalCloseBtn = document.getElementById('devModalClose');
  if (modalCloseBtn) {
    modalCloseBtn.innerHTML = "\u00D7"; // Unicode for multiplication sign ×
  }
});