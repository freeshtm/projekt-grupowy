import React from 'react';
import './LogoutModal.css';

function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Wylogowanie</h3>
        <p>Czy na pewno chcesz się wylogować?</p>
        
        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onClose}>
            Anuluj
          </button>
          <button className="modal-btn confirm" onClick={onConfirm}>
            Wyloguj się
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;