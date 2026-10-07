import { useEffect, useRef, useState } from 'react';

export default function useClipboard() {
    const [status, setStatus] = useState('idle');
    const timer = useRef(null);
    useEffect(() => () => clearTimeout(timer.current), []);
    const copy = async (text) => {
        clearTimeout(timer.current);
        try {
            await navigator.clipboard.writeText(text);
            setStatus('copied');
        } catch {
            // Never claim success when the browser denied the operation.
            setStatus('error');
        }
        timer.current = setTimeout(() => setStatus('idle'), 2500);
    };
    return { copied: status === 'copied', copyError: status === 'error', copy };
}
