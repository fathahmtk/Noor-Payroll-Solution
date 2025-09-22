import React, { useEffect, useState, useRef } from 'react';
import CloseIcon from '../icons/CloseIcon.tsx';
import { useFocusTrap } from '../../hooks/useFocusTrap.ts';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  const [isRendered, setIsRendered] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, isOpen);

  // This effect manages the mounting and unmounting of the modal
  // with animations for both entering and exiting.
  useEffect(() => {
    let openTimeout: ReturnType<typeof setTimeout>;
    let closeTimeout: ReturnType<typeof setTimeout>;

    if (isOpen) {
      setIsRendered(true);
      // A very short delay to allow the DOM to update before triggering the transition.
      openTimeout = setTimeout(() => {
        setShowContent(true);
      }, 20);
    } else {
      setShowContent(false);
      // Delay unmounting to allow the fade-out animation to complete.
      closeTimeout = setTimeout(() => {
        setIsRendered(false);
      }, 300); // Must match the duration in className (duration-300)
    }

    return () => {
      clearTimeout(openTimeout);
      clearTimeout(closeTimeout);
    };
  }, [isOpen]);

  // Handle Escape key press to close the modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);


  if (!isRendered) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        showContent ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div className="fixed inset-0 bg-black/60" aria-hidden="true"></div>

      <div
        ref={modalRef}
        className={`bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-lg transform transition-all duration-300 ${
          showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-muted-foreground hover:bg-secondary"
            aria-label="Close modal"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex justify-end items-center p-4 border-t border-border space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;