import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import './ToastContext.css';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 999999,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                pointerEvents: 'none',
                maxWidth: 'calc(100vw - 40px)',
                width: 'auto'
            }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        style={{
                            minWidth: 'min(300px, 100%)',
                            width: 'fit-content',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            background: toast.type === 'success' ? '#E6F8F0' : toast.type === 'error' ? '#FFEAEA' : '#E6FAFF',
                            borderLeft: `4px solid ${toast.type === 'success' ? '#01B574' : toast.type === 'error' ? '#FF5C5C' : '#00D2FF'}`,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            pointerEvents: 'auto',
                            color: toast.type === 'success' ? '#006D44' : toast.type === 'error' ? '#D32F2F' : '#0088A5',
                            wordBreak: 'break-word'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '18px' }}>
                            {toast.type === 'success' && <FaCheckCircle />}
                            {toast.type === 'error' && <FaExclamationCircle />}
                            {toast.type === 'info' && <FaInfoCircle />}
                        </div>
                        <span style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.6 }}
                        >
                            <FaTimes />
                        </button>
                    </div>
                ))}
            </div>

        </ToastContext.Provider>
    );
};
