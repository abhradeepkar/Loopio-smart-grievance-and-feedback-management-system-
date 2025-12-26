import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import './Popup.css';

const Popup = ({ isOpen, onClose, title, message, type = 'success', onConfirm, confirmText = 'OK', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-card" onClick={(e) => e.stopPropagation()}>
                <button className="popup-close" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className={`popup-header ${type}`}>
                    <div className="popup-icon-wrapper">
                        {type === 'success' ? (
                            <FaCheckCircle className="popup-icon" />
                        ) : (
                            <FaExclamationTriangle className="popup-icon" />
                        )}
                    </div>
                    <h3>{title}</h3>
                </div>

                <div className="popup-body">
                    <p>{message}</p>
                </div>

                <div className="popup-footer">
                    {type === 'danger' ? (
                        <>
                            <button className="btn-popup-cancel" onClick={onClose}>
                                {cancelText}
                            </button>
                            <button className="btn-popup-confirm danger" onClick={onConfirm}>
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button className="btn-popup-confirm success" onClick={onClose}>
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Popup;
