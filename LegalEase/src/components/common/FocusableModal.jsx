import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * A modal component that ensures proper focus management
 */
const FocusableModal = ({ isOpen, onClose, title, children, footer }) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Trap focus inside the modal when it's open
  useEffect(() => {
    if (!isOpen) return;
    
    // Store previously focused element to restore later
    previousFocusRef.current = document.activeElement;
    
    // Focus the modal itself
    if (modalRef.current) {
      modalRef.current.focus();
    }
    
    // Add body class to prevent scrolling
    document.body.classList.add('modal-open');
    
    // Focus trap and keyboard handling
    const handleKeyDown = (e) => {
      // Close on escape
      if (e.key === 'Escape') {
        onClose();
      }
      
      // Trap focus with Tab
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open');
      
      // Return focus to previous element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);
  
  // Don't render if not open
  if (!isOpen) return null;
  
  // Use a portal to ensure proper stacking in the DOM
  return createPortal(
    <div className="modal-backdrop show" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050
    }}>
      <div 
        className="modal-dialog modal-lg" 
        style={{
          margin: '30px auto',
          maxWidth: '800px',
          width: '100%',
          position: 'relative',
          zIndex: 1060
        }}
      >
        <div 
          className="modal-content" 
          ref={modalRef} 
          tabIndex="-1" 
          aria-modal="true" 
          role="dialog"
        >
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button 
              type="button" 
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body" style={{maxHeight: '70vh', overflowY: 'auto'}}>
            {children}
          </div>
          {footer && (
            <div className="modal-footer">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FocusableModal;
