/**
 * Utility to fix Bootstrap modal focus issues
 */

// Function to initialize modals with proper focus handling
export const initializeModalFocus = (modalId) => {
  // Wait for modal to be visible
  setTimeout(() => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Find all focusable elements
    const focusableElements = modal.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    // Style them to ensure they're accessible
    focusableElements.forEach(el => {
      el.style.position = 'relative';
      el.style.zIndex = '10000';
    });
    
    // Focus the first input or select element
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) {
      firstInput.focus();
    }
  }, 150); // Give the modal animation time to complete
};

// Fix Bootstrap modal backdrop issue
export const fixModalBackdrop = () => {
  if (document.querySelectorAll('.modal-backdrop').length > 1) {
    // Remove excess backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop');
    for (let i = 1; i < backdrops.length; i++) {
      backdrops[i].remove();
    }
  }
  
  // Ensure body has proper modal open class
  if (document.querySelector('.modal.show')) {
    document.body.classList.add('modal-open');
  } else {
    document.body.classList.remove('modal-open');
  }
};
