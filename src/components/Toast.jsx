import { CheckIcon, SparklesIcon } from './Icons';

export default function Toast({ toast, onClose }) {
    if (!toast) return null;

    return (
        <div className={`toast-notification ${toast.type}`} role="status">
            <div className="toast-icon">
                {toast.type === 'success' ? (
                    <CheckIcon size={16} />
                ) : (
                    <SparklesIcon size={16} />
                )}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button
                type="button"
                className="toast-close"
                onClick={onClose}
                aria-label="Fermer la notification"
            >
                &times;
            </button>
        </div>
    );
}
