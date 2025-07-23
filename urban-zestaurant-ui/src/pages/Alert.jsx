import React from 'react';
import '../styles/Alert.css';

const icons = {
  success: '✔️',
  info: 'ℹ️',
  warning: '⚠️',
  error: '❗'
};

const Alert = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  return (
    <div className="toast-container">
      <div className={`toast toast-${type}`}>
        <div className="toast-icon">{icons[type]}</div>
        <div className="toast-message">{message}</div>
        <button className="toast-close" onClick={onClose}>✖</button>
      </div>
    </div>
  );
};

export default Alert;
