import { useCallback, useEffect, useRef, useState } from 'react';

export default function useClipboard() {
    const [status, setStatus] = useState('idle');
    const timer = useRef(null);
    useEffect(() => () => clearTimeout(timer.current), []);
    const reset = useCallback(() => {
        clearTimeout(timer.current);
        setStatus('idle');
    }, []);
    const copy = useCallback(async (text) => {
        clearTimeout(timer.current);
        let ok = false;
        try {
            await navigator.clipboard.writeText(text);
            setStatus('copied');
            ok = true;
        } catch {
            // Never claim success when the browser denied the operation.
            setStatus('error');
        }
        timer.current = setTimeout(() => setStatus('idle'), 2500);
        return ok;
    }, []);
    return { copied: status === 'copied', copyError: status === 'error', copy, reset };
}
