import { CheckIcon, SparklesIcon } from './Icons';

export default function Toast({ toast, onClose }) {
    return (
        <div className="toast-region" role="status" aria-live="polite" aria-atomic="true">
            {toast && (
                <div className={`toast-notification ${toast.type}`}>
                    <div className="toast-icon" aria-hidden="true">
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
            )}
        </div>
    );
}
