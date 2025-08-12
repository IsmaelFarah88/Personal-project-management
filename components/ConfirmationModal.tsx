
import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]"
      aria-labelledby="confirmation-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-800/50 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
            </div>
            <div className="ms-4 text-start flex-grow">
              <h3 className="text-lg font-bold leading-6 text-white" id="confirmation-title">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-400">{message}</p>
              </div>
            </div>
             <button
                type="button"
                className="ms-2 text-gray-400 hover:text-white"
                onClick={onClose}
              >
                <span className="sr-only">إغلاق</span>
                <CloseIcon className="h-6 w-6" />
              </button>
          </div>
        </div>
        <div className="bg-gray-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800 sm:ms-3 sm:w-auto sm:text-sm"
            onClick={onConfirm}
          >
            تأكيد
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 sm:mt-0 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
