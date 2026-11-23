import { useEffect, useRef } from 'react';

// One observer for the entire page; content is always visible without JavaScript.
let observer;
const meta = new WeakMap();
function getObserver() {
    observer ??= new IntersectionObserver((entries) => {
        const now = performance.now();
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            observer.unobserve(entry.target);
            const info = meta.get(entry.target);
            // Skip re-animating elements already visible in the initial viewport without forced reflow.
            if (!info || now - info.observedAt < 120) continue;
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                entry.target.animate([
                    { opacity: 0.6, transform: 'translateY(12px)' },
                    { opacity: 1, transform: 'translateY(0)' },
                ], { duration: 350, delay: info.delay * 1000, easing: 'ease-out' });
            }
        }
    }, { threshold: 0.01 });
    return observer;
}

export default function ScrollReveal({ children, delay = 0 }) {
    const ref = useRef(null);
    useEffect(() => {
        const element = ref.current;
        if (!('IntersectionObserver' in window) || !element?.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        meta.set(element, { delay, observedAt: performance.now() });
        const sharedObserver = getObserver();
        sharedObserver.observe(element);
        return () => sharedObserver.unobserve(element);
    }, [delay]);
    return <div ref={ref}>{children}</div>;
}
