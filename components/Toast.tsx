
import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true); // Start fade-in animation
    const timer = setTimeout(() => {
      handleClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    // Allow time for fade-out animation before removing from DOM
    setTimeout(onClose, 300); 
  };

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-600/90' : 'bg-red-600/90';
  const borderColor = isSuccess ? 'border-green-500' : 'border-red-500';
  const Icon = isSuccess ? CheckCircleIcon : ExclamationTriangleIcon;

  return (
    <div
      role="alert"
      className={`w-full ${bgColor} backdrop-blur-sm text-white p-4 rounded-lg shadow-2xl border-l-4 ${borderColor} flex items-start gap-3 transition-all duration-300 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
    >
      <div className="flex-shrink-0 pt-0.5">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-grow">
        <p className="font-bold">{isSuccess ? 'نجاح' : 'خطأ'}</p>
        <p className="text-sm">{message}</p>
      </div>
      <div className="flex-shrink-0">
        <button onClick={handleClose} className="p-1 rounded-full hover:bg-white/20">
          <span className="sr-only">إغلاق</span>
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
