import { useEffect, useCallback, RefObject } from 'react';

const FOCUSABLE_SELECTORS = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function useFocusTrap<T extends HTMLElement>(ref: RefObject<T>, isOpen: boolean) {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Tab' && ref.current) {
            const focusableElements = Array.from(ref.current.querySelectorAll(FOCUSABLE_SELECTORS)) as HTMLElement[];
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (event.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        }
    }, [ref]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Optional: focus the first element in the trap when it opens
            const focusableElements = ref.current?.querySelectorAll(FOCUSABLE_SELECTORS) as NodeListOf<HTMLElement>;
            if (focusableElements.length > 0) {
                setTimeout(() => focusableElements[0].focus(), 50); // Timeout helps ensure the element is ready
            }
        } else {
            document.removeEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, handleKeyDown, ref]);
}
