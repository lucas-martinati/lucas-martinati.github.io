import { useEffect, useRef } from 'react';

export default function useDialog(open) {
    const ref = useRef(null);
    useEffect(() => {
        const dialog = ref.current;
        if (!open || !dialog) return;
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = 'hidden';
        dialog.querySelector('button, a[href]')?.focus({ preventScroll: true });
        const keepFocusInside = (event) => {
            if (event.key !== 'Tab') return;
            const controls = [...dialog.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]')]
                .filter((element) => element.getClientRects().length > 0);
            const first = controls[0];
            const last = controls.at(-1);
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        };
        dialog.addEventListener('keydown', keepFocusInside);
        return () => {
            dialog.removeEventListener('keydown', keepFocusInside);
            dialog.close();
            document.body.style.overflow = previousOverflow;
            if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
        };
    }, [open]);
    return ref;
}
